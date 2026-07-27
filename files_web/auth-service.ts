// backend/src/services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  // ============================================
  // Password Management
  // ============================================

  /**
   * Hash password using bcrypt
   * @param password Plain text password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * @param password Plain text password
   * @param hash Hashed password
   * @returns true if password matches
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ============================================
  // JWT Token Management
  // ============================================

  /**
   * Generate access token (15 minute expiry)
   * @param user User object
   * @returns Access token string
   */
  generateAccessToken(user: User): string {
    const jti = Math.random().toString(36).substring(7);
    
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        jti,
      },
      process.env.JWT_ACCESS_SECRET!,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
        algorithm: 'HS256',
      }
    );
  }

  /**
   * Generate refresh token (7 day expiry)
   * @param user User object
   * @returns Refresh token string
   */
  generateRefreshToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
        algorithm: 'HS256',
      }
    );
  }

  /**
   * Verify access token
   * @param token JWT token
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
      ) as TokenPayload;
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   * @param token JWT token
   * @returns Decoded payload or null if invalid
   */
  verifyRefreshToken(token: string): any {
    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!
      );
      return payload;
    } catch (error) {
      return null;
    }
  }

  // ============================================
  // User Registration
  // ============================================

  /**
   * Register new user
   * @param email User email
   * @param password Plain text password
   * @param fullName User's full name
   * @returns AuthResponse with tokens
   */
  async signup(
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user in database
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        full_name: fullName,
        password_hash: passwordHash,
        role: 'user',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    const user: User = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      created_at: data.created_at,
    };

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Log signup event
    await this.auditLog('SIGNUP', user.id, { email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // ============================================
  // User Login
  // ============================================

  /**
   * Login user with email and password
   * @param email User email
   * @param password Plain text password
   * @returns AuthResponse with tokens
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const { data: userData, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !userData) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await this.verifyPassword(
      password,
      userData.password_hash
    );

    if (!passwordMatch) {
      // Log failed attempt
      await this.auditLog('LOGIN_FAILED', userData.id, { email });
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (userData.status === 'inactive') {
      throw new Error('Account has been deactivated');
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      created_at: userData.created_at,
    };

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update last login
    await this.supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Log successful login
    await this.auditLog('LOGIN', user.id, { email });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // ============================================
  // Token Refresh
  // ============================================

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token string
   * @returns New access token
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Get user from database
    const { data: userData, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', payload.sub)
      .single();

    if (error || !userData) {
      throw new Error('User not found');
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      created_at: userData.created_at,
    };

    // Generate new access token
    const newAccessToken = this.generateAccessToken(user);

    // Log token refresh
    await this.auditLog('TOKEN_REFRESH', user.id, {});

    return newAccessToken;
  }

  // ============================================
  // User Profile
  // ============================================

  /**
   * Get user profile by ID
   * @param userId User ID
   * @returns User object
   */
  async getUserProfile(userId: string): Promise<User> {
    const { data: userData, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      throw new Error('User not found');
    }

    return {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      created_at: userData.created_at,
    };
  }

  /**
   * Update user profile
   * @param userId User ID
   * @param updates Partial user object with updates
   * @returns Updated user object
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<User> {
    const allowedFields = ['full_name'];
    const safeUpdates: any = {};

    for (const field of allowedFields) {
      if (field in updates) {
        safeUpdates[field] = updates[field as keyof User];
      }
    }

    const { data: userData, error } = await this.supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    // Log profile update
    await this.auditLog('PROFILE_UPDATE', userId, { fields: Object.keys(safeUpdates) });

    return {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      created_at: userData.created_at,
    };
  }

  // ============================================
  // Audit Logging
  // ============================================

  /**
   * Log security-relevant actions
   * @param action Action name
   * @param userId User ID
   * @param details Additional details
   */
  private async auditLog(
    action: string,
    userId: string,
    details: any
  ): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: userId,
        action,
        details: JSON.stringify(details),
        ip_address: 'N/A', // Will be passed from middleware
        user_agent: 'N/A', // Will be passed from middleware
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Log but don't throw - audit logging shouldn't break auth flow
      console.error('Failed to log audit event:', error);
    }
  }
}

export default new AuthService();
export { User, TokenPayload, AuthResponse };
