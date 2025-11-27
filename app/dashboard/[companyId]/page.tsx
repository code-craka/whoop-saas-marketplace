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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.title}
                  className="w-12 h-12 rounded-lg border border-white/10"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{company.title}</h1>
                <p className="text-gray-400 font-mono text-sm">{company.email}</p>
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
                {company.status.toUpperCase()}
              </span>
              {access.role === 'owner' && (
                <a
                  href={`/dashboard/${companyId}/settings`}
                  className="px-4 py-2 text-sm border border-primary-500/30 text-primary-500 hover:bg-primary-500/10 transition-colors rounded-md font-medium"
                >
                  Settings
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="PRODUCTS"
            value={company._count.products}
            icon="📦"
            color="primary"
          />
          <StatCard
            title="ACTIVE_MEMBERS"
            value={company._count.memberships}
            icon="👥"
            color="success"
          />
          <StatCard
            title="TOTAL_REVENUE"
            value={`$${(totalRevenue / 100).toFixed(2)}`}
            icon="💰"
            color="accent"
            subtitle="30 days"
          />
          <StatCard
            title="NET_REVENUE"
            value={`$${(netRevenue / 100).toFixed(2)}`}
            icon="📈"
            color="primary"
            subtitle="30 days"
          />
        </div>

        {/* Recent Payments */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white font-mono">
              [RECENT_PAYMENTS]
            </h2>
            <a
              href={`/dashboard/${companyId}/payments`}
              className="text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors"
            >
              View all →
            </a>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No payments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>USER_ID</th>
                    <th>DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="font-medium text-white">
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
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-gray-400 text-xs font-mono">
                        {payment.user_id?.slice(0, 12)}...
                      </td>
                      <td className="text-gray-400">
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
            <h2 className="text-xl font-semibold text-white font-mono">
              [TEAM_MEMBERS]
            </h2>
            {access.role === 'owner' && (
              <button className="px-4 py-2 bg-primary-500 text-[#0a0a0f] hover:bg-primary-400 transition-colors rounded-md font-medium text-sm">
                Invite Member
              </button>
            )}
          </div>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  {member.user.avatar_url ? (
                    <img
                      src={member.user.avatar_url}
                      alt={member.user.name || member.user.email}
                      className="w-10 h-10 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center">
                      <span className="text-primary-500 font-semibold">
                        {member.user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-white">
                      {member.user.name || member.user.email}
                    </div>
                    <div className="text-sm text-gray-400 font-mono">
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
                    {member.role.toUpperCase()}
                  </span>
                  {access.role === 'owner' && member.role !== 'owner' && (
                    <button className="text-gray-400 hover:text-error-500 text-sm transition-colors">
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
// STAT CARD COMPONENT - Cyberpunk Theme
// ============================================================================

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: 'primary' | 'accent' | 'success';
  subtitle?: string;
}) {
  const colorClasses = {
    primary: 'text-primary-500 bg-primary-500/10 border-primary-500/30',
    accent: 'text-accent-500 bg-accent-500/10 border-accent-500/30',
    success: 'text-success-500 bg-success-500/10 border-success-500/30',
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-xl hover:border-primary-500/30 transition-all group">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-mono font-medium uppercase tracking-wider text-gray-400 mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1 font-mono">{subtitle}</p>
          )}
        </div>
        <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg border`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
