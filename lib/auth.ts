/**
 * Authentication & Authorization Utilities
 *
 * SECURITY CRITICAL:
 * - Never manually parse JWT tokens
 * - Always use official Whop SDK for token verification
 * - Implement proper access control checks
 *
 * @see CLAUDE.md for authentication patterns
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyWhopToken } from './whop-sdk';
import prisma from './prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// ============================================================================
// JWT CONFIGURATION
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface UserSession {
  id: string; // User ID from our database
  userId: string; // Alias for id (for compatibility)
  email: string;
  name?: string;
}

export interface WhopSession extends UserSession {
  companyId: string;
  role: string;
  whopUserId: string;
  whopCompanyId: string;
}

// ============================================================================
// WHOP IFRAME AUTHENTICATION
// ============================================================================

/**
 * Verify Whop iframe token and create session
 *
 * Used in app/experiences/[experienceId] pages
 *
 * @param token - Token from URL parameter (?token=xxx)
 * @returns User and company information
 */
export async function authenticateWhopIframe(
  token: string
): Promise<WhopSession> {
  try {
    // Verify token with Whop SDK
    const decoded = await verifyWhopToken(token);

    if (!decoded) {
      throw new Error('Invalid token');
    }

    // Extract user ID from token (tokens only contain userId and appId)
    const whopUserId = decoded.userId;

    // Import SDK functions
    const { getWhopUser } = await import('./whop-sdk');

    // Fetch full user data from Whop API
    const whopUser = await getWhopUser(whopUserId);

    if (!whopUser || !whopUser.email) {
      throw new Error('Could not fetch user data from Whop');
    }

    // Find or create user in our database
    let user = await prisma.user.findFirst({
      where: { email: whopUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: whopUser.email,
          name: whopUser.name || undefined,
          username: whopUser.username || undefined,
          avatar_url: whopUser.profile_pic_url || undefined,
          email_verified: true,
        },
      });
    }

    // For iframe auth, we need to get company from context
    // The company should be determined by the experience the user is accessing
    // For now, we'll get the first company the user is associated with
    const companyUser = await prisma.companyUser.findFirst({
      where: { user_id: user.id },
      include: { company: true },
    });

    if (!companyUser) {
      throw new Error('User not associated with any company');
    }

    const company = companyUser.company;
    const whopCompanyId = company.id;

    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      companyId: company.id,
      role: companyUser.role,
      whopUserId,
      whopCompanyId,
    };
  } catch (error) {
    console.error('[Auth] Whop iframe authentication failed:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get Whop token from request
 *
 * Checks:
 * 1. URL parameter (?token=xxx)
 * 2. Authorization header (Bearer xxx)
 * 3. Cookie (whop_token)
 *
 * @returns Token string or null
 */
export async function getWhopToken(): Promise<string | null> {
  // Check URL parameter (for iframe apps)
  const headersList = await headers();
  const url = headersList.get('x-url') || '';
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const tokenFromUrl = urlParams.get('token');

  if (tokenFromUrl) {
    return tokenFromUrl;
  }

  // Check Authorization header
  const authHeader = headersList.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get('whop_token')?.value;

  return tokenFromCookie || null;
}

// ============================================================================
// PASSWORD-BASED AUTHENTICATION
// ============================================================================

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
  username: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Register a new user with password
 *
 * @param input - User registration data
 * @returns User session
 */
export async function registerUser(input: RegisterInput): Promise<UserSession> {
  const { email, password, name, username } = registerSchema.parse(input);

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password_hash: passwordHash,
      name,
      username,
      email_verified: false,
    },
  });

  return {
    id: user.id,
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
  };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Login user with email and password
 *
 * @param input - Login credentials
 * @returns User session
 */
export async function loginUser(input: LoginInput): Promise<UserSession> {
  const { email, password } = loginSchema.parse(input);

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password_hash: true,
    },
  });

  if (!user || !user.password_hash) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    userId: user.id,
    email: user.email,
    name: user.name || undefined,
  };
}

// ============================================================================
// JWT SESSION MANAGEMENT
// ============================================================================

/**
 * Create JWT token for user session
 *
 * @param session - User session data
 * @returns JWT token
 */
export function createSessionToken(session: UserSession): string {
  return jwt.sign(session, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT session token
 *
 * @param token - JWT token
 * @returns User session or null
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get current user session from cookie
 *
 * @returns User session or null
 */
export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

/**
 * Require authentication (redirect if not logged in)
 *
 * @param redirectTo - URL to redirect to if not authenticated
 * @returns User session
 */
export async function requireAuth(
  redirectTo = '/login'
): Promise<UserSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
}

// ============================================================================
// ACCESS CONTROL
// ============================================================================

/**
 * Check if user has access to a company
 *
 * @param userId - User ID
 * @param companyId - Company ID
 * @param requiredRole - Optional required role (owner, admin, member)
 * @returns true if user has access
 */
export async function checkCompanyAccess(
  userId: string,
  companyId: string,
  requiredRole?: 'owner' | 'admin' | 'member'
): Promise<boolean> {
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
    },
  });

  if (!companyUser) {
    return false;
  }

  // If no required role, just check membership
  if (!requiredRole) {
    return true;
  }

  // Role hierarchy: owner > admin > member
  const roleHierarchy: Record<string, number> = {
    owner: 3,
    admin: 2,
    member: 1,
  };

  const userRoleLevel = roleHierarchy[companyUser.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Require company access (throw error if no access)
 *
 * @param userId - User ID
 * @param companyId - Company ID
 * @param requiredRole - Optional required role
 * @returns CompanyUser with role information
 */
export async function requireCompanyAccess(
  userId: string,
  companyId: string,
  requiredRole?: 'owner' | 'admin' | 'member'
): Promise<{ id: string; role: string; user_id: string; company_id: string }> {
  const companyUser = await prisma.companyUser.findFirst({
    where: {
      user_id: userId,
      company_id: companyId,
    },
  });

  if (!companyUser) {
    throw new Error('Access denied');
  }

  // If required role specified, check hierarchy
  if (requiredRole) {
    const roleHierarchy: Record<string, number> = {
      owner: 3,
      admin: 2,
      member: 1,
    };

    const userRoleLevel = roleHierarchy[companyUser.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      throw new Error('Insufficient permissions');
    }
  }

  return companyUser;
}

/**
 * Check if user has access to a product
 *
 * @param userId - User ID
 * @param productId - Product ID
 * @returns true if user has active membership
 */
export async function checkProductAccess(
  userId: string,
  productId: string
): Promise<boolean> {
  const membership = await prisma.membership.findFirst({
    where: {
      user_id: userId,
      product_id: productId,
      status: 'active',
    },
  });

  return !!membership;
}

// ============================================================================
// EXPORTS
// ============================================================================

const authLib = {
  authenticateWhopIframe,
  getWhopToken,
  registerUser,
  loginUser,
  createSessionToken,
  verifySessionToken,
  getCurrentSession,
  requireAuth,
  checkCompanyAccess,
  requireCompanyAccess,
  checkProductAccess,
};

export default authLib;
