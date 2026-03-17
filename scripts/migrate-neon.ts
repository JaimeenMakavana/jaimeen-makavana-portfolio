import fs from "node:fs/promises";
import path from "node:path";

import dotenv from "dotenv";
import postgres from "postgres";

import { getDirectDatabaseUrl } from "../lib/db/env";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function main() {
  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  const sql = postgres(getDirectDatabaseUrl(), {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  });

  try {
    await sql`
      create table if not exists schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      )
    `;

    const appliedRows = await sql<{ filename: string }[]>`
      select filename from schema_migrations
    `;
    const applied = new Set(appliedRows.map((row) => row.filename));

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip ${file}`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      console.log(`apply ${file}`);
      const connection = await sql.reserve();

      try {
        await connection`begin`;
        const content = await fs.readFile(filePath, "utf8");
        await connection.unsafe(content);
        await connection`
          insert into schema_migrations (filename)
          values (${file})
        `;
        await connection`commit`;
      } catch (error) {
        await connection`rollback`;
        throw error;
      } finally {
        connection.release();
      }
    }

    console.log("migrations complete");
  } finally {
    await sql.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
