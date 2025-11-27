'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Update user profile information
 */
export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const name = formData.get('name') as string;
    const username = formData.get('username') as string;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: session.id },
        },
      });

      if (existingUser) {
        return { success: false, error: 'Username already taken' };
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: session.id },
      data: {
        name: name || null,
        username: username || null,
      },
    });

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('[Profile] Update failed:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

/**
 * Change user password
 */
export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: 'All fields are required' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { password_hash: true },
    });

    if (!user || !user.password_hash) {
      return { success: false, error: 'Invalid account' };
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.id },
      data: { password_hash: newPasswordHash },
    });

    return { success: true };
  } catch (error) {
    console.error('[Profile] Password change failed:', error);
    return { success: false, error: 'Failed to change password' };
  }
}
