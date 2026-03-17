import "server-only";

import { sql } from "@/lib/db/client";

export type AdminDashboardData = {
  projectCount: number;
  aboutMilestoneCount: number;
  contactCount: number;
  analyticsCount: number;
  uniqueVisitorCount: number;
};

type CountRow = {
  count: string;
};

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [projectRows, aboutRows, contactRows, analyticsRows, uniqueVisitorRows] =
    await Promise.all([
      sql<CountRow[]>`select count(*)::text as count from projects`,
      sql<CountRow[]>`select count(*)::text as count from about_milestones`,
      sql<CountRow[]>`select count(*)::text as count from contact_submissions`,
      sql<CountRow[]>`select count(*)::text as count from analytics_events`,
      sql<CountRow[]>`
        select count(distinct user_id)::text as count
        from analytics_events
      `,
    ]);

  return {
    projectCount: Number(projectRows[0]?.count ?? 0),
    aboutMilestoneCount: Number(aboutRows[0]?.count ?? 0),
    contactCount: Number(contactRows[0]?.count ?? 0),
    analyticsCount: Number(analyticsRows[0]?.count ?? 0),
    uniqueVisitorCount: Number(uniqueVisitorRows[0]?.count ?? 0),
  };
}
