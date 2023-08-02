import type { Config } from "drizzle-kit";
 
export default {
  schema: ["./schemas","./schemas/*"],
  out: "./migrations",
} satisfies Config;