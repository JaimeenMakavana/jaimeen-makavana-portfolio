const RUNTIME_DATABASE_URL_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRESURL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
] as const;

const DIRECT_DATABASE_URL_KEYS = [
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRESURL",
  "POSTGRES_PRISMA_URL",
] as const;

function firstDefinedEnv(keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function buildConnectionStringFromParts(): string | null {
  const host = process.env.PGHOST || process.env.PGHOST_UNPOOLED || process.env.POSTGRES_HOST;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE;

  if (!host || !user || !password || !database) {
    return null;
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const encodedDatabase = encodeURIComponent(database);

  return `postgresql://${encodedUser}:${encodedPassword}@${host}/${encodedDatabase}?sslmode=require`;
}

function resolveDatabaseUrl(preferDirect: boolean): string {
  const primary = firstDefinedEnv(
    preferDirect ? DIRECT_DATABASE_URL_KEYS : RUNTIME_DATABASE_URL_KEYS
  );

  if (primary) {
    return primary;
  }

  const fromParts = buildConnectionStringFromParts();
  if (fromParts) {
    return fromParts;
  }

  throw new Error(
    `Missing database connection env. Expected one of: ${[
      ...RUNTIME_DATABASE_URL_KEYS,
      "PGHOST",
      "PGHOST_UNPOOLED",
      "PGUSER",
      "PGPASSWORD",
      "PGDATABASE",
      "POSTGRES_HOST",
      "POSTGRES_PASSWORD",
      "POSTGRES_DATABASE",
    ].join(", ")}`
  );
}

export function getRuntimeDatabaseUrl(): string {
  return resolveDatabaseUrl(false);
}

export function getDirectDatabaseUrl(): string {
  return resolveDatabaseUrl(true);
}
