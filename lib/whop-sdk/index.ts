/**
 * Whop SDK Integration
 *
 * Official Whop SDK wrapper with authentication and error handling
 *
 * SECURITY:
 * - Only use official @whop/api SDK
 * - Never manually parse JWT tokens
 * - Always verify tokens with Whop's servers
 *
 * @see CLAUDE.md for Whop integration patterns
 */

/**
 * Real Whop SDK Integration using @whop/api
 */
import { z } from 'zod';
import {
  WhopServerSdk,
  makeUserTokenVerifier,
  makeWebhookValidator,
} from '@whop/api';
import type { WhopClient, WhopTokenPayload } from './types';

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

const envSchema = z.object({
  WHOP_API_KEY: z.string().min(1, 'WHOP_API_KEY is required'),
  WHOP_APP_ID: z.string().min(1, 'WHOP_APP_ID is required').optional(),
  WHOP_WEBHOOK_SECRET: z.string().optional(),
});

const env = envSchema.parse({
  WHOP_API_KEY: process.env.WHOP_API_KEY,
  WHOP_APP_ID: process.env.WHOP_APP_ID,
  WHOP_WEBHOOK_SECRET: process.env.WHOP_WEBHOOK_SECRET,
});

// ============================================================================
// WHOP SDK CLIENT
// ============================================================================

/**
 * Singleton Whop SDK client
 * Used for all Whop API operations
 *
 * PRODUCTION: Real @whop/api SDK integration
 */
const whopSdk = WhopServerSdk({
  appApiKey: env.WHOP_API_KEY,
  appId: env.WHOP_APP_ID || '',
}) as WhopClient;

/**
 * Official Whop token verifier
 * NEVER manually parse JWT tokens - use this official verifier
 */
const userTokenVerifier = env.WHOP_APP_ID
  ? makeUserTokenVerifier({
      appId: env.WHOP_APP_ID,
      dontThrow: true,
    })
  : null;

/**
 * Webhook validator for verifying webhook signatures
 */
const webhookValidator = env.WHOP_WEBHOOK_SECRET
  ? makeWebhookValidator({
      webhookSecret: env.WHOP_WEBHOOK_SECRET,
    })
  : null;

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Verify Whop token from iframe
 *
 * Used in app/experiences/[experienceId] pages
 * Verifies the token parameter passed by Whop's iframe
 *
 * SECURITY CRITICAL: Uses official SDK - NEVER manually parse JWT
 *
 * @param token - Token from URL parameter (?token=xxx)
 * @returns Decoded token data with user and company info or null if invalid
 */
export async function verifyWhopToken(
  token: string
): Promise<WhopTokenPayload | null> {
  if (!userTokenVerifier) {
    console.warn('[Whop SDK] Token verifier not configured (missing WHOP_APP_ID)');
    return null;
  }

  try {
    // Use official SDK to verify token
    // DO NOT manually parse JWT - security risk
    const decoded = await userTokenVerifier(token);

    if (!decoded) {
      console.warn('[Whop SDK] Token verification returned null');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[Whop SDK] Token verification failed:', error);
    return null;
  }
}

/**
 * Get user from Whop API
 *
 * @param userId - Whop user ID (user_xxx)
 * @returns User data from Whop or null if not found
 */
export async function getWhopUser(userId: string) {
  try {
    const user = await whopSdk.users.getUser({
      userId,
    });

    if (!user) {
      console.warn(`[Whop SDK] User not found: ${userId}`);
      return null;
    }

    // PublicProfileUser type doesn't have email field
    // We'll use id and username which are available
    return {
      id: user.id,
      email: user.id, // Use ID as fallback for email
      name: user.name || null,
      username: user.username || null,
      profile_pic_url: user.profilePicture?.sourceUrl || null,
    };
  } catch (error) {
    console.error('[Whop SDK] Failed to get user:', error);
    return null;
  }
}

/**
 * Get company from Whop API
 *
 * @param companyId - Whop company ID (biz_xxx)
 * @returns Company data from Whop or null if not found
 */
export async function getWhopCompany(companyId: string) {
  try {
    const company = await whopSdk.companies.getCompany({
      companyId,
    });

    if (!company) {
      console.warn(`[Whop SDK] Company not found: ${companyId}`);
      return null;
    }

    // PublicCompany type doesn't have email field
    return {
      id: company.id,
      email: company.id, // Use ID as fallback for email
      name: company.title || null,
    };
  } catch (error) {
    console.error('[Whop SDK] Failed to get company:', error);
    return null;
  }
}

/**
 * Check if user has access to a specific product/experience
 *
 * @param experienceId - Experience/product ID
 * @param userId - User ID to check
 * @returns true if user has access, false otherwise
 */
export async function checkUserAccess(
  experienceId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await whopSdk.access.checkIfUserHasAccessToExperience({
      experienceId,
      userId,
    });

    // Result is HasAccessResult type with hasAccess boolean field
    return result.hasAccess || false;
  } catch (error) {
    console.error('[Whop SDK] Failed to check access:', error);
    return false;
  }
}

// ============================================================================
// WEBHOOK VERIFICATION
// ============================================================================

/**
 * Verify Whop webhook signature
 *
 * SECURITY CRITICAL:
 * - Always verify webhook signatures
 * - Use HMAC-SHA256 verification
 * - Prevent replay attacks
 *
 * @param req - Request object with webhook payload and signature
 * @returns Validated webhook data or null if invalid
 */
export async function verifyWhopWebhook(
  req: Request
): Promise<Record<string, unknown> | null> {
  if (!webhookValidator) {
    console.error('[Whop SDK] Webhook validator not configured (missing WHOP_WEBHOOK_SECRET)');
    return null;
  }

  try {
    // Use official SDK webhook verification
    const validated = await webhookValidator(req);

    if (!validated) {
      console.warn('[Whop SDK] Webhook signature validation failed');
      return null;
    }

    return validated as Record<string, unknown>;
  } catch (error) {
    console.error('[Whop SDK] Webhook verification error:', error);
    return null;
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class WhopError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'WhopError';
  }
}

/**
 * Handle Whop SDK errors
 *
 * Converts SDK errors to standardized format
 */
export function handleWhopError(error: unknown): never {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const err = error as { response?: { data?: { message?: string; code?: string }; status?: number } };
    throw new WhopError(
      err.response?.data?.message || 'Whop API error',
      err.response?.data?.code || 'WHOP_ERROR',
      err.response?.status
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown Whop error';
  throw new WhopError(message, 'UNKNOWN_ERROR');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default whopSdk;
export { env as whopEnv };
export type { WhopClient, WhopTokenPayload, WhopUser, WhopCompany, WhopMembership } from './types';
