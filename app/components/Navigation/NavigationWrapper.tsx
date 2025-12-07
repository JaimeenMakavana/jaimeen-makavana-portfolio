"use client";

import { usePathname } from "next/navigation";
import { useNavigationHover } from "./useNavigationHover";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { NavigationLink } from "./useNavigationHover";

export const NavigationWrapper = () => {
  const pathname = usePathname();
  const { hoveredLink, handleMouseEnter, handleMouseLeave } =
    useNavigationHover();

  // Hide navigation on login and admin pages
  if (pathname === "/login" || pathname?.startsWith("/admin")) {
    return null;
  }

  // 1. DERIVED STATE LOGIC
  // Instead of storing state, we calculate it instantly based on the URL.
  // This acts as the "Single Source of Truth".
  const getActiveLink = (path: string | null): NavigationLink => {
    if (!path) return null;
    if (path === "/") return "home";
    if (path.startsWith("/about")) return "about"; // startsWith is safer for nested routes
    if (path.startsWith("/projects")) return "projects";
    if (path.startsWith("/contact")) return "contact";
    if (path.startsWith("/jiva")) return "jiva";
    return null;
  };

  const activeLink = getActiveLink(pathname);

  return (
    <>
      <DesktopNavigation
        activeLink={activeLink}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <MobileBottomNavigation activeLink={activeLink} />
    </>
  );
};
