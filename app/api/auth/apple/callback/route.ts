import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

/**
 * Apple OAuth Callback Handler
 *
 * TODO: Implement actual Apple Sign In flow
 * This is a placeholder that shows the structure
 *
 * Steps:
 * 1. Verify Apple ID token
 * 2. Extract user info from token
 * 3. Create or find user in database
 * 4. Create session and set cookie
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const idToken = formData.get('id_token') as string;
    const user = formData.get('user');

    if (!code || !idToken) {
      return NextResponse.redirect(new URL('/login?error=invalid_request', request.url));
    }

    // TODO: Verify Apple ID token
    // const jwt = require('jsonwebtoken');
    // const applePublicKey = await fetchApplePublicKey();
    // const decoded = jwt.verify(idToken, applePublicKey);

    // Parse user data if provided (only on first sign in)
    let userData = null;
    if (user) {
      userData = JSON.parse(user as string);
    }

    // Placeholder Apple user
    const appleUser = {
      email: 'apple-user@example.com',
      name: userData?.name
        ? `${userData.name.firstName} ${userData.name.lastName}`
        : 'Apple User',
    };

    // Find or create user
    let dbUser = await prisma.user.findUnique({
      where: { email: appleUser.email },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: appleUser.email,
          name: appleUser.name,
          email_verified: true,
        },
      });
    }

    // Create session
    const session = {
      id: dbUser.id,
      userId: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
    };

    const token = createSessionToken(session);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    // Redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('[OAuth Apple] Error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
