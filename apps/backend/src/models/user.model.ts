export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  email_verified: boolean;
  email_verified_at?: string;
  last_device_info?: string; // JSON string with device fingerprint
}
