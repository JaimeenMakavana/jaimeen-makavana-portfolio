import "server-only";

import { sql } from "@/lib/db/client";

export type AnalyticsVisitor = {
  eventId: string;
  userId: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
  createdAt: string;
  updatedAt: string;
};

type AnalyticsEventRow = {
  id: string;
  user_id: string;
  timestamp: Date | string;
  ip: string | null;
  user_agent: string | null;
  referrer: string | null;
  screen_width: number | null;
  screen_height: number | null;
  timezone: string | null;
  language: string | null;
  device_type: "mobile" | "tablet" | "desktop" | null;
  browser: string | null;
  os: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type BreakdownRow = {
  label: string | null;
  count: string;
};

type DeviceTypeRow = {
  label: string | null;
};

export type AnalyticsStats = {
  totalUniqueUsers: number;
  totalRecords: number;
  deviceBreakdown: Record<string, number>;
  browserBreakdown: Record<string, number>;
  osBreakdown: Record<string, number>;
};

export type AnalyticsAdminPageData = {
  visitors: AnalyticsVisitor[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  stats: AnalyticsStats;
  deviceTypes: Array<"mobile" | "tablet" | "desktop">;
};

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapEventRow(row: AnalyticsEventRow): AnalyticsVisitor {
  return {
    eventId: row.id,
    userId: row.user_id,
    timestamp: toIsoString(row.timestamp),
    ip: row.ip ?? undefined,
    userAgent: row.user_agent ?? undefined,
    referrer: row.referrer ?? undefined,
    screenWidth: row.screen_width ?? undefined,
    screenHeight: row.screen_height ?? undefined,
    timezone: row.timezone ?? undefined,
    language: row.language ?? undefined,
    deviceType: row.device_type ?? undefined,
    browser: row.browser ?? undefined,
    os: row.os ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapBreakdown(rows: BreakdownRow[]): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.label ?? "unknown"] = Number(row.count);
    return acc;
  }, {});
}

function buildWhereClause(filters: {
  cursor?: string | null;
  deviceType?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}) {
  let clause = sql`1 = 1`;

  if (filters.cursor) {
    clause = sql`
      ${clause}
      and (
        timestamp < (select timestamp from analytics_events where id = ${filters.cursor})
        or (
          timestamp = (select timestamp from analytics_events where id = ${filters.cursor})
          and id < ${filters.cursor}
        )
      )
    `;
  }

  if (filters.deviceType) {
    clause = sql`${clause} and device_type = ${filters.deviceType}`;
  }

  if (filters.dateFrom) {
    clause = sql`${clause} and timestamp >= ${filters.dateFrom}`;
  }

  if (filters.dateTo) {
    clause = sql`${clause} and timestamp <= ${filters.dateTo}`;
  }

  return clause;
}

export async function createAnalyticsEvent(input: {
  userId: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
  deviceType?: "mobile" | "tablet" | "desktop";
  browser?: string;
  os?: string;
}) {
  const eventId = crypto.randomUUID();

  const rows = await sql<AnalyticsEventRow[]>`
    insert into analytics_events (
      id,
      user_id,
      timestamp,
      ip,
      user_agent,
      referrer,
      screen_width,
      screen_height,
      timezone,
      language,
      device_type,
      browser,
      os
    ) values (
      ${eventId},
      ${input.userId},
      ${input.timestamp},
      ${input.ip ?? null},
      ${input.userAgent ?? null},
      ${input.referrer ?? null},
      ${input.screenWidth ?? null},
      ${input.screenHeight ?? null},
      ${input.timezone ?? null},
      ${input.language ?? null},
      ${input.deviceType ?? null},
      ${input.browser ?? null},
      ${input.os ?? null}
    )
    returning
      id,
      user_id,
      timestamp,
      ip,
      user_agent,
      referrer,
      screen_width,
      screen_height,
      timezone,
      language,
      device_type,
      browser,
      os,
      created_at,
      updated_at
  `;

  return mapEventRow(rows[0]);
}

export async function getAnalyticsData(filters: {
  limit: number;
  cursor?: string | null;
  deviceType?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}) {
  const baseWhere = buildWhereClause(filters);
  const statsWhere = buildWhereClause({
    deviceType: filters.deviceType,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const rows = await sql<AnalyticsEventRow[]>`
    select
      id,
      user_id,
      timestamp,
      ip,
      user_agent,
      referrer,
      screen_width,
      screen_height,
      timezone,
      language,
      device_type,
      browser,
      os,
      created_at,
      updated_at
    from analytics_events
    where ${baseWhere}
    order by timestamp desc, id desc
    limit ${filters.limit}
  `;

  const totals = await sql<{ total_records: string; total_unique_users: string }[]>`
    select
      count(*)::text as total_records,
      count(distinct user_id)::text as total_unique_users
    from analytics_events
    where ${statsWhere}
  `;

  const deviceBreakdownRows = await sql<BreakdownRow[]>`
    select coalesce(device_type, 'unknown') as label, count(*)::text as count
    from analytics_events
    where ${statsWhere}
    group by coalesce(device_type, 'unknown')
  `;

  const browserBreakdownRows = await sql<BreakdownRow[]>`
    select coalesce(browser, 'unknown') as label, count(*)::text as count
    from analytics_events
    where ${statsWhere}
    group by coalesce(browser, 'unknown')
  `;

  const osBreakdownRows = await sql<BreakdownRow[]>`
    select coalesce(os, 'unknown') as label, count(*)::text as count
    from analytics_events
    where ${statsWhere}
    group by coalesce(os, 'unknown')
  `;

  const visitors = rows.map(mapEventRow);
  const nextCursor =
    visitors.length === filters.limit ? visitors[visitors.length - 1]?.eventId ?? null : null;

  return {
    visitors,
    total: Number(totals[0]?.total_records ?? 0),
    hasMore: visitors.length === filters.limit,
    nextCursor,
    stats: {
      totalUniqueUsers: Number(totals[0]?.total_unique_users ?? 0),
      totalRecords: Number(totals[0]?.total_records ?? 0),
      deviceBreakdown: mapBreakdown(deviceBreakdownRows),
      browserBreakdown: mapBreakdown(browserBreakdownRows),
      osBreakdown: mapBreakdown(osBreakdownRows),
    },
  };
}

export async function getAnalyticsAdminPageData(filters: {
  page: number;
  pageSize: number;
  deviceType?: "mobile" | "tablet" | "desktop" | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}): Promise<AnalyticsAdminPageData> {
  const normalizedPage = Math.max(filters.page, 1);
  const normalizedPageSize = Math.min(Math.max(filters.pageSize, 1), 100);

  const statsWhere = buildWhereClause({
    deviceType: filters.deviceType,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const [totals, deviceBreakdownRows, browserBreakdownRows, osBreakdownRows, deviceRows] =
    await Promise.all([
      sql<{ total_records: string; total_unique_users: string }[]>`
        select
          count(*)::text as total_records,
          count(distinct user_id)::text as total_unique_users
        from analytics_events
        where ${statsWhere}
      `,
      sql<BreakdownRow[]>`
        select coalesce(device_type, 'unknown') as label, count(*)::text as count
        from analytics_events
        where ${statsWhere}
        group by coalesce(device_type, 'unknown')
      `,
      sql<BreakdownRow[]>`
        select coalesce(browser, 'unknown') as label, count(*)::text as count
        from analytics_events
        where ${statsWhere}
        group by coalesce(browser, 'unknown')
      `,
      sql<BreakdownRow[]>`
        select coalesce(os, 'unknown') as label, count(*)::text as count
        from analytics_events
        where ${statsWhere}
        group by coalesce(os, 'unknown')
      `,
      sql<DeviceTypeRow[]>`
        select distinct device_type as label
        from analytics_events
        where device_type is not null
        order by device_type asc
      `,
    ]);

  const total = Number(totals[0]?.total_records ?? 0);
  const totalPages = total === 0 ? 1 : Math.ceil(total / normalizedPageSize);
  const effectivePage = Math.min(normalizedPage, totalPages);
  const offset = (effectivePage - 1) * normalizedPageSize;

  const rows = await sql<AnalyticsEventRow[]>`
    select
      id,
      user_id,
      timestamp,
      ip,
      user_agent,
      referrer,
      screen_width,
      screen_height,
      timezone,
      language,
      device_type,
      browser,
      os,
      created_at,
      updated_at
    from analytics_events
    where ${statsWhere}
    order by timestamp desc, id desc
    limit ${normalizedPageSize}
    offset ${offset}
  `;

  return {
    visitors: rows.map(mapEventRow),
    total,
    totalPages,
    page: effectivePage,
    pageSize: normalizedPageSize,
    stats: {
      totalUniqueUsers: Number(totals[0]?.total_unique_users ?? 0),
      totalRecords: total,
      deviceBreakdown: mapBreakdown(deviceBreakdownRows),
      browserBreakdown: mapBreakdown(browserBreakdownRows),
      osBreakdown: mapBreakdown(osBreakdownRows),
    },
    deviceTypes: deviceRows
      .map((row) => row.label)
      .filter(
        (value): value is "mobile" | "tablet" | "desktop" =>
          value === "mobile" || value === "tablet" || value === "desktop"
      ),
  };
}
