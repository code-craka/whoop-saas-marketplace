/**
 * License Key Validation Endpoint
 *
 * Validates license keys with hardware binding and activation limits
 * Used by client applications to verify access
 *
 * @see CLAUDE.md for license key patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const bodySchema = z.object({
  hardware_id: z.string().min(1),
  device_name: z.string().optional(),
  ip_address: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const body = bodySchema.parse(await req.json());

    // 1. Find license key
    const license = await prisma.licenseKey.findUnique({
      where: { key },
      include: {
        product: { select: { id: true, title: true, description: true } },
        user: { select: { id: true, email: true, username: true } },
      },
    });

    if (!license) {
      return NextResponse.json(
        { valid: false, reason: 'License not found' },
        { status: 404 }
      );
    }

    // 2. Check if active
    if (!license.active) {
      return NextResponse.json(
        { valid: false, reason: 'License inactive' },
        { status: 403 }
      );
    }

    // 3. Check expiration
    if (license.expires_at && license.expires_at < new Date()) {
      return NextResponse.json(
        { valid: false, reason: 'License expired' },
        { status: 403 }
      );
    }

    // 4. Hardware binding validation
    const metadata = (license.metadata || {}) as Prisma.JsonObject;
    const existingHardwareId = metadata.hardware_id as string | undefined;

    if (existingHardwareId && existingHardwareId !== body.hardware_id) {
      return NextResponse.json(
        {
          valid: false,
          reason: 'Hardware mismatch',
          details: 'This license is bound to a different device',
        },
        { status: 403 }
      );
    }

    // 5. Activation limit check
    if (
      license.current_activations >= license.max_activations &&
      !existingHardwareId
    ) {
      return NextResponse.json(
        {
          valid: false,
          reason: 'Activation limit reached',
          details: `Maximum ${license.max_activations} activation(s) allowed`,
        },
        { status: 403 }
      );
    }

    // 6. Update activation metadata
    const updatedMetadata: Prisma.JsonObject = {
      ...metadata,
      hardware_id: body.hardware_id,
      device_name: body.device_name,
      last_ip:
        body.ip_address ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        'unknown',
      last_validated: new Date().toISOString(),
    };

    await prisma.licenseKey.update({
      where: { id: license.id },
      data: {
        last_validated_at: new Date(),
        current_activations: existingHardwareId
          ? license.current_activations
          : { increment: 1 },
        metadata: updatedMetadata,
      },
    });

    // 7. Return success with product info
    return NextResponse.json({
      valid: true,
      product: {
        id: license.product.id,
        title: license.product.title,
        description: license.product.description,
      },
      user: {
        id: license.user.id,
        email: license.user.email,
        username: license.user.username,
      },
      expires_at: license.expires_at,
      activations: {
        current: license.current_activations + (existingHardwareId ? 0 : 1),
        max: license.max_activations,
      },
    });
  } catch (error) {
    console.error('[License Validation] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
