/**
 * WhopSaaS TypeScript SDK
 *
 * Lightweight client for the WhopSaaS API
 * Works in both browser and Node.js environments
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Product {
  id: string;
  company_id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  price_amount: number;
  price_minor_units: number;
  currency: string;
  plan_type: 'one_time' | 'monthly' | 'yearly';
  billing_period?: number | null;
  trial_days: number;
  active: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  type: 'platform' | 'sub_merchant';
  status: 'active' | 'pending_kyc' | 'suspended' | 'closed';
  title: string;
  email: string;
  slug: string;
  logo_url?: string | null;
  website_url?: string | null;
  description?: string | null;
  platform_fee_percent: number;
  payout_minimum_amount: number;
  payout_frequency: 'daily' | 'weekly' | 'monthly';
  stripe_account_id?: string | null;
  stripe_onboarded: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  product_id: string;
  company_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing';
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at?: string | null;
  canceled_at?: string | null;
  trial_end?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Webhook {
  id: string;
  company_id: string;
  url: string;
  events: string[];
  api_version: string;
  secret: string;
  active: boolean;
  created_at: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  details?: Array<Record<string, unknown>>;
}

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

export interface ClientConfig {
  baseUrl?: string;
  sessionToken?: string; // For server-side usage
  fetch?: typeof fetch; // Custom fetch implementation
}

// ============================================================================
// API CLIENT
// ============================================================================

export class WhopSaaSClient {
  private baseUrl: string;
  private sessionToken?: string;
  private fetchFn: typeof fetch;

  constructor(config: ClientConfig = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.sessionToken = config.sessionToken;
    this.fetchFn = config.fetch || globalThis.fetch;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add session token if provided (for server-side)
    if (this.sessionToken) {
      headers['Cookie'] = `session_token=${this.sessionToken}`;
    }

    const response = await this.fetchFn(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies (for browser)
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // ==========================================================================
  // PRODUCTS API
  // ==========================================================================

  products = {
    /**
     * List products
     */
    list: async (params: {
      company_id: string;
      active?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<{ products: Product[]; pagination: Pagination }> => {
      const query = new URLSearchParams({
        company_id: params.company_id,
        ...(params.active !== undefined && { active: String(params.active) }),
        ...(params.limit && { limit: String(params.limit) }),
        ...(params.offset && { offset: String(params.offset) }),
      });

      return this.request(`/api/products?${query}`);
    },

    /**
     * Create product
     */
    create: async (data: {
      company_id: string;
      title: string;
      description?: string;
      image_url?: string;
      price_amount?: number;
      price_minor_units?: number;
      currency?: string;
      plan_type: 'one_time' | 'monthly' | 'yearly';
      billing_period?: number;
      trial_days?: number;
      active?: boolean;
      metadata?: Record<string, unknown>;
    }): Promise<Product> => {
      return this.request('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get product by ID
     */
    get: async (id: string): Promise<Product> => {
      return this.request(`/api/products/${id}`);
    },

    /**
     * Update product
     */
    update: async (
      id: string,
      data: Partial<Omit<Product, 'id' | 'company_id' | 'created_at' | 'updated_at'>>
    ): Promise<Product> => {
      return this.request(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete product (soft delete)
     */
    delete: async (id: string): Promise<{ message: string; product: Product }> => {
      return this.request(`/api/products/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // ==========================================================================
  // COMPANIES API
  // ==========================================================================

  companies = {
    /**
     * List companies
     */
    list: async (params?: {
      role?: 'owner' | 'admin' | 'member';
      type?: 'platform' | 'sub_merchant';
      limit?: number;
      offset?: number;
    }): Promise<{ companies: Company[]; pagination: Pagination }> => {
      const query = new URLSearchParams({
        ...(params?.role && { role: params.role }),
        ...(params?.type && { type: params.type }),
        ...(params?.limit && { limit: String(params.limit) }),
        ...(params?.offset && { offset: String(params.offset) }),
      });

      return this.request(`/api/companies?${query}`);
    },

    /**
     * Create company
     */
    create: async (data: {
      title: string;
      email: string;
      type?: 'platform' | 'sub_merchant';
      logo_url?: string;
      website_url?: string;
      description?: string;
      platform_fee_percent?: number;
      payout_minimum_amount?: number;
      payout_frequency?: 'daily' | 'weekly' | 'monthly';
      metadata?: Record<string, unknown>;
    }): Promise<Company> => {
      return this.request('/api/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get company by ID
     */
    get: async (id: string): Promise<Company> => {
      return this.request(`/api/companies/${id}`);
    },

    /**
     * Update company
     */
    update: async (
      id: string,
      data: Partial<Omit<Company, 'id' | 'slug' | 'created_at' | 'updated_at'>>
    ): Promise<Company> => {
      return this.request(`/api/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  };

  // ==========================================================================
  // MEMBERSHIPS API
  // ==========================================================================

  memberships = {
    /**
     * List memberships
     */
    list: async (params?: {
      company_id?: string;
      user_id?: string;
      product_id?: string;
      status?: 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing';
      limit?: number;
      offset?: number;
    }): Promise<{ memberships: Membership[]; pagination: Pagination }> => {
      const query = new URLSearchParams({
        ...(params?.company_id && { company_id: params.company_id }),
        ...(params?.user_id && { user_id: params.user_id }),
        ...(params?.product_id && { product_id: params.product_id }),
        ...(params?.status && { status: params.status }),
        ...(params?.limit && { limit: String(params.limit) }),
        ...(params?.offset && { offset: String(params.offset) }),
      });

      return this.request(`/api/memberships?${query}`);
    },

    /**
     * Get membership by ID
     */
    get: async (id: string): Promise<Membership> => {
      return this.request(`/api/memberships/${id}`);
    },

    /**
     * Update membership
     */
    update: async (
      id: string,
      data: {
        status?: 'active' | 'past_due' | 'canceled' | 'expired' | 'trialing';
        cancel_at?: string | null;
        metadata?: Record<string, unknown> | null;
      }
    ): Promise<Membership> => {
      return this.request(`/api/memberships/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
  };

  // ==========================================================================
  // WEBHOOKS API
  // ==========================================================================

  webhooks = {
    /**
     * List webhooks
     */
    list: async (params: {
      company_id: string;
      active?: boolean;
      limit?: number;
      offset?: number;
    }): Promise<{ webhooks: Webhook[]; pagination: Pagination }> => {
      const query = new URLSearchParams({
        company_id: params.company_id,
        ...(params.active !== undefined && { active: String(params.active) }),
        ...(params.limit && { limit: String(params.limit) }),
        ...(params.offset && { offset: String(params.offset) }),
      });

      return this.request(`/api/webhooks?${query}`);
    },

    /**
     * Create webhook
     */
    create: async (data: {
      company_id: string;
      url: string;
      events: string[];
      api_version?: string;
      active?: boolean;
    }): Promise<Webhook & { warning: string }> => {
      return this.request('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get webhook by ID
     */
    get: async (id: string): Promise<Webhook> => {
      return this.request(`/api/webhooks/${id}`);
    },

    /**
     * Update webhook
     */
    update: async (
      id: string,
      data: {
        url?: string;
        events?: string[];
        api_version?: string;
        active?: boolean;
      }
    ): Promise<Webhook> => {
      return this.request(`/api/webhooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete webhook
     */
    delete: async (id: string): Promise<{ message: string; id: string }> => {
      return this.request(`/api/webhooks/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default WhopSaaSClient;
