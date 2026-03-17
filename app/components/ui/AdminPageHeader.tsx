import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  eyebrow,
  title,
  actions,
  className = "",
}: AdminPageHeaderProps) {
  return (
    <div
      className={`flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end ${className}`.trim()}
    >
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span
            className="h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: "var(--bg-accent-glow)" }}
          />
          <h5
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {eyebrow}
          </h5>
        </div>
        <h1
          className="text-4xl font-black uppercase tracking-tighter md:text-5xl"
          style={{ color: "var(--text-display)" }}
        >
          {title}
        </h1>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}
