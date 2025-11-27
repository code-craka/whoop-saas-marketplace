/**
 * Products Management Page
 *
 * Lists all products for a company with CRUD operations
 * Only accessible to owners and admins
 */

import { requireAuth, requireCompanyAccess } from '@/lib/auth';
import { prisma, runInTenantContext } from '@/lib/prisma';
import { redirect } from 'next/navigation';

interface ProductsPageProps {
  params: Promise<{ companyId: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { companyId } = await params;
  const user = await requireAuth();
  const access = await requireCompanyAccess(user.id, companyId);

  if (!access || !['owner', 'admin'].includes(access.role)) {
    redirect('/unauthorized');
  }

  const products = await runInTenantContext({ companyId }, async () => {
    return prisma.product.findMany({
      where: { company_id: companyId },
      include: {
        _count: {
          select: { memberships: { where: { status: 'active' } } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Cyberpunk Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white font-mono">[PRODUCTS]</h1>
            <a
              href={`/dashboard/${companyId}/products/new`}
              className="px-6 py-3 bg-primary-500 text-[#0a0a0f] hover:bg-primary-400 transition-colors rounded-md font-medium"
            >
              + Create Product
            </a>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-white">No products yet</h2>
            <p className="text-gray-400 mb-6">
              Create your first product to start selling
            </p>
            <a
              href={`/dashboard/${companyId}/products/new`}
              className="inline-block px-6 py-3 bg-primary-500 text-[#0a0a0f] hover:bg-primary-400 transition-colors rounded-md font-medium"
            >
              Create Product
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card-hover group">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-md mb-4 border border-white/10"
                  />
                )}

                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{product.title}</h3>
                  <span
                    className={`badge ${
                      product.active ? 'badge-success' : 'badge-gray'
                    }`}
                  >
                    {product.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {product.description || 'No description'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary-500">
                      ${(Number(product.price_amount) / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {product.plan_type === 'one_time'
                        ? 'ONE-TIME'
                        : product.plan_type.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {product._count.memberships}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">MEMBERS</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/dashboard/${companyId}/products/${product.id}/edit`}
                    className="flex-1 px-4 py-2 text-sm border border-white/20 text-white hover:bg-white/5 transition-colors rounded-md font-medium text-center"
                  >
                    Edit
                  </a>
                  <button className="px-4 py-2 text-sm border border-error-500/30 text-error-500 hover:bg-error-500/10 transition-colors rounded-md font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
