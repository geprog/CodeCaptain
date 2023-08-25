import type { Config } from 'drizzle-kit';

// For config references visit  https://orm.drizzle.team/kit-docs/config-reference

export default {
  schema: ['./server/schemas/*.ts'],
  out: './server/db/migrations',
  dbCredentials: {
    url: 'code_captain.db',
  },
  driver: 'better-sqlite',
  breakpoints: true,
} satisfies Config;
