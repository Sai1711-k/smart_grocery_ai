// backend/src/services/product-service.ts
// Combines ProductService and RecommendationService
import { createClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  health_score: number;
  calories_per_unit: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

interface SearchFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  health_min?: number;
  sort_by?: 'price' | 'health_score' | 'popularity';
  limit?: number;
  offset?: number;
}

class ProductService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  /**
   * Search products with filters
   */
  async searchProducts(
    query: string,
    filters: SearchFilters = {}
  ): Promise<{ products: Product[]; total: number }> {
    let sql = this.supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Text search
    if (query) {
      sql = sql.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Category filter
    if (filters.category) {
      sql = sql.eq('category', filters.category);
    }

    // Price range filter
    if (filters.price_min !== undefined) {
      sql = sql.gte('price', filters.price_min);
    }
    if (filters.price_max !== undefined) {
      sql = sql.lte('price', filters.price_max);
    }

    // Health score filter
    if (filters.health_min !== undefined) {
      sql = sql.gte('health_score', filters.health_min);
    }

    // Sorting
    const sortBy = filters.sort_by || 'price';
    sql = sql.order(sortBy, { ascending: sortBy !== 'health_score' });

    // Pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    sql = sql.range(offset, offset + limit - 1);

    const { data, error, count } = await sql;

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return {
      products: data || [],
      total: count || 0,
    };
  }

  /**
   * Get product by ID with alternatives
   */
  async getProductWithAlternatives(productId: string): Promise<{
    product: Product;
    alternatives: Product[];
  }> {
    // Get main product
    const { data: product, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !product) {
      throw new Error('Product not found');
    }

    // Get alternatives (same category, different price)
    const { data: alternatives } = await this.supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', productId)
      .order('price', { ascending: true })
      .limit(5);

    return {
      product,
      alternatives: alternatives || [],
    };
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('category')
      .distinct();

    if (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return (data || []).map(item => item.category);
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('product_popularity')
      .select('*')
      .order('total_purchases', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch trending products: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get healthy alternatives
   */
  async getHealthierAlternatives(
    productId: string,
    limit: number = 5
  ): Promise<Product[]> {
    // Get the original product
    const { data: original } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!original) {
      return [];
    }

    // Find healthier alternatives in same category
    const { data: alternatives } = await this.supabase
      .from('products')
      .select('*')
      .eq('category', original.category)
      .gt('health_score', original.health_score)
      .order('health_score', { ascending: false })
      .limit(limit);

    return alternatives || [];
  }

  /**
   * Get budget-friendly alternatives
   */
  async getBudgetAlternatives(
    productId: string,
    limit: number = 5
  ): Promise<Product[]> {
    // Get the original product
    const { data: original } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!original) {
      return [];
    }

    // Find cheaper alternatives in same category
    const { data: alternatives } = await this.supabase
      .from('products')
      .select('*')
      .eq('category', original.category)
      .lt('price', original.price)
      .order('price', { ascending: true })
      .limit(limit);

    return alternatives || [];
  }
}

const productService = new ProductService();
export { productService, Product, SearchFilters };

// ============================================
// RecommendationService
// ============================================

interface Recommendation {
  id: string;
  product_id: string;
  reason_type: string;
  reason_text: string;
  confidence_score: number;
  product?: Product;
}

interface UserBehavior {
  frequentPurchases: { [key: string]: number };
  categorySpending: { [key: string]: number };
  healthScore: number;
  averageSpendPerWeek: number;
  lastPurchaseDate: Date;
  purchaseFrequencyDays: number;
}

class RecommendationService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  /**
   * Generate personalized recommendations for user
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      // Get user behavior analysis
      const behavior = await this.analyzeBehavior(userId);

      // Get user preferences
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Find products based on behavior
      const { data: recommendations } = await this.supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!recommendations) {
        return await this.generateBaselineRecommendations(userId, limit);
      }

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Get health-aware recommendations
   */
  async getHealthAwareRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      // Get user's current health score
      const healthScore = await this.calculateUserHealthScore(userId);

      // Get user preferences
      const { data: preferences } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      let query = this.supabase
        .from('products')
        .select('*')
        .gte('health_score', Math.max(healthScore + 10, 50));

      // Apply dietary restrictions
      if (preferences?.dietary_restrictions) {
        // Filter based on restrictions
      }

      const { data: products } = await query.limit(limit);

      return (products || []).map((product) => ({
        id: `rec-${product.id}`,
        product_id: product.id,
        reason_type: 'health_improvement',
        reason_text: `Healthier option in ${product.category}`,
        confidence_score: 0.8,
        product,
      }));
    } catch (error) {
      console.error('Error in health recommendations:', error);
      return [];
    }
  }

  /**
   * Get budget-friendly recommendations
   */
  async getBudgetFriendlyRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<Recommendation[]> {
    try {
      // Get user's spending pattern
      const { data: purchases } = await this.supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })
        .limit(30);

      if (!purchases || purchases.length === 0) {
        return [];
      }

      // Analyze frequent purchases
      const categoryMap: { [key: string]: number } = {};
      purchases.forEach((purchase) => {
        categoryMap[purchase.category] =
          (categoryMap[purchase.category] || 0) + purchase.total_price;
      });

      // Find budget alternatives for top spending categories
      const recommendations: Recommendation[] = [];

      for (const [category, spending] of Object.entries(categoryMap)) {
        const { data: cheaperAlternatives } = await this.supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .order('price', { ascending: true })
          .limit(3);

        if (cheaperAlternatives) {
          cheaperAlternatives.forEach((product, idx) => {
            recommendations.push({
              id: `rec-budget-${product.id}`,
              product_id: product.id,
              reason_type: 'budget_optimization',
              reason_text: `Save money with this option in ${category}`,
              confidence_score: 0.85 - idx * 0.05,
              product,
            });
          });
        }
      }

      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('Error in budget recommendations:', error);
      return [];
    }
  }

  /**
   * Get reminder recommendations (products user usually buys)
   */
  async getReminderRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // Get user's purchase frequency
      const { data: purchases } = await this.supabase
        .from('purchases')
        .select('product_id, purchase_date, COUNT(*)')
        .eq('user_id', userId)
        .order('purchase_date', { ascending: false })
        .limit(100);

      if (!purchases || purchases.length === 0) {
        return [];
      }

      // Calculate frequency for each product
      const productFrequency: {
        [key: string]: { count: number; lastDate: Date };
      } = {};

      purchases.forEach((p: any) => {
        if (!productFrequency[p.product_id]) {
          productFrequency[p.product_id] = { count: 0, lastDate: new Date() };
        }
        productFrequency[p.product_id].count++;
        productFrequency[p.product_id].lastDate = new Date(p.purchase_date);
      });

      // Get products that are due for reordering
      const recommendations: Recommendation[] = [];
      const now = new Date();

      for (const [productId, freq] of Object.entries(productFrequency)) {
        if (freq.count >= 3) {
          // At least 3 purchases
          const daysSinceLast = Math.floor(
            (now.getTime() - freq.lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const estimatedFrequencyDays = 90 / freq.count; // Based on 3-month history

          if (daysSinceLast > estimatedFrequencyDays * 0.8) {
            // Due soon
            const { data: product } = await this.supabase
              .from('products')
              .select('*')
              .eq('id', productId)
              .single();

            if (product) {
              recommendations.push({
                id: `rec-reminder-${productId}`,
                product_id: productId,
                reason_type: 'purchase_reminder',
                reason_text: `You usually buy this every ${Math.round(
                  estimatedFrequencyDays
                )} days`,
                confidence_score: 0.9,
                product,
              });
            }
          }
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Error in reminder recommendations:', error);
      return [];
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Analyze user shopping behavior
   */
  private async analyzeBehavior(userId: string): Promise<UserBehavior> {
    const { data: purchases } = await this.supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .gte(
        'purchase_date',
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      );

    if (!purchases || purchases.length === 0) {
      return {
        frequentPurchases: {},
        categorySpending: {},
        healthScore: 50,
        averageSpendPerWeek: 0,
        lastPurchaseDate: new Date(),
        purchaseFrequencyDays: 7,
      };
    }

    // Calculate metrics
    const categorySpending: { [key: string]: number } = {};
    let totalSpent = 0;

    purchases.forEach((p: any) => {
      categorySpending[p.category] =
        (categorySpending[p.category] || 0) + p.total_price;
      totalSpent += p.total_price;
    });

    const daysCovered = 90;
    const weeksCovered = daysCovered / 7;
    const averageSpendPerWeek = totalSpent / weeksCovered;

    return {
      frequentPurchases: categorySpending,
      categorySpending,
      healthScore: 50, // TODO: Calculate from products
      averageSpendPerWeek,
      lastPurchaseDate: new Date(purchases[0].purchase_date),
      purchaseFrequencyDays: daysCovered / purchases.length,
    };
  }

  /**
   * Calculate user's health score
   */
  private async calculateUserHealthScore(userId: string): Promise<number> {
    const { data, error } = await this.supabase.rpc(
      'calculate_user_health_score',
      { p_user_id: userId }
    );

    if (error) {
      console.error('Error calculating health score:', error);
      return 50;
    }

    return data || 50;
  }

  /**
   * Generate baseline recommendations for new users
   */
  private async generateBaselineRecommendations(
    userId: string,
    limit: number
  ): Promise<Recommendation[]> {
    const { data: topProducts } = await this.supabase
      .from('product_popularity')
      .select('*')
      .order('total_purchases', { ascending: false })
      .limit(limit);

    return (topProducts || []).map((product: any) => ({
      id: `rec-baseline-${product.id}`,
      product_id: product.id,
      reason_type: 'popular',
      reason_text: 'Popular among other users',
      confidence_score: 0.5,
    }));
  }
}

const recommendationService = new RecommendationService();
export { recommendationService, Recommendation, UserBehavior };
