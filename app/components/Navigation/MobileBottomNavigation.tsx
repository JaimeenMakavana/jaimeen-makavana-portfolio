"use client";

import { FolderKanban, Home, Mail, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { NavigationLink } from "./useNavigationHover";

interface MobileBottomNavigationProps {
  activeLink: NavigationLink;
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

export const MobileBottomNavigation = ({
  activeLink,
}: MobileBottomNavigationProps) => {
  // Split items for left and right sides of FAB
  const leftItems = NAVIGATION_ITEMS.slice(0, 2);
  const rightItems = NAVIGATION_ITEMS.slice(2);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      aria-label="Mobile navigation"
    >
      <div
        className="relative flex items-center justify-between p-4 m-1 rounded-2xl"
        style={{
          backgroundColor: "var(--nav-surface)",
          opacity: 0.85,
        }}
      >
        {/* Left side items */}
        {leftItems.map((item) => {
          const isActive = activeLink === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-all active:scale-95"
              aria-label={item.label}
            >
              <div
                className="p-1 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: "transparent",
                  color: isActive
                    ? "var(--bg-accent-glow)"
                    : "var(--nav-text-idle)",
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={1} />
              </div>
              <span
                className="text-xs font-medium transition-colors"
                style={{
                  color: isActive
                    ? "var(--bg-accent-glow)"
                    : "var(--nav-text-idle)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center FAB with Sparkles */}
        <div className="relative group">
          <Link
            href="/jiva"
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 hover:scale-105"
            style={{
              backgroundColor: "var(--bg-accent-glow)",
              color: "var(--text-body)",
            }}
            aria-label="jiva"
          >
            <Sparkles className="w-6 h-6" strokeWidth={1} />
          </Link>
          <span
            className="absolute left-full ml-3 px-2 py-1 rounded whitespace-nowrap text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              backgroundColor: "var(--nav-surface)",
              color: "var(--bg-accent-glow)",
            }}
          >
            jiva agent
          </span>
        </div>

        {/* Right side items */}
        {rightItems.map((item) => {
          const isActive = activeLink === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-1 transition-all active:scale-95"
              aria-label={item.label}
            >
              <div
                className="p-1 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: "transparent",
                  color: isActive
                    ? "var(--bg-accent-glow)"
                    : "var(--nav-text-idle)",
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={1} />
              </div>
              <span
                className="text-xs font-medium transition-colors"
                style={{
                  color: isActive
                    ? "var(--bg-accent-glow)"
                    : "var(--nav-text-idle)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
