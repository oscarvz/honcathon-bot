import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { EnvVars } from "@/types";

export function getDb(databaseUrl: EnvVars["DATABASE_URL"]) {
  const sql = neon(databaseUrl);
  return drizzle(sql);
}
