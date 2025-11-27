import { requireAuth } from '@/lib/auth';
import { SiteHeader } from '@/components/site-header';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await requireAuth();

  // Get user's companies
  const companies = await prisma.companyUser.findMany({
    where: { user_id: session.id },
    include: {
      company: {
        include: {
          _count: {
            select: {
              products: true,
              memberships: { where: { status: 'active' } },
              payments: { where: { status: 'succeeded' } },
            },
          },
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // If user has only one company, redirect to that company's dashboard
  if (companies.length === 1) {
    redirect(`/dashboard/${companies[0].company.id}`);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <SiteHeader user={session} />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12 stagger-1">
          <h1 className="text-5xl font-black text-white mb-4">
            Your <span className="text-primary-500">Companies</span>
          </h1>
          <p className="text-xl text-gray-400 font-mono">
            {'>'} Select a company to manage_
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="bg-[#12121a] border border-primary-500/30 p-12 text-center stagger-2">
            <div className="text-6xl mb-6">🏢</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Companies Yet</h2>
            <p className="text-gray-400 mb-8">
              You&apos;re not associated with any companies. Create one to get started.
            </p>
            <Link
              href="/companies/create"
              className="inline-block px-8 py-3 bg-primary-500 text-black font-bold hover:shadow-[0_0_20px_rgba(0,255,157,0.5)] transition-shadow"
            >
              [CREATE_COMPANY]
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((companyUser, i) => (
              <Link
                key={companyUser.id}
                href={`/dashboard/${companyUser.company.id}`}
                className={`group bg-[#12121a] border border-primary-500/30 p-6 hover:border-primary-500 hover:shadow-[0_0_20px_rgba(0,255,157,0.2)] transition-all cursor-pointer stagger-${i + 2}`}
              >
                <div className="flex items-start justify-between mb-4">
                  {companyUser.company.logo_url ? (
                    <img
                      src={companyUser.company.logo_url}
                      alt={companyUser.company.title}
                      className="w-16 h-16 rounded-lg border-2 border-primary-500"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary-500/20 border-2 border-primary-500 flex items-center justify-center">
                      <span className="text-2xl font-black text-primary-500">
                        {companyUser.company.title[0].toUpperCase()}
                      </span>
                    </div>
                  )}

                  <span
                    className={`px-3 py-1 text-xs font-bold ${
                      companyUser.role === 'owner'
                        ? 'bg-primary-500/20 border border-primary-500 text-primary-500'
                        : companyUser.role === 'admin'
                        ? 'bg-warning-500/20 border border-warning-500 text-warning-500'
                        : 'bg-gray-500/20 border border-gray-500 text-gray-400'
                    }`}
                  >
                    {companyUser.role.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-500 transition-colors">
                  {companyUser.company.title}
                </h3>
                <p className="text-sm text-gray-400 font-mono mb-4">
                  {companyUser.company.email}
                </p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#0a0a0f] p-3 rounded">
                    <div className="text-2xl font-black text-primary-500">
                      {companyUser.company._count.products}
                    </div>
                    <div className="text-xs text-gray-500">Products</div>
                  </div>
                  <div className="bg-[#0a0a0f] p-3 rounded">
                    <div className="text-2xl font-black text-primary-500">
                      {companyUser.company._count.memberships}
                    </div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div className="bg-[#0a0a0f] p-3 rounded">
                    <div className="text-2xl font-black text-primary-500">
                      {companyUser.company._count.payments}
                    </div>
                    <div className="text-xs text-gray-500">Payments</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-mono">
                    {companyUser.company.status}
                  </span>
                  <span className="text-primary-500 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/companies/create"
            className="inline-block px-8 py-3 border-2 border-primary-500 text-primary-500 font-bold hover:bg-primary-500 hover:text-black transition-colors"
          >
            [CREATE_NEW_COMPANY]
          </Link>
        </div>
      </main>
    </div>
  );
}
