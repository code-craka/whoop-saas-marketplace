/**
 * Company Settings Page
 *
 * Manage company details, Stripe Connect, and webhooks
 * Only accessible to owners and admins
 */

import { requireAuth, requireCompanyAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface SettingsPageProps {
  params: Promise<{ companyId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { companyId } = await params;
  const user = await requireAuth();
  const access = await requireCompanyAccess(user.id, companyId);

  // Only owners and admins can access settings
  if (!access || !['owner', 'admin'].includes(access.role)) {
    redirect('/unauthorized');
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      webhooks: { where: { active: true } },
    },
  });

  if (!company) {
    redirect('/not-found');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white font-mono">[COMPANY_SETTINGS]</h1>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Company Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 text-white font-mono">[COMPANY_DETAILS]</h2>

          <form className="space-y-4">
            <div>
              <label htmlFor="company-name" className="label">Company Name</label>
              <input
                id="company-name"
                name="title"
                type="text"
                className="input"
                defaultValue={company.title}
                aria-label="Company Name"
              />
            </div>

            <div>
              <label htmlFor="company-email" className="label">Email</label>
              <input
                id="company-email"
                name="email"
                type="email"
                className="input"
                defaultValue={company.email}
                aria-label="Company Email"
              />
            </div>

            <div>
              <label htmlFor="company-website" className="label">Website URL</label>
              <input
                id="company-website"
                name="website_url"
                type="url"
                className="input"
                defaultValue={company.website_url || ''}
                placeholder="https://example.com"
                aria-label="Company Website URL"
              />
            </div>

            <div>
              <label htmlFor="company-description" className="label">Description</label>
              <textarea
                id="company-description"
                name="description"
                className="input"
                rows={4}
                defaultValue={company.description || ''}
                aria-label="Company Description"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </form>
        </div>

        {/* Stripe Connect */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Payment Processing</h2>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Stripe Connect</p>
              <p className="text-sm text-gray-600">
                {company.stripe_onboarded
                  ? 'Connected and ready to accept payments'
                  : 'Complete onboarding to accept payments'}
              </p>
            </div>
            <div>
              {company.stripe_onboarded ? (
                <span className="badge badge-success">Connected</span>
              ) : (
                <a
                  href={`/api/onboarding/stripe/create?company_id=${companyId}`}
                  className="btn btn-primary btn-sm"
                >
                  Connect Stripe
                </a>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Platform Fee</span>
              <span className="font-medium">
                {company.platform_fee_percent.toString()}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payout Frequency</span>
              <span className="font-medium capitalize">
                {company.payout_frequency}
              </span>
            </div>
          </div>
        </div>

        {/* Webhooks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Webhooks</h2>
            <button type="button" className="btn btn-primary btn-sm">+ Add Webhook</button>
          </div>

          {company.webhooks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No webhooks configured
            </p>
          ) : (
            <div className="space-y-3">
              {company.webhooks.map((webhook: { id: string; url: string; events: string[] }) => (
                <div
                  key={webhook.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {webhook.url}
                    </code>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {webhook.events.map((event: string) => (
                      <span key={event} className="badge badge-gray text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone (Owner only) */}
        {access.role === 'owner' && (
          <div className="card border-error-200">
            <h2 className="text-xl font-semibold text-error-600 mb-6">
              Danger Zone
            </h2>
            <button type="button" className="btn btn-danger">Delete Company</button>
          </div>
        )}
      </div>
    </div>
  );
}
