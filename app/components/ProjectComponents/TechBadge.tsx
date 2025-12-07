interface TechBadgeProps {
  tech: string;
}

export const TechBadge = ({ tech }: TechBadgeProps) => (
  <span
    className="px-2 py-1 text-[10px] uppercase tracking-wide font-medium rounded-md border"
    style={{
      backgroundColor: "var(--muted)",
      borderColor: "var(--border)",
      color: "var(--text-body)",
    }}
  >
    {tech}
  </span>
);
