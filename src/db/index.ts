import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

/**
 * Never throw (and never connect) at import time.
 *
 * `next build` collects page data for every route, which imports this module.
 * Throwing here when DATABASE_URL is missing fails the entire deployment with
 * "BUILD_UTILS_SPAWN_1: Command \"next build\" exited with 1" and leaves the
 * live site on an old build. A build must succeed without a database; the pool
 * stays inert until a query actually runs, and then fails fast.
 */
const databaseUrl = process.env.DATABASE_URL;

export const hasDatabase = Boolean(databaseUrl);

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool(
    databaseUrl
      ? { connectionString: databaseUrl }
      : { connectionTimeoutMillis: 1, max: 1 },
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
