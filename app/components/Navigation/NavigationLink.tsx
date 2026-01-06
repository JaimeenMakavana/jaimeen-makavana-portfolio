import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { NavigationLink } from "./useNavigationHover";

interface NavigationLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  activeLink: NavigationLink;
  linkId: NavigationLink;
  onMouseEnter: (link: NavigationLink) => void;
  onMouseLeave: () => void;
}

export const NavigationLinkItem = ({
  href,
  label,
  icon: Icon,
  activeLink,
  linkId,
  onMouseEnter,
  onMouseLeave,
}: NavigationLinkProps) => {
  const isActive = activeLink === linkId;

  return (
    <Link
      href={href}
      className="relative px-3 py-3 rounded-full flex items-center justify-center transition-all hover:scale-110 group"
      style={{
        backgroundColor: "transparent",
        color: isActive ? "var(--bg-accent-glow)" : "var(--nav-text-idle)",
      }}
      onMouseEnter={() => onMouseEnter(linkId)}
      onMouseLeave={onMouseLeave}
      aria-label={label}
    >
      <Icon className="w-5 h-5 transition-all duration-300" strokeWidth={1} />
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 rounded whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          backgroundColor: "var(--nav-surface)",
          color: isActive ? "var(--bg-accent-glow)" : "var(--nav-text-idle)",
        }}
      >
        {label}
      </span>
    </Link>
  );
};
