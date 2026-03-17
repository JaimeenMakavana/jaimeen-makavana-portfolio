import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Filter, Monitor, RefreshCcw, Smartphone, Tablet } from "lucide-react";
import { z } from "zod";

import { AdminPageHeader } from "@/app/components/ui/AdminPageHeader";
import { AdminPageShell } from "@/app/components/ui/AdminPageShell";
import { AdminScrollPanel } from "@/app/components/ui/AdminScrollPanel";
import { applyAnalyticsFilters } from "./actions";
import {
  type AnalyticsVisitor,
  getAnalyticsAdminPageData,
} from "@/app/lib/analytics/repository";

const analyticsSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  deviceType: z.enum(["mobile", "tablet", "desktop"]).optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function renderDeviceIcon(
  deviceType: string | undefined,
  className: string,
  style: CSSProperties,
): ReactNode {
  switch (deviceType) {
    case "mobile":
      return <Smartphone className={className} style={style} />;
    case "tablet":
      return <Tablet className={className} style={style} />;
    case "desktop":
      return <Monitor className={className} style={style} />;
    default:
      return <Monitor className={className} style={style} />;
  }
}

function getDeviceColor(deviceType?: string) {
  switch (deviceType) {
    case "mobile":
      return "var(--bg-accent-glow)";
    case "tablet":
      return "var(--muted)";
    case "desktop":
      return "var(--text-display)";
    default:
      return "var(--text-muted)";
  }
}

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Unknown Date";
  }
}

function buildPageHref(
  page: number,
  filters: {
    deviceType?: string;
    dateFrom?: string;
    dateTo?: string;
  },
) {
  const searchParams = new URLSearchParams();

  if (page > 1) {
    searchParams.set("page", String(page));
  }
  if (filters.deviceType) {
    searchParams.set("deviceType", filters.deviceType);
  }
  if (filters.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }
  if (filters.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }

  const query = searchParams.toString();
  return query.length > 0 ? `/admin/analytics?${query}` : "/admin/analytics";
}

function VisitorRow({ visitor }: { visitor: AnalyticsVisitor }) {
  return (
    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
      <td className="p-4 align-top">
        <div
          className="mb-1 text-sm font-bold"
          style={{ color: "var(--text-display)" }}
        >
          {visitor.userId}
        </div>
        <div
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {visitor.ip ?? "unknown"}
        </div>
      </td>
      <td className="p-4 align-top">
        <div className="flex items-center gap-2">
          {renderDeviceIcon(visitor.deviceType, "h-4 w-4", {
            color: getDeviceColor(visitor.deviceType),
          })}
          <span
            className="text-xs font-mono uppercase"
            style={{ color: "var(--text-body)" }}
          >
            {visitor.deviceType ?? "unknown"}
          </span>
        </div>
      </td>
      <td className="p-4 align-top">
        <div className="text-sm" style={{ color: "var(--text-body)" }}>
          {visitor.browser ?? "unknown"}
        </div>
        <div
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {visitor.os ?? "unknown"}
        </div>
      </td>
      <td className="p-4 align-top">
        <div className="text-sm" style={{ color: "var(--text-body)" }}>
          {visitor.referrer ?? "direct"}
        </div>
        <div
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {visitor.language ?? "unknown"} / {visitor.timezone ?? "unknown"}
        </div>
      </td>
      <td className="p-4 align-top">
        <div className="text-sm" style={{ color: "var(--text-body)" }}>
          {visitor.screenWidth && visitor.screenHeight
            ? `${visitor.screenWidth} x ${visitor.screenHeight}`
            : "unknown"}
        </div>
      </td>
      <td className="p-4 align-top text-right">
        <div
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {formatDate(visitor.timestamp)}
        </div>
      </td>
    </tr>
  );
}

export default async function AdminAnalytics({
  searchParams,
}: AnalyticsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsedSearchParams = analyticsSearchParamsSchema.parse({
    page: Array.isArray(resolvedSearchParams.page)
      ? resolvedSearchParams.page[0]
      : resolvedSearchParams.page,
    deviceType: Array.isArray(resolvedSearchParams.deviceType)
      ? resolvedSearchParams.deviceType[0]
      : resolvedSearchParams.deviceType,
    dateFrom: Array.isArray(resolvedSearchParams.dateFrom)
      ? resolvedSearchParams.dateFrom[0]
      : resolvedSearchParams.dateFrom,
    dateTo: Array.isArray(resolvedSearchParams.dateTo)
      ? resolvedSearchParams.dateTo[0]
      : resolvedSearchParams.dateTo,
  });

  const pageSize = 25;
  const data = await getAnalyticsAdminPageData({
    page: parsedSearchParams.page,
    pageSize,
    deviceType: parsedSearchParams.deviceType ?? null,
    dateFrom: parsedSearchParams.dateFrom ?? null,
    dateTo: parsedSearchParams.dateTo ?? null,
  });

  const filters = {
    deviceType: parsedSearchParams.deviceType,
    dateFrom: parsedSearchParams.dateFrom,
    dateTo: parsedSearchParams.dateTo,
  };
  const hasPreviousPage = data.page > 1;
  const hasNextPage = data.page < data.totalPages;

  return (
    <AdminPageShell className="flex h-full min-h-0 flex-col space-y-4 overflow-hidden p-6 md:px-6">
      <AdminPageHeader
        eyebrow="Analytics Dashboard / Server Rendered"
        title={
          <>
            Unique <span style={{ color: "var(--bg-accent-glow)" }}>Visitors</span>
          </>
        }
        actions={
          <>
            <div>UNIQUES : {data.stats.totalUniqueUsers}</div>
            <Link
              href={buildPageHref(data.page, filters)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-all"
              style={{
                backgroundColor: "var(--nav-surface)",
                color: "var(--nav-text-idle)",
              }}
            >
              <RefreshCcw className="h-4 w-4" />
              <span className="text-sm font-mono uppercase tracking-wide">
                Refresh
              </span>
            </Link>
          </>
        }
      />

      <form
        action={applyAnalyticsFilters}
        className="flex max-w-7xl flex-col gap-4 md:flex-row"
      >
        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          <select
            name="deviceType"
            defaultValue={parsedSearchParams.deviceType ?? "ALL"}
            className="bg-transparent text-sm font-mono outline-none"
          >
            <option value="ALL">ALL DEVICES</option>
            {data.deviceTypes.map((deviceType) => (
              <option key={deviceType} value={deviceType}>
                {deviceType.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <input
          type="date"
          name="dateFrom"
          defaultValue={parsedSearchParams.dateFrom ?? ""}
          className="rounded-xl border px-4 py-3 text-sm outline-none"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        />

        <input
          type="date"
          name="dateTo"
          defaultValue={parsedSearchParams.dateTo ?? ""}
          className="rounded-xl border px-4 py-3 text-sm outline-none"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        />

        <button
          type="submit"
          className="rounded-xl px-4 py-3 text-sm font-mono uppercase tracking-wide"
          style={{
            backgroundColor: "var(--nav-surface)",
            color: "var(--nav-text-idle)",
          }}
        >
          Apply Filters
        </button>

        <Link
          href="/admin/analytics"
          className="rounded-xl border px-4 py-3 text-center text-sm font-mono uppercase tracking-wide"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Reset
        </Link>
      </form>

      <AdminScrollPanel>
          {data.visitors.length === 0 ? (
            <div
              className="flex h-full min-h-80 flex-col items-center justify-center gap-4"
              style={{ color: "var(--text-muted)" }}
            >
              <Filter className="h-8 w-8 opacity-30" />
              <p>No analytics records match the current filters.</p>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr
                    className="border-b text-xs font-mono uppercase tracking-wider"
                    style={{
                      backgroundColor: "var(--muted)",
                      borderColor: "var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <th className="p-4 font-medium">Visitor</th>
                    <th className="p-4 font-medium">Device</th>
                    <th className="p-4 font-medium">Browser / OS</th>
                    <th className="p-4 font-medium">Referrer / Locale</th>
                    <th className="p-4 font-medium">Viewport</th>
                    <th className="p-4 text-right font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {data.visitors.map((visitor) => (
                    <VisitorRow key={visitor.eventId} visitor={visitor} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </AdminScrollPanel>

      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-between gap-4">
          <div
            className="text-xs font-mono uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Showing {(data.page - 1) * data.pageSize + (data.total > 0 ? 1 : 0)}
            -{Math.min(data.page * data.pageSize, data.total)} of {data.total}{" "}
            records
          </div>

          <div className="flex items-center gap-2">
            <Link
              aria-disabled={!hasPreviousPage}
              href={
                hasPreviousPage ? buildPageHref(data.page - 1, filters) : "#"
              }
              className="rounded-lg border px-4 py-2 text-sm font-mono uppercase tracking-wide"
              style={{
                borderColor: "var(--border)",
                color: hasPreviousPage
                  ? "var(--text-body)"
                  : "var(--text-muted)",
                pointerEvents: hasPreviousPage ? "auto" : "none",
                opacity: hasPreviousPage ? 1 : 0.5,
              }}
            >
              Previous
            </Link>
            <span
              className="text-xs font-mono uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Page {data.page} of {data.totalPages}
            </span>
            <Link
              aria-disabled={!hasNextPage}
              href={hasNextPage ? buildPageHref(data.page + 1, filters) : "#"}
              className="rounded-lg border px-4 py-2 text-sm font-mono uppercase tracking-wide"
              style={{
                borderColor: "var(--border)",
                color: hasNextPage ? "var(--text-body)" : "var(--text-muted)",
                pointerEvents: hasNextPage ? "auto" : "none",
                opacity: hasNextPage ? 1 : 0.5,
              }}
            >
              Next
            </Link>
          </div>
      </div>
    </AdminPageShell>
  );
}
