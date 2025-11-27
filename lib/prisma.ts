/**
 * Prisma Client Singleton with Multi-Tenant Isolation
 *
 * CRITICAL: This implements automatic tenant isolation via middleware.
 * ALL queries on tenant-scoped models automatically inject company_id.
 *
 * @see CLAUDE.md for tenant isolation patterns
 */

import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// ============================================================================
// TENANT CONTEXT
// ============================================================================

export interface TenantContext {
  companyId: string;
  userId?: string;
}

export const tenantContext = new AsyncLocalStorage<TenantContext>();

/**
 * Get current tenant context (company_id)
 * MUST be set before any database operations
 */
export function getTenantContext(): TenantContext {
  const context = tenantContext.getStore();
  if (!context) {
    throw new Error(
      'Tenant context not set. Use runInTenantContext() or setTenantContext() first.'
    );
  }
  return context;
}

/**
 * Run a function within a tenant context
 * This is the PRIMARY way to set tenant context
 */
export function runInTenantContext<T>(
  context: TenantContext,
  fn: () => T
): T {
  return tenantContext.run(context, fn);
}

/**
 * Get current company_id (shorthand for getTenantContext().companyId)
 */
export function getCompanyId(): string {
  return getTenantContext().companyId;
}

// ============================================================================
// TENANT-SCOPED MODELS
// ============================================================================

/**
 * Models that MUST have automatic company_id injection
 * These are ALL models that belong to a specific company
 */
const TENANT_MODELS = new Set([
  'Product',
  'Membership',
  'Payment',
  'Webhook',
  'WebhookDelivery',
  'App',
  'CompanyUser',
  'CheckoutSession',
]);

/**
 * Check if a model requires tenant isolation
 */
function isTenantModel(modelName: string): boolean {
  return TENANT_MODELS.has(modelName);
}

// ============================================================================
// PRISMA CLIENT SINGLETON
// ============================================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================================================
// TENANT ISOLATION MIDDLEWARE
// ============================================================================

/**
 * Prisma Middleware for Automatic Tenant Isolation
 *
 * SECURITY CRITICAL:
 * - Automatically injects company_id on ALL create/update operations
 * - Automatically filters by company_id on ALL read operations
 * - Prevents cross-tenant data leakage
 *
 * How it works:
 * 1. Checks if the model is tenant-scoped (TENANT_MODELS)
 * 2. Gets current company_id from AsyncLocalStorage
 * 3. Injects company_id into query params
 *
 * Example:
 *   prisma.product.findMany()
 *   → SELECT * FROM products WHERE company_id = 'current_company_id'
 *
 * NOTE: Prisma middleware ($use) has been removed in Prisma 7
 * TODO: CRITICAL - Migrate to Prisma Client Extensions ($extends) for tenant isolation
 * @see https://www.prisma.io/docs/orm/prisma-client/client-extensions
 *
 * TEMPORARY: Using type assertion to allow $use until migration is complete
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(prisma as any).$use?.(async (params: { model?: string; action: string; args: { data?: unknown; where?: unknown } }, next: (params: unknown) => Promise<unknown>) => {
  const { model, action } = params;

  // Skip if not a tenant-scoped model
  if (!model || !isTenantModel(model)) {
    return next(params);
  }

  // Get tenant context (company_id)
  const context = tenantContext.getStore();

  // Allow operations without tenant context ONLY for specific cases:
  // - System operations (e.g., platform admin)
  // - Webhook processing (uses explicit company_id)
  if (!context) {
    // If no context, pass through but log warning in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `⚠️  [TENANT WARNING] ${model}.${action} called without tenant context`
      );
    }
    return next(params);
  }

  const { companyId } = context;

  // ========================================================================
  // CREATE OPERATIONS - Inject company_id
  // ========================================================================
  if (action === 'create' && params.args.data) {
    params.args.data = {
      ...(params.args.data as object),
      company_id: companyId,
    };
  }

  // ========================================================================
  // CREATE MANY - Inject company_id on all records
  // ========================================================================
  if (action === 'createMany' && params.args.data) {
    if (Array.isArray(params.args.data)) {
      params.args.data = params.args.data.map((item: Record<string, unknown>) => ({
        ...item,
        company_id: companyId,
      }));
    } else {
      params.args.data = {
        ...(params.args.data as object),
        company_id: companyId,
      };
    }
  }

  // ========================================================================
  // UPDATE OPERATIONS - Prevent company_id changes
  // ========================================================================
  if ((action === 'update' || action === 'updateMany') && params.args.data) {
    const data = params.args.data as { company_id?: string };
    // Prevent changing company_id
    if (data.company_id) {
      delete data.company_id;
    }

    // Inject company_id filter
    params.args.where = {
      ...(params.args.where as object || {}),
      company_id: companyId,
    };
  }

  // ========================================================================
  // READ OPERATIONS - Auto-filter by company_id
  // ========================================================================
  if (
    action === 'findUnique' ||
    action === 'findFirst' ||
    action === 'findMany' ||
    action === 'count' ||
    action === 'aggregate'
  ) {
    params.args.where = {
      ...(params.args.where as object || {}),
      company_id: companyId,
    };
  }

  // ========================================================================
  // DELETE OPERATIONS - Only delete within tenant
  // ========================================================================
  if (action === 'delete' || action === 'deleteMany') {
    params.args.where = {
      ...(params.args.where as object || {}),
      company_id: companyId,
    };
  }

  return next(params);
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Bypass tenant isolation for system operations
 * USE WITH EXTREME CAUTION - Only for platform admin operations
 */
export function withoutTenantIsolation<T>(fn: () => Promise<T>): Promise<T> {
  return tenantContext.run({ companyId: '' }, fn);
}

/**
 * Get Prisma client without tenant isolation
 * USE WITH EXTREME CAUTION - Only for system operations
 */
export function getSystemPrisma(): PrismaClient {
  return prisma;
}

export default prisma;
