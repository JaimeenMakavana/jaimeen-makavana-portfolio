import { useState, useCallback } from "react";

export type NavigationLink =
  | "home"
  | "about"
  | "skills"
  | "projects"
  | "interests"
  | "contact"
  | "jiva"
  | null;

export const useNavigationHover = () => {
  const [hoveredLink, setHoveredLink] = useState<NavigationLink>(null);

  const handleMouseEnter = useCallback((link: NavigationLink) => {
    setHoveredLink(link);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredLink(null);
  }, []);

  return {
    hoveredLink,
    handleMouseEnter,
    handleMouseLeave,
  };
};
