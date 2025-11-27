'use server';

/**
 * Server Actions for Authentication
 *
 * These functions handle login and registration via Next.js server actions
 * They set cookies and return results to client components
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  loginUser,
  registerUser,
  createSessionToken,
  type LoginInput,
  type RegisterInput,
} from '@/lib/auth';

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Login action - called from login form
 */
export async function loginAction(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const input: LoginInput = { email, password };

    // Authenticate user
    const session = await loginUser(input);

    // Create JWT token
    const token = createSessionToken(session);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid credentials',
    };
  }
}

/**
 * Register action - called from register form
 */
export async function registerAction(formData: FormData): Promise<AuthResult> {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const input: RegisterInput = {
      email,
      password,
      name: name || undefined,
    };

    // Create user
    const session = await registerUser(input);

    // Create JWT token
    const token = createSessionToken(session);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    };
  }
}

/**
 * Logout action - clears session cookie
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
  redirect('/');
}
