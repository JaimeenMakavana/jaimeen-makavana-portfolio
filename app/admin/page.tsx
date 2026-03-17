import Link from "next/link";
import type { CSSProperties, ComponentType } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Database,
  FolderKanban,
  MessageSquare,
  User,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/app/components/ui/AdminPageHeader";
import { AdminPageShell } from "@/app/components/ui/AdminPageShell";
import { getAdminDashboardData } from "@/app/lib/admin/repository";

function StatCard(props: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div
        className="mb-2 text-xs font-mono uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {props.label}
      </div>
      <div
        className="text-4xl font-black tracking-tight"
        style={{ color: props.accent ?? "var(--text-display)" }}
      >
        {props.value}
      </div>
    </div>
  );
}

function AdminModuleCard(props: {
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  eyebrow: string;
}) {
  const Icon = props.icon;

  return (
    <Link
      href={props.href}
      className="group block rounded-3xl border p-8 transition-all"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
          {props.eyebrow}
        </div>
        <Icon className="h-6 w-6" style={{ color: "var(--text-muted)" }} />
      </div>
      <div
        className="mb-2 text-3xl font-black tracking-tight"
        style={{ color: "var(--text-display)" }}
      >
        {props.title}
      </div>
      <p className="max-w-md text-sm" style={{ color: "var(--text-muted)" }}>
        {props.description}
      </p>
      <div
        className="mt-8 flex items-center gap-2 text-sm font-mono uppercase tracking-wide"
        style={{ color: "var(--bg-accent-glow)" }}
      >
        Open Module
        <ArrowUpRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default async function AdminDashboard() {
  const data = await getAdminDashboardData();

  return (
    <AdminPageShell className="min-h-full p-6 md:px-6 md:py-12">
      <div className="mx-auto mb-8 max-w-7xl">
        <AdminPageHeader
          eyebrow="Admin Control / Server Rendered"
          title={
            <>
              Command <span style={{ color: "var(--bg-accent-glow)" }}>Center</span>
            </>
          }
        />
      </div>

      <div className="mx-auto mb-8 grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-5">
        <StatCard label="Projects" value={data.projectCount} />
        <StatCard label="Journey Steps" value={data.aboutMilestoneCount} />
        <StatCard label="Signals" value={data.contactCount} />
        <StatCard label="Analytics" value={data.analyticsCount} />
        <StatCard
          label="Unique Visitors"
          value={data.uniqueVisitorCount}
          accent="var(--bg-accent-glow)"
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2">
        <AdminModuleCard
          title="Incoming Signals"
          description="Review contact submissions with server-rendered filters and paginated Neon records."
          href="/admin/contact-list"
          icon={MessageSquare}
          eyebrow="Contact"
        />
        <AdminModuleCard
          title="Visitor Analytics"
          description="Inspect paginated visitor events, device breakdowns, and Neon-backed analytics metrics."
          href="/admin/analytics"
          icon={BarChart3}
          eyebrow="Analytics"
        />
        <AdminModuleCard
          title="Project CMS"
          description="Edit portfolio projects with a server-first Neon bootstrap and local staging before sync."
          href="/admin/projects-handling"
          icon={FolderKanban}
          eyebrow="Projects"
        />
        <AdminModuleCard
          title="Career Journey"
          description="Manage the about timeline with server-loaded milestones and synced Neon persistence."
          href="/admin/about-handling"
          icon={User}
          eyebrow="About"
        />
      </div>

      <div
        className="mx-auto mt-8 flex max-w-7xl items-center justify-between border-t pt-6"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <div className="text-xs font-mono uppercase">Neon Database Active</div>
        <div className="flex items-center gap-3">
          <Database className="h-4 w-4" />
          <Users className="h-4 w-4" />
          <Activity className="h-4 w-4" />
        </div>
      </div>
    </AdminPageShell>
  );
}
