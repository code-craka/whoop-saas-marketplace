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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Company Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Company Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Company Details</h2>

          <form className="space-y-4">
            <div>
              <label className="label">Company Name</label>
              <input
                type="text"
                className="input"
                defaultValue={company.title}
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                defaultValue={company.email}
              />
            </div>

            <div>
              <label className="label">Website URL</label>
              <input
                type="url"
                className="input"
                defaultValue={company.website_url || ''}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={4}
                defaultValue={company.description || ''}
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
            <button className="btn btn-primary btn-sm">+ Add Webhook</button>
          </div>

          {company.webhooks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No webhooks configured
            </p>
          ) : (
            <div className="space-y-3">
              {company.webhooks.map((webhook) => (
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
                    {webhook.events.map((event) => (
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
            <button className="btn btn-danger">Delete Company</button>
          </div>
        )}
      </div>
    </div>
  );
}
