# Neon Import Recovery

Use this when Neon data for legacy Gist-backed content needs to be resynced.

## User Flow

- Open terminal in the portfolio repo.
- Run the scoped import for the data you want to recover.
- Verify the Neon row counts and latest records.
- Refresh the admin page and confirm the records render.

## DB Table Context

- `about_milestones`: imported from the legacy `about-gist.json`
- `projects`: imported from the legacy `projects-list`
- `contact_submissions`: imported from `contact-submission-*.json` gists
- `analytics_events`: imported from `visitor-analytics-*.json` gists

## Commands

Import everything:

```bash
npm run db:import-gists
```

Import only contact + analytics:

```bash
npm run db:import-gists -- --only=contact,analytics
```

Import only one table:

```bash
npm run db:import-gists -- --only=contact
npm run db:import-gists -- --only=analytics
```

Verify Neon state:

```bash
npm run db:verify-import
```

## Notes

- The importer now always fetches full gist detail for `contact` and `analytics` before parsing. This is required because the GitHub list-gists API does not reliably include file content.
- The importer is idempotent for `contact_submissions` and `analytics_events` because inserts use `on conflict (id) do update`.
