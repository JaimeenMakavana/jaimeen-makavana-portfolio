import dotenv from "dotenv";
import postgres from "postgres";

import { getDirectDatabaseUrl } from "../lib/db/env";
import type { Project } from "../app/components/ProjectComponents/types";
import type { AboutMilestone } from "../app/lib/about/repository";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

type GistFile = {
  filename?: string;
  content?: string;
  truncated?: boolean;
};

type GitHubGist = {
  id: string;
  description: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  files: Record<string, GistFile>;
};

type ContactImportRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  intent: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

type AnalyticsImportRow = {
  id: string;
  userId: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  timezone?: string;
  language?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  createdAt: string;
  updatedAt: string;
};

type ImportScope = "about" | "projects" | "contact" | "analytics";

const GITHUB_TOKEN = process.env.GITHUB_GIST_TOKEN;
const VALID_SCOPES: ImportScope[] = [
  "about",
  "projects",
  "contact",
  "analytics",
];

function parseScopes(argv: string[]): Set<ImportScope> {
  const onlyArg = argv.find((arg) => arg.startsWith("--only="));
  if (!onlyArg) {
    return new Set(VALID_SCOPES);
  }

  const requestedScopes = onlyArg
    .slice("--only=".length)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (requestedScopes.length === 0) {
    throw new Error(
      "Invalid --only value. Use a comma-separated list like --only=contact,analytics"
    );
  }

  const invalidScope = requestedScopes.find(
    (scope): scope is string => !VALID_SCOPES.includes(scope as ImportScope)
  );

  if (invalidScope) {
    throw new Error(
      `Unsupported import scope "${invalidScope}". Valid scopes: ${VALID_SCOPES.join(", ")}`
    );
  }

  return new Set(requestedScopes as ImportScope[]);
}

function getAuthHeader(token: string): string {
  return token.startsWith("ghp_") || token.startsWith("github_pat_")
    ? `Bearer ${token}`
    : `token ${token}`;
}

async function fetchGitHubJson<T>(url: string): Promise<T> {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_GIST_TOKEN is required for gist import");
  }

  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(GITHUB_TOKEN),
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Portfolio-Neon-Importer",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status} for ${url}`);
  }

  return (await response.json()) as T;
}

async function listAllGists(maxPages = 10): Promise<GitHubGist[]> {
  const gists: GitHubGist[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const pageData = await fetchGitHubJson<GitHubGist[]>(
      `https://api.github.com/gists?per_page=100&page=${page}`
    );
    gists.push(...pageData);

    if (pageData.length < 100) {
      break;
    }
  }

  return gists;
}

async function fetchGistDetail(gistId: string): Promise<GitHubGist> {
  return fetchGitHubJson<GitHubGist>(`https://api.github.com/gists/${gistId}`);
}

function parseJson<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function isLegacyAboutMilestone(
  value: unknown
): value is Omit<AboutMilestone, "id"> & { id?: string } {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.era === "string" &&
    typeof row.title === "string" &&
    typeof row.description === "string" &&
    typeof row.image === "string"
  );
}

function normalizeAboutPayload(value: unknown): AboutMilestone[] {
  const normalizeRows = (rows: unknown[]) =>
    rows
      .filter(isLegacyAboutMilestone)
      .map((row, index) => ({
        id:
          typeof row.id === "string" && row.id.length > 0
            ? row.id
            : `${slugify(row.title) || "milestone"}-${index}`,
        era: row.era,
        title: row.title,
        description: row.description,
        image: row.image,
      }));

  if (Array.isArray(value)) {
    return normalizeRows(value);
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;

  if (Array.isArray(record.milestones)) {
    return normalizeRows(record.milestones);
  }

  if (
    record.data &&
    typeof record.data === "object" &&
    Array.isArray((record.data as Record<string, unknown>).milestones)
  ) {
    return normalizeRows(
      (record.data as Record<string, unknown>).milestones as unknown[]
    );
  }

  return [];
}

function matchesAboutGist(gist: GitHubGist) {
  const fileKeys = Object.keys(gist.files ?? {});
  return (
    fileKeys.some((key) => key.toLowerCase() === "about-gist.json") ||
    gist.description?.toLowerCase().includes("about-gist") ||
    gist.description?.toLowerCase().includes("career-journey") ||
    false
  );
}

function matchesProjectsGist(gist: GitHubGist) {
  const fileKeys = Object.keys(gist.files ?? {});
  return (
    fileKeys.some((key) => key.toLowerCase() === "projects-list") ||
    gist.description?.toLowerCase().includes("projects-list") ||
    gist.description?.toLowerCase().includes("portfolio projects") ||
    false
  );
}

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.category === "string" &&
    typeof row.tagline === "string" &&
    typeof row.description === "string" &&
    Array.isArray(row.stack) &&
    row.stack.every((item) => typeof item === "string") &&
    typeof row.complexity === "number" &&
    typeof row.size === "string" &&
    typeof row.image === "string"
  );
}

async function importAbout(sql: ReturnType<typeof postgres>, gists: GitHubGist[]) {
  const gist = gists.find(matchesAboutGist);
  if (!gist) {
    console.log("about: no legacy gist found");
    return;
  }

  const detail = await fetchGistDetail(gist.id);
  const file = Object.values(detail.files).find((item) =>
    item.filename?.toLowerCase() === "about-gist.json"
  ) ?? Object.values(detail.files)[0];
  const data = normalizeAboutPayload(parseJson<unknown>(file?.content));

  const connection = await sql.reserve();
  try {
    await connection`begin`;
    await connection`delete from about_milestones`;
    for (const [index, item] of data.entries()) {
      await connection`
        insert into about_milestones (
          id,
          era,
          title,
          description,
          image,
          sort_order
        ) values (
          ${item.id},
          ${item.era},
          ${item.title},
          ${item.description},
          ${item.image},
          ${index}
        )
      `;
    }
    await connection`commit`;
  } catch (error) {
    await connection`rollback`;
    throw error;
  } finally {
    connection.release();
  }

  console.log(`about: imported ${data.length} milestones`);
}

async function importProjects(sql: ReturnType<typeof postgres>, gists: GitHubGist[]) {
  const gist = gists.find(matchesProjectsGist);
  if (!gist) {
    console.log("projects: no legacy gist found");
    return;
  }

  const detail = await fetchGistDetail(gist.id);
  const file = Object.values(detail.files).find((item) =>
    item.filename?.toLowerCase() === "projects-list"
  ) ?? Object.values(detail.files)[0];
  const data = parseJson<unknown[]>(file?.content)?.filter(isProject) ?? [];

  const connection = await sql.reserve();
  try {
    await connection`begin`;
    await connection`delete from projects`;
    for (const [index, item] of data.entries()) {
      await connection`
        insert into projects (
          id,
          title,
          category,
          tagline,
          description,
          stack,
          complexity,
          size,
          image,
          image_mobile,
          link,
          stat,
          sort_order
        ) values (
          ${item.id},
          ${item.title},
          ${item.category},
          ${item.tagline},
          ${item.description},
          ${connection.json(item.stack)},
          ${item.complexity},
          ${item.size},
          ${item.image},
          ${item.imageMobile ?? null},
          ${item.link ?? null},
          ${item.stat ?? null},
          ${index}
        )
      `;
    }
    await connection`commit`;
  } catch (error) {
    await connection`rollback`;
    throw error;
  } finally {
    connection.release();
  }

  console.log(`projects: imported ${data.length} projects`);
}

async function importContact(sql: ReturnType<typeof postgres>, gists: GitHubGist[]) {
  const rows: ContactImportRow[] = [];

  for (const gist of gists) {
    const listedFile = Object.values(gist.files).find((item) =>
      item.filename?.startsWith("contact-submission-")
    );

    if (!listedFile) continue;

    // GitHub's list gists API does not reliably include file content.
    // Always resolve the full gist before parsing contact payloads.
    const detail = await fetchGistDetail(gist.id);
    const resolvedFile =
      Object.values(detail.files).find((item) => item.filename === listedFile.filename) ??
      listedFile;
    const content = parseJson<Record<string, unknown>>(resolvedFile.content);

    if (
      content &&
      typeof content.name === "string" &&
      typeof content.email === "string" &&
      typeof content.message === "string" &&
      typeof content.intent === "string"
    ) {
      rows.push({
        id: gist.id,
        name: content.name,
        email: content.email,
        message: content.message,
        intent: content.intent,
        timestamp:
          typeof content.timestamp === "string" ? content.timestamp : gist.created_at,
        createdAt: gist.created_at,
        updatedAt: gist.updated_at,
      });
    }
  }

  rows.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const row of rows) {
    await sql`
      insert into contact_submissions (
        id,
        name,
        email,
        message,
        intent,
        timestamp,
        created_at,
        updated_at
      ) values (
        ${row.id},
        ${row.name},
        ${row.email},
        ${row.message},
        ${row.intent},
        ${row.timestamp},
        ${row.createdAt},
        ${row.updatedAt}
      )
      on conflict (id) do update set
        name = excluded.name,
        email = excluded.email,
        message = excluded.message,
        intent = excluded.intent,
        timestamp = excluded.timestamp,
        updated_at = excluded.updated_at
    `;
  }

  console.log(`contact: imported ${rows.length} submissions`);
}

async function importAnalytics(sql: ReturnType<typeof postgres>, gists: GitHubGist[]) {
  const rows: AnalyticsImportRow[] = [];

  for (const gist of gists) {
    const listedFile = Object.values(gist.files).find((item) =>
      item.filename?.startsWith("visitor-analytics-")
    );

    if (!listedFile) continue;

    // GitHub's list gists API does not reliably include file content.
    // Always resolve the full gist before parsing analytics payloads.
    const detail = await fetchGistDetail(gist.id);
    const resolvedFile =
      Object.values(detail.files).find((item) => item.filename === listedFile.filename) ??
      listedFile;
    const content = parseJson<Record<string, unknown>>(resolvedFile.content);

    if (content && typeof content.userId === "string") {
      rows.push({
        id: gist.id,
        userId: content.userId,
        timestamp:
          typeof content.timestamp === "string" ? content.timestamp : gist.created_at,
        ip: typeof content.ip === "string" ? content.ip : undefined,
        userAgent:
          typeof content.userAgent === "string" ? content.userAgent : undefined,
        referrer:
          typeof content.referrer === "string" ? content.referrer : undefined,
        screenWidth:
          typeof content.screenWidth === "number" ? content.screenWidth : undefined,
        screenHeight:
          typeof content.screenHeight === "number" ? content.screenHeight : undefined,
        timezone:
          typeof content.timezone === "string" ? content.timezone : undefined,
        language:
          typeof content.language === "string" ? content.language : undefined,
        deviceType:
          typeof content.deviceType === "string" ? content.deviceType : undefined,
        browser:
          typeof content.browser === "string" ? content.browser : undefined,
        os: typeof content.os === "string" ? content.os : undefined,
        createdAt: gist.created_at,
        updatedAt: gist.updated_at,
      });
    }
  }

  rows.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const row of rows) {
    await sql`
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
        os,
        created_at,
        updated_at
      ) values (
        ${row.id},
        ${row.userId},
        ${row.timestamp},
        ${row.ip ?? null},
        ${row.userAgent ?? null},
        ${row.referrer ?? null},
        ${row.screenWidth ?? null},
        ${row.screenHeight ?? null},
        ${row.timezone ?? null},
        ${row.language ?? null},
        ${row.deviceType ?? null},
        ${row.browser ?? null},
        ${row.os ?? null},
        ${row.createdAt},
        ${row.updatedAt}
      )
      on conflict (id) do update set
        user_id = excluded.user_id,
        timestamp = excluded.timestamp,
        ip = excluded.ip,
        user_agent = excluded.user_agent,
        referrer = excluded.referrer,
        screen_width = excluded.screen_width,
        screen_height = excluded.screen_height,
        timezone = excluded.timezone,
        language = excluded.language,
        device_type = excluded.device_type,
        browser = excluded.browser,
        os = excluded.os,
        updated_at = excluded.updated_at
    `;
  }

  console.log(`analytics: imported ${rows.length} events`);
}

async function main() {
  if (!GITHUB_TOKEN) {
    throw new Error("GITHUB_GIST_TOKEN is required for import");
  }

  const scopes = parseScopes(process.argv.slice(2));

  const sql = postgres(getDirectDatabaseUrl(), {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  });

  try {
    const gists = await listAllGists();
    console.log(`github: fetched ${gists.length} gists`);
    console.log(`import: scopes ${Array.from(scopes).join(", ")}`);

    if (scopes.has("about")) {
      await importAbout(sql, gists);
    }

    if (scopes.has("projects")) {
      await importProjects(sql, gists);
    }

    if (scopes.has("contact")) {
      await importContact(sql, gists);
    }

    if (scopes.has("analytics")) {
      await importAnalytics(sql, gists);
    }

    console.log("import complete");
  } finally {
    await sql.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
