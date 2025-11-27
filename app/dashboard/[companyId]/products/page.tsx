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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Products</h1>
            <a
              href={`/dashboard/${companyId}/products/new`}
              className="btn btn-primary"
            >
              + Create Product
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No products yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first product to start selling
            </p>
            <a
              href={`/dashboard/${companyId}/products/new`}
              className="btn btn-primary"
            >
              Create Product
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="card-hover">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}

                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <span
                    className={`badge ${
                      product.active ? 'badge-success' : 'badge-gray'
                    }`}
                  >
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description || 'No description'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold">
                      ${(Number(product.price_amount) / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.plan_type === 'one_time'
                        ? 'One-time'
                        : product.plan_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {product._count.memberships}
                    </p>
                    <p className="text-xs text-gray-500">Active members</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/dashboard/${companyId}/products/${product.id}/edit`}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    Edit
                  </a>
                  <button className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
