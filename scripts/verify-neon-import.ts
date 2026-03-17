import dotenv from "dotenv";
import postgres from "postgres";

import { getDirectDatabaseUrl } from "../lib/db/env";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

type CountRow = {
  count: string;
};

type ContactPreviewRow = {
  id: string;
  name: string;
  email: string;
  intent: string;
  timestamp: string;
};

type AnalyticsPreviewRow = {
  id: string;
  user_id: string;
  device_type: string | null;
  browser: string | null;
  timestamp: string;
};

async function main() {
  const sql = postgres(getDirectDatabaseUrl(), {
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 15,
  });

  try {
    const [aboutCount] =
      await sql<CountRow[]>`select count(*)::text as count from about_milestones`;
    const [projectCount] =
      await sql<CountRow[]>`select count(*)::text as count from projects`;
    const [contactCount] =
      await sql<CountRow[]>`select count(*)::text as count from contact_submissions`;
    const [analyticsCount] =
      await sql<CountRow[]>`select count(*)::text as count from analytics_events`;

    const latestContacts = await sql<ContactPreviewRow[]>`
      select id, name, email, intent, timestamp::text as timestamp
      from contact_submissions
      order by timestamp desc
      limit 3
    `;

    const latestAnalytics = await sql<AnalyticsPreviewRow[]>`
      select id, user_id, device_type, browser, timestamp::text as timestamp
      from analytics_events
      order by timestamp desc, id desc
      limit 5
    `;

    console.log(
      JSON.stringify(
        {
          counts: {
            about: Number(aboutCount?.count ?? 0),
            projects: Number(projectCount?.count ?? 0),
            contact: Number(contactCount?.count ?? 0),
            analytics: Number(analyticsCount?.count ?? 0),
          },
          latestContacts,
          latestAnalytics,
        },
        null,
        2
      )
    );
  } finally {
    await sql.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
