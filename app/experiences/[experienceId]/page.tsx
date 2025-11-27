/**
 * Experience Page - B2C Iframe App
 *
 * Allows users to access products/experiences embedded in Whop dashboard
 * Authenticates via Whop token from iframe parent
 *
 * @see CLAUDE.md for Whop iframe authentication patterns
 */

import { verifyWhopToken } from '@/lib/whop-sdk';
import { authenticateWhopIframe } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

interface ExperiencePageProps {
  params: Promise<{ experienceId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function ExperiencePage({
  params,
  searchParams,
}: ExperiencePageProps) {
  // 1. Await async params (Next.js 15 requirement)
  const { experienceId } = await params;
  const { token } = await searchParams;

  // 2. Verify Whop token from iframe parent
  if (!token) {
    return <MissingTokenError />;
  }

  const tokenData = await verifyWhopToken(token);
  if (!tokenData) {
    return <InvalidTokenError />;
  }

  // 3. Authenticate and create/update user in database
  let authResult;
  try {
    authResult = await authenticateWhopIframe(token);
  } catch (error) {
    console.error('[Experience] Authentication failed:', error);
    return <AuthenticationFailedError />;
  }

  const { userId } = authResult;

  // 4. Load product and check access
  const product = await prisma.product.findUnique({
    where: { id: experienceId },
    include: { company: true },
  });

  if (!product) {
    return <ProductNotFoundError />;
  }

  // 5. Check if user has active membership
  const membership = await prisma.membership.findFirst({
    where: {
      user_id: userId,
      product_id: experienceId,
      status: 'active',
      OR: [
        { current_period_end: null },
        { current_period_end: { gte: new Date() } },
      ],
    },
  });

  if (!membership) {
    return (
      <NoAccessError productId={experienceId} productTitle={product.title} />
    );
  }

  // 6. Render protected experience
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-8">
      {/* Cyberpunk Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white font-mono">{product.title}</h1>
              <p className="text-gray-400">Welcome, {authResult.email}</p>
            </div>
            <div className="text-right">
              <div className="badge badge-success">ACTIVE_MEMBER</div>
              {membership.current_period_end && (
                <p className="text-sm text-gray-400 mt-2 font-mono">
                  Renews{' '}
                  {new Date(membership.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Experience</h2>

          {product.description && (
            <p className="text-gray-700 mb-6">{product.description}</p>
          )}

          {/* Display product metadata if exists */}
          {product.metadata && (
            <ProductMetadataDisplay
              metadata={product.metadata as Prisma.JsonObject}
            />
          )}

          <div className="mt-6 p-6 bg-primary-50 rounded-lg">
            <p className="text-gray-700">
              This is your premium content area. You have full access to this
              experience because you are an active member.
            </p>
          </div>
        </div>

        {/* Membership Details */}
        <div className="card mt-6">
          <h3 className="font-semibold mb-4">Membership Details</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="font-medium capitalize">{membership.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Started</dt>
              <dd className="font-medium">
                {new Date(membership.created_at).toLocaleDateString()}
              </dd>
            </div>
            {membership.current_period_start && (
              <div>
                <dt className="text-sm text-gray-500">Current Period</dt>
                <dd className="font-medium">
                  {new Date(
                    membership.current_period_start
                  ).toLocaleDateString()}{' '}
                  -{' '}
                  {membership.current_period_end
                    ? new Date(membership.current_period_end).toLocaleDateString()
                    : 'Ongoing'}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Company Info */}
        <div className="card mt-6">
          <h3 className="font-semibold mb-4">Provider</h3>
          <div className="flex items-center gap-3">
            {product.company.logo_url && (
              <img
                src={product.company.logo_url}
                alt={product.company.title}
                className="w-12 h-12 rounded-lg"
              />
            )}
            <div>
              <p className="font-medium">{product.company.title}</p>
              <p className="text-sm text-gray-500">{product.company.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR COMPONENTS
// ============================================================================

function MissingTokenError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md">
        <h1 className="text-2xl font-bold text-error-600 mb-2">
          Missing Token
        </h1>
        <p className="text-gray-600">
          Please access this app through the Whop dashboard.
        </p>
      </div>
    </div>
  );
}

function InvalidTokenError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md">
        <h1 className="text-2xl font-bold text-error-600 mb-2">
          Invalid Token
        </h1>
        <p className="text-gray-600">
          Your authentication token is invalid or expired. Please refresh the
          page.
        </p>
      </div>
    </div>
  );
}

function AuthenticationFailedError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md">
        <h1 className="text-2xl font-bold text-error-600 mb-2">
          Authentication Failed
        </h1>
        <p className="text-gray-600">
          Unable to authenticate your account. Please try again or contact
          support.
        </p>
      </div>
    </div>
  );
}

function ProductNotFoundError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md">
        <h1 className="text-2xl font-bold text-error-600 mb-2">
          Product Not Found
        </h1>
        <p className="text-gray-600">
          The product you&apos;re trying to access doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}

function NoAccessError({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="card max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">Access Required</h1>
        <p className="text-gray-600 mb-6">
          You need an active membership to access {productTitle}.
        </p>
        <a href={`/checkout?product_id=${productId}`} className="btn btn-primary">
          Purchase Access
        </a>
      </div>
    </div>
  );
}

function ProductMetadataDisplay({ metadata }: { metadata: Prisma.JsonObject }) {
  // TypeScript-safe metadata display
  const meta = metadata as Record<string, unknown>;

  return (
    <div className="bg-gray-50 p-4 rounded-md mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Product Info</h4>
      <pre className="text-xs text-gray-600 overflow-auto">
        {JSON.stringify(meta, null, 2)}
      </pre>
    </div>
  );
}
