import postgres from "postgres";

import { getRuntimeDatabaseUrl } from "@/lib/db/env";

declare global {
  var __portfolioSql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  return postgres(getRuntimeDatabaseUrl(), {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  });
}

export const sql = global.__portfolioSql ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.__portfolioSql = sql;
}
