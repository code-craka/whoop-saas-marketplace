/**
 * Email Utilities for Verification
 *
 * Using Resend for email delivery
 */

import { Resend } from 'resend';
import { nanoid } from 'nanoid';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const resend = new Resend(process.env.RESEND_API_KEY!);

/**
 * Generate email verification token
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store token in database (you might want to create a VerificationToken model)
  // For now, we'll use user metadata
  await prisma.user.update({
    where: { id: userId },
    data: {
      metadata: {
        verification_token: token,
        verification_expires: expiresAt.toISOString(),
      },
    },
  });

  return token;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Whop Marketplace <onboarding@resend.dev>', // Change to your verified domain
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0a0a0f;
              color: #ffffff;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #12121a;
              border: 2px solid #00ff9d;
              padding: 40px;
            }
            .header {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #00ff9d;
              font-family: monospace;
            }
            .content {
              font-size: 16px;
              line-height: 1.6;
              color: #d1d5db;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #00ff9d;
              color: #000000;
              text-decoration: none;
              font-weight: bold;
              font-family: monospace;
              border: none;
            }
            .button:hover {
              box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #6b7280;
              border-top: 1px solid #00ff9d33;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">&lt;WHOP/&gt;</div>

            <div class="content">
              <p>Welcome to Whop Marketplace!</p>
              <p>Click the button below to verify your email address and activate your account:</p>
            </div>

            <a href="${verificationUrl}" class="button">[VERIFY_EMAIL]</a>

            <div class="footer">
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
              <p style="margin-top: 20px; font-family: monospace; color: #00ff9d;">
                Verification URL: ${verificationUrl}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✓ Verification email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Still log to console for debugging
    console.log(`
=== EMAIL VERIFICATION (FALLBACK) ===
To: ${email}
Verification URL: ${verificationUrl}
=====================================
    `);
  }
}

/**
 * Verify email token and mark user as verified
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      metadata: {
        path: ['verification_token'],
        equals: token,
      },
    },
  });

  if (!user) {
    return false;
  }

  // Check if metadata exists and has the required fields
  const metadata = user.metadata as Record<string, string> | null;
  if (!metadata || !metadata.verification_expires) {
    return false;
  }

  // Check if token is expired
  const expiresAt = new Date(metadata.verification_expires);
  if (expiresAt < new Date()) {
    return false;
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      email_verified: true,
      metadata: Prisma.JsonNull, // Clear verification token
    },
  });

  return true;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Whop Marketplace <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #0a0a0f;
              color: #ffffff;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #12121a;
              border: 2px solid #ff006e;
              padding: 40px;
            }
            .header {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #ff006e;
              font-family: monospace;
            }
            .content {
              font-size: 16px;
              line-height: 1.6;
              color: #d1d5db;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #ff006e;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
              font-family: monospace;
              border: none;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #6b7280;
              border-top: 1px solid #ff006e33;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">&lt;WHOP/&gt;</div>

            <div class="content">
              <p>You requested to reset your password.</p>
              <p>Click the button below to create a new password:</p>
            </div>

            <a href="${resetUrl}" class="button">[RESET_PASSWORD]</a>

            <div class="footer">
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p style="margin-top: 20px; font-family: monospace; color: #ff006e;">
                Reset URL: ${resetUrl}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✓ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    console.log(`
=== PASSWORD RESET (FALLBACK) ===
To: ${email}
Reset URL: ${resetUrl}
=================================
    `);
  }
}
