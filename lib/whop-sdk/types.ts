/**
 * Whop SDK Type Definitions
 *
 * Real types from @whop/api SDK
 */

import type {
  WhopServerSdk,
  UserTokenPayload,
} from '@whop/api';

/**
 * Re-export types from official Whop SDK
 */
export type WhopClient = ReturnType<typeof WhopServerSdk>;
export type WhopTokenPayload = UserTokenPayload;

/**
 * Additional custom types for our implementation
 */
export interface WhopUser {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  profile_pic_url?: string | null;
}

export interface WhopCompany {
  id: string;
  email: string;
  name?: string | null;
}

export interface WhopMembership {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
}

export interface WhopCheckoutSession {
  id: string;
  url: string;
  plan_id: string;
  company_id: string;
}
