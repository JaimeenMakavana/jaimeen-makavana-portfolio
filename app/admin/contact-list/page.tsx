import Link from "next/link";
import {
  Calendar,
  Database,
  Filter,
  Mail,
  RefreshCcw,
  Search,
} from "lucide-react";
import { z } from "zod";

import { AdminPageHeader } from "@/app/components/ui/AdminPageHeader";
import { AdminPageShell } from "@/app/components/ui/AdminPageShell";
import { AdminScrollPanel } from "@/app/components/ui/AdminScrollPanel";
import { applyContactFilters } from "./actions";
import {
  type ContactSubmission,
  getContactAdminPageData,
} from "@/app/lib/contact/repository";

const contactSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  intent: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

type ContactPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatDate(isoString: string) {
  try {
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Unknown Date";
  }
}

function getIntentBadgeStyle(intent: string) {
  const normalized = intent.toLowerCase();
  switch (normalized) {
    case "project":
      return {
        backgroundColor: "var(--muted)",
        color: "var(--text-body)",
        borderColor: "var(--border)",
      };
    case "hiring":
      return {
        backgroundColor: "var(--bg-accent-glow)",
        color: "var(--text-display)",
        borderColor: "var(--bg-accent-glow)",
      };
    case "consulting":
      return {
        backgroundColor: "var(--muted)",
        color: "var(--text-body)",
        borderColor: "var(--border)",
      };
    default:
      return {
        backgroundColor: "var(--muted)",
        color: "var(--text-muted)",
        borderColor: "var(--border)",
      };
  }
}

function buildPageHref(
  page: number,
  filters: {
    intent?: string;
    search?: string;
  },
) {
  const searchParams = new URLSearchParams();

  if (page > 1) {
    searchParams.set("page", String(page));
  }
  if (filters.intent) {
    searchParams.set("intent", filters.intent);
  }
  if (filters.search) {
    searchParams.set("search", filters.search);
  }

  const query = searchParams.toString();
  return query.length > 0
    ? `/admin/contact-list?${query}`
    : "/admin/contact-list";
}

function SubmissionRow({ submission }: { submission: ContactSubmission }) {
  const badgeStyle = getIntentBadgeStyle(submission.intent);

  return (
    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
      <td className="p-4 pl-6 align-top">
        <div
          className="text-sm font-bold"
          style={{ color: "var(--text-display)" }}
        >
          {submission.name}
        </div>
        <a
          href={`mailto:${submission.email}`}
          className="mt-1 flex items-center gap-1 text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          <Mail className="h-3 w-3" />
          {submission.email}
        </a>
      </td>
      <td className="p-4 align-top">
        <span
          className="inline-block rounded border px-2 py-1 text-[10px] uppercase tracking-wide"
          style={badgeStyle}
        >
          {submission.intent}
        </span>
      </td>
      <td className="max-w-md p-4 align-top">
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          {submission.message}
        </p>
      </td>
      <td className="p-4 align-top">
        <div
          className="flex items-center gap-1.5 text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          <Calendar className="h-3 w-3" />
          {formatDate(submission.timestamp)}
        </div>
      </td>
      <td className="p-4 pr-6 align-top text-right">
        <div
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-mono uppercase"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          <Database className="h-4 w-4" />
          {submission.submissionId.slice(0, 8)}
        </div>
      </td>
    </tr>
  );
}

export default async function AdminContactList({
  searchParams,
}: ContactPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const parsedSearchParams = contactSearchParamsSchema.parse({
    page: Array.isArray(resolvedSearchParams.page)
      ? resolvedSearchParams.page[0]
      : resolvedSearchParams.page,
    intent: Array.isArray(resolvedSearchParams.intent)
      ? resolvedSearchParams.intent[0]
      : resolvedSearchParams.intent,
    search: Array.isArray(resolvedSearchParams.search)
      ? resolvedSearchParams.search[0]
      : resolvedSearchParams.search,
  });

  const pageSize = 25;
  const data = await getContactAdminPageData({
    page: parsedSearchParams.page,
    pageSize,
    intent: parsedSearchParams.intent ?? null,
    search: parsedSearchParams.search ?? null,
  });

  const filters = {
    intent: parsedSearchParams.intent,
    search: parsedSearchParams.search,
  };
  const hasPreviousPage = data.page > 1;
  const hasNextPage = data.page < data.totalPages;

  return (
    <AdminPageShell className="flex h-full min-h-0 flex-col space-y-4 overflow-hidden p-6">
      <AdminPageHeader
        eyebrow="Neon Database / Server Rendered"
        title={
          <>
            Incoming{" "}
            <span style={{ color: "var(--bg-accent-glow)" }}>Signals</span>
          </>
        }
        actions={
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
        }
      />

      <form
        action={applyContactFilters}
        className="flex max-w-7xl flex-col gap-4 md:flex-row"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            name="search"
            defaultValue={parsedSearchParams.search ?? ""}
            placeholder="Search by name, email, or message..."
            className="w-full rounded-xl border py-3 pl-12 pr-4 text-sm outline-none"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--text-body)",
            }}
          />
        </div>

        <div
          className="flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <Filter className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          <select
            name="intent"
            defaultValue={parsedSearchParams.intent ?? "ALL"}
            className="bg-transparent text-sm font-mono outline-none"
          >
            <option value="ALL">ALL INTENTS</option>
            {data.intents.map((intent) => (
              <option key={intent} value={intent}>
                {intent.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

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
          href="/admin/contact-list"
          className="rounded-xl border px-4 py-3 text-center text-sm font-mono uppercase tracking-wide"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Reset
        </Link>
      </form>

      <AdminScrollPanel className="shadow-sm">
        {data.submissions.length === 0 ? (
          <div
            className="flex h-full min-h-80 flex-col items-center justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--muted)" }}
            >
              <Filter className="h-8 w-8 opacity-20" />
            </div>
            <p>No transmissions found matching parameters.</p>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10">
                <tr
                  className="border-b text-[10px] font-mono uppercase tracking-wider md:text-xs"
                  style={{
                    backgroundColor: "var(--muted)",
                    borderColor: "var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <th className="p-4 pl-6 font-medium">Source Identity</th>
                  <th className="p-4 font-medium">Signal Type</th>
                  <th className="p-4 font-medium">Payload Content</th>
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 pr-6 text-right font-medium">Record</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((submission) => (
                  <SubmissionRow
                    key={submission.submissionId}
                    submission={submission}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminScrollPanel>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div
          className="text-xs font-mono uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Showing {(data.page - 1) * data.pageSize + (data.total > 0 ? 1 : 0)}-
          {Math.min(data.page * data.pageSize, data.total)} of {data.total}{" "}
          records
        </div>

        <div className="flex items-center gap-2">
          <Link
            aria-disabled={!hasPreviousPage}
            href={hasPreviousPage ? buildPageHref(data.page - 1, filters) : "#"}
            className="rounded-lg border px-4 py-2 text-sm font-mono uppercase tracking-wide"
            style={{
              borderColor: "var(--border)",
              color: hasPreviousPage ? "var(--text-body)" : "var(--text-muted)",
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
