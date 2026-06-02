import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var pgPoolCached: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for cloud providers like Supabase/Vercel
  });
} else {
  // Prevent hot-reload from spamming connections in local development
  if (!globalThis.pgPoolCached) {
    globalThis.pgPoolCached = new Pool({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/paintit_feedback",
    });
  }
  pool = globalThis.pgPoolCached;
}

export { pool };
