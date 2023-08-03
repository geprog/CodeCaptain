import type { Config } from "drizzle-kit";

/**For config references visit  https://orm.drizzle.team/kit-docs/config-reference
 */

type Drivers = 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'; 
export default {
  schema: ["./db/schemas","./db/schemas/*"],
  out: "./db/migrations",
  driver: 'better-sqlite' satisfies Drivers,
  dbCredentials: {
    url: '',
  }
} satisfies Config;