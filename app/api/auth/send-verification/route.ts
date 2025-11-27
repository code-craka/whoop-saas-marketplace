import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

/**
 * Send verification email to current user
 */
export async function POST() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { email: true, email_verified: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate token and send email
    const token = await generateVerificationToken(session.id);
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('[Send Verification] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
