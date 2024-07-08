import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { Context } from "hono";
import { env } from "hono/adapter";

import type { EnvVars } from "@/types";

export function getDb(c: Context) {
  const { DATABASE_URL } = env<EnvVars>(c);
  const sql = neon(DATABASE_URL);
  return drizzle(sql);
}
