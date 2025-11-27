/**
 * Main Dashboard Page - B2B Company Management
 *
 * Displays company overview with stats, recent payments, and team members
 * Implements role-based access control (owner/admin/member)
 *
 * @see CLAUDE.md for multi-tenant patterns
 */

import { requireAuth, requireCompanyAccess } from '@/lib/auth';
import { prisma, runInTenantContext } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface DashboardPageProps {
  params: Promise<{ companyId: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  // 1. Await params (Next.js 15)
  const { companyId } = await params;

  // 2. Require authentication
  const user = await requireAuth();

  // 3. Check company access (owner/admin/member)
  const access = await requireCompanyAccess(user.id, companyId);
  if (!access) {
    redirect('/unauthorized');
  }

  // 4. Load dashboard data with tenant isolation
  const dashboardData = await runInTenantContext({ companyId }, async () => {
    const [company, stats, recentPayments, teamMembers] = await Promise.all([
      // Company details
      prisma.company.findUnique({
        where: { id: companyId },
        include: {
          _count: {
            select: {
              products: true,
              memberships: { where: { status: 'active' } },
              payments: { where: { status: 'succeeded' } },
            },
          },
        },
      }),

      // Revenue stats (last 30 days)
      prisma.payment.aggregate({
        where: {
          company_id: companyId,
          status: 'succeeded',
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _sum: { amount: true, platform_fee_amount: true },
        _count: true,
      }),

      // Recent payments (last 10)
      prisma.payment.findMany({
        where: { company_id: companyId },
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          created_at: true,
          user_id: true,
        },
      }),

      // Team members
      prisma.companyUser.findMany({
        where: { company_id: companyId },
        include: {
          user: {
            select: { id: true, email: true, name: true, avatar_url: true },
          },
        },
      }),
    ]);

    return { company, stats, recentPayments, teamMembers };
  });

  if (!dashboardData.company) {
    redirect('/not-found');
  }

  const { company, stats, recentPayments, teamMembers } = dashboardData;

  // Calculate metrics
  const totalRevenue = Number(stats._sum.amount || 0);
  const totalFees = Number(stats._sum.platform_fee_amount || 0);
  const netRevenue = totalRevenue - totalFees;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.title}
                  className="w-12 h-12 rounded-lg"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold">{company.title}</h1>
                <p className="text-gray-600">{company.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`badge ${
                  company.status === 'active'
                    ? 'badge-success'
                    : company.status === 'pending_kyc'
                    ? 'badge-warning'
                    : 'badge-error'
                }`}
              >
                {company.status}
              </span>
              {access.role === 'owner' && (
                <a
                  href={`/dashboard/${companyId}/settings`}
                  className="btn btn-secondary btn-sm"
                >
                  Settings
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Products"
            value={company._count.products}
            icon="📦"
            color="blue"
          />
          <StatCard
            title="Active Members"
            value={company._count.memberships}
            icon="👥"
            color="green"
          />
          <StatCard
            title="Total Revenue (30d)"
            value={`$${(totalRevenue / 100).toFixed(2)}`}
            icon="💰"
            color="purple"
          />
          <StatCard
            title="Net Revenue (30d)"
            value={`$${(netRevenue / 100).toFixed(2)}`}
            icon="📈"
            color="indigo"
          />
        </div>

        {/* Recent Payments */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Payments</h2>
            <a
              href={`/dashboard/${companyId}/payments`}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </a>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>User ID</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="font-medium">
                        ${(Number(payment.amount) / 100).toFixed(2)}{' '}
                        {payment.currency.toUpperCase()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            payment.status === 'succeeded'
                              ? 'badge-success'
                              : payment.status === 'failed'
                              ? 'badge-error'
                              : 'badge-warning'
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs font-mono">
                        {payment.user_id?.slice(0, 12)}...
                      </td>
                      <td className="text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Team Members */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Team Members</h2>
            {access.role === 'owner' && (
              <button className="btn btn-primary btn-sm">Invite Member</button>
            )}
          </div>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {member.user.avatar_url ? (
                    <img
                      src={member.user.avatar_url}
                      alt={member.user.name || member.user.email}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {member.user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${
                      member.role === 'owner'
                        ? 'badge-success'
                        : member.role === 'admin'
                        ? 'badge-warning'
                        : 'badge-gray'
                    }`}
                  >
                    {member.role}
                  </span>
                  {access.role === 'owner' && member.role !== 'owner' && (
                    <button className="text-gray-400 hover:text-error-600 text-sm">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'indigo';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
