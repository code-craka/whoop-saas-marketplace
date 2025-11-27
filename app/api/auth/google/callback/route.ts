import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createSessionToken } from '@/lib/auth';

/**
 * Google OAuth Callback Handler
 *
 * TODO: Implement actual Google OAuth flow
 * This is a placeholder that shows the structure
 *
 * Steps:
 * 1. Exchange code for access token
 * 2. Fetch user info from Google
 * 3. Create or find user in database
 * 4. Create session and set cookie
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Exchange code for access token with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('[OAuth Google] Token exchange failed:', error);
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    const { access_token } = await tokenResponse.json();

    // Fetch user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userResponse.ok) {
      console.error('[OAuth Google] User info fetch failed');
      return NextResponse.redirect(new URL('/login?error=user_info_failed', request.url));
    }

    const googleUser = await userResponse.json();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          avatar_url: googleUser.picture,
          email_verified: true,
        },
      });
    }

    // Create session
    const session = {
      id: user.id,
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
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
    console.error('[OAuth Google] Error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}
