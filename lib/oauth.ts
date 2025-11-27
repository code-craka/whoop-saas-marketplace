/**
 * OAuth Helper Functions
 */

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function getAppleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/apple/callback`,
    response_type: 'code id_token',
    response_mode: 'form_post',
    scope: 'name email',
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
}
