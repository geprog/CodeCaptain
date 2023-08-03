import type { Config } from "drizzle-kit";

type Drivers = 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'; // https://orm.drizzle.team/kit-docs/config-reference
 
export default {
  schema: ["./schemas","./schemas/*"],
  out: "./migrations",
  driver: 'better-sqlite' satisfies Drivers,
} satisfies Config;