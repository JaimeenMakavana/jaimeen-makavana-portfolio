import "server-only";

import { sql } from "@/lib/db/client";

export type ContactSubmission = {
  submissionId: string;
  name: string;
  email: string;
  message: string;
  intent: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  intent: string;
  timestamp: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
};

export type ContactAdminPageData = {
  submissions: ContactSubmission[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  intents: string[];
};

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapRow(row: ContactSubmissionRow): ContactSubmission {
  return {
    submissionId: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    intent: row.intent,
    timestamp: toIsoString(row.timestamp),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

export async function createContactSubmission(input: {
  name: string;
  email: string;
  message: string;
  intent: string;
}) {
  const submissionId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const rows = await sql<ContactSubmissionRow[]>`
    insert into contact_submissions (
      id,
      name,
      email,
      message,
      intent,
      timestamp
    ) values (
      ${submissionId},
      ${input.name},
      ${input.email},
      ${input.message},
      ${input.intent},
      ${timestamp}
    )
    returning id, name, email, message, intent, timestamp, created_at, updated_at
  `;

  return mapRow(rows[0]);
}

export async function getContactSubmissions(options: {
  limit: number;
  intent?: string | null;
}) {
  const filters = options.intent
    ? sql`where lower(intent) = lower(${options.intent})`
    : sql``;

  const rows = await sql<ContactSubmissionRow[]>`
    select id, name, email, message, intent, timestamp, created_at, updated_at
    from contact_submissions
    ${filters}
    order by timestamp desc, created_at desc
    limit ${options.limit}
  `;

  const countRows = await sql<{ count: string }[]>`
    select count(*)::text as count
    from contact_submissions
    ${filters}
  `;

  return {
    submissions: rows.map(mapRow),
    total: Number(countRows[0]?.count ?? 0),
  };
}

function buildContactWhereClause(filters: {
  intent?: string | null;
  search?: string | null;
}) {
  let clause = sql`1 = 1`;

  if (filters.intent) {
    clause = sql`${clause} and lower(intent) = lower(${filters.intent})`;
  }

  if (filters.search) {
    const query = `%${filters.search.toLowerCase()}%`;
    clause = sql`
      ${clause}
      and (
        lower(name) like ${query}
        or lower(email) like ${query}
        or lower(message) like ${query}
      )
    `;
  }

  return clause;
}

export async function getContactAdminPageData(filters: {
  page: number;
  pageSize: number;
  intent?: string | null;
  search?: string | null;
}): Promise<ContactAdminPageData> {
  const normalizedPage = Math.max(filters.page, 1);
  const normalizedPageSize = Math.min(Math.max(filters.pageSize, 1), 100);
  const whereClause = buildContactWhereClause({
    intent: filters.intent,
    search: filters.search,
  });

  const [countRows, intentRows] = await Promise.all([
    sql<{ count: string }[]>`
      select count(*)::text as count
      from contact_submissions
      where ${whereClause}
    `,
    sql<{ intent: string }[]>`
      select distinct intent
      from contact_submissions
      order by intent asc
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const totalPages = total === 0 ? 1 : Math.ceil(total / normalizedPageSize);
  const effectivePage = Math.min(normalizedPage, totalPages);
  const offset = (effectivePage - 1) * normalizedPageSize;

  const rows = await sql<ContactSubmissionRow[]>`
    select id, name, email, message, intent, timestamp, created_at, updated_at
    from contact_submissions
    where ${whereClause}
    order by timestamp desc, created_at desc
    limit ${normalizedPageSize}
    offset ${offset}
  `;

  return {
    submissions: rows.map(mapRow),
    total,
    totalPages,
    page: effectivePage,
    pageSize: normalizedPageSize,
    intents: intentRows.map((row) => row.intent),
  };
}
