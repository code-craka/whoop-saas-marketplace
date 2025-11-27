/**
 * Prisma 7 Configuration
 *
 * In Prisma 7, database connection configuration has moved from schema.prisma
 * to this TypeScript config file, allowing for more flexible runtime configuration.
 *
 * @see https://www.prisma.io/docs/orm/reference/prisma-config-reference
 */

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
