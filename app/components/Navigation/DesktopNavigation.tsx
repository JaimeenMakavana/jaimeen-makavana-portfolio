import { FolderKanban, Home, Mail, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { NavigationLinkItem } from "./NavigationLink";
import { NavigationLink } from "./useNavigationHover";
import { ThemeToggle } from "../ThemeToggle";

interface DesktopNavigationProps {
  activeLink: NavigationLink;
  onMouseEnter: (link: NavigationLink) => void;
  onMouseLeave: () => void;
}

const NAVIGATION_ITEMS = [
  { id: "home" as const, href: "/", label: "Home", icon: Home },
  { id: "about" as const, href: "/about", label: "About", icon: User },
  {
    id: "projects" as const,
    href: "/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  { id: "contact" as const, href: "/contact", label: "Contact", icon: Mail },
] as const;

export const DesktopNavigation = ({
  activeLink,
  onMouseEnter,
  onMouseLeave,
}: DesktopNavigationProps) => {
  // Split items for top and bottom of FAB
  const topItems = NAVIGATION_ITEMS.slice(0, 2);
  const bottomItems = NAVIGATION_ITEMS.slice(2);

  return (
    <nav
      className="hidden md:block fixed left-6 top-1/2 -translate-y-1/2 z-50"
      aria-label="Main navigation"
    >
      {/* Center Sparkles FAB */}
      <div className="relative group p-2">
        <Link
          href="/jiva"
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: "var(--bg-accent-glow)",
            color: "black",
          }}
          aria-label="jiva"
        >
          <Sparkles className="w-5 h-5" strokeWidth={1} />
        </Link>
        <span
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 rounded whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: "var(--nav-surface)",
            color: "var(--bg-accent-glow)",
          }}
        >
          Jiva agent
        </span>
      </div>
      <div
        className="px-2 py-2 rounded-full flex flex-col items-center gap-3 shadow-lg"
        style={{
          backgroundColor: "var(--nav-surface)",
          color: "var(--nav-text-idle)",
        }}
      >
        {/* Top items */}
        {topItems.map((item) => (
          <NavigationLinkItem
            key={item.id}
            href={item.href}
            label={item.label}
            icon={item.icon}
            activeLink={activeLink}
            linkId={item.id}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        ))}

        {/* Bottom items */}
        {bottomItems.map((item) => (
          <NavigationLinkItem
            key={item.id}
            href={item.href}
            label={item.label}
            icon={item.icon}
            activeLink={activeLink}
            linkId={item.id}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        ))}

        {/* Theme Toggle */}
        <ThemeToggle variant="desktop" />
      </div>
    </nav>
  );
};
