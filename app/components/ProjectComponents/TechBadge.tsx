interface TechBadgeProps {
  tech: string;
}

export const TechBadge = ({ tech }: TechBadgeProps) => (
  <span className="px-2 py-1 bg-neutral-100 border border-neutral-200 text-[10px] uppercase tracking-wide font-medium rounded-md text-neutral-600">
    {tech}
  </span>
);

