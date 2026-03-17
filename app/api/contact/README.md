# Contact Form API - Neon Integration

This route stores contact form submissions in Neon Postgres.

## DB table

The route bootstraps this table automatically on first use:

```sql
create table if not exists contact_submissions (
  id text primary key,
  name text not null,
  email text not null,
  message text not null,
  intent text not null,
  timestamp timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## POST `/api/contact`

Creates one submission row.

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'm interested in working with you.",
  "intent": "project"
}
```

Success response:

```json
{
  "success": true,
  "message": "Form submitted successfully",
  "submissionId": "f0c3c5f3-..."
}
```

## GET `/api/contact`

Query params:

- `limit`: default `50`, max `100`
- `intent`: optional exact intent filter

Success response:

```json
{
  "success": true,
  "count": 10,
  "total": 42,
  "submissions": [
    {
      "submissionId": "f0c3c5f3-...",
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello, I'm interested in working with you.",
      "intent": "project",
      "timestamp": "2026-03-17T10:30:00.000Z",
      "createdAt": "2026-03-17T10:30:00.000Z",
      "updatedAt": "2026-03-17T10:30:00.000Z"
    }
  ]
}
```
