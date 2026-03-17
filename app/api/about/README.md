# About/Career Journey API - Neon Integration

This route stores the career journey timeline in Neon Postgres.

## Env setup

The database layer resolves these envs in priority order:

- Runtime connection: `DATABASE_URL`, `POSTGRES_URL`, `POSTGRESURL`, `POSTGRES_PRISMA_URL`
- Direct/non-pooled fallback: `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL_NO_SSL`
- Provider parts fallback: `PGHOST`, `PGHOST_UNPOOLED`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

## DB table

The route bootstraps this table automatically on first use:

```sql
create table if not exists about_milestones (
  id text primary key,
  era text not null,
  title text not null,
  description text not null,
  image text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## API endpoints

### GET `/api/about`

Returns the ordered milestone list.

```json
{
  "found": true,
  "data": [
    {
      "id": "origins",
      "era": "2016-2020",
      "title": "Origins",
      "description": "LD College of Engineering...",
      "image": "https://images.unsplash.com/..."
    }
  ]
}
```

If the table is empty:

```json
{
  "found": false,
  "data": null
}
```

### POST `/api/about`

Replaces the full ordered milestone list.

```json
{
  "data": [
    {
      "id": "origins",
      "era": "2016-2020",
      "title": "Origins",
      "description": "LD College of Engineering...",
      "image": "https://images.unsplash.com/..."
    }
  ]
}
```

Success response:

```json
{
  "success": true,
  "message": "About data synced successfully"
}
```

### DELETE `/api/about`

Deletes all milestone rows.

Success response:

```json
{
  "success": true,
  "message": "About data deleted successfully"
}
```
