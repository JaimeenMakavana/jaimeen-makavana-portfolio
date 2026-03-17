export type ProjectSize =
  | "small"   // 1×1
  | "medium"  // 2×1
  | "tall"    // 1×2
  | "large"   // 2×2
  | "wide3"   // 3×1
  | "block3x2" // 3×2
  | "full"    // 4×1
  | "tall3";  // 1×3

export type ProjectCategory =
  | "AI Engineering"
  | "System Design"
  | "Frontend Arch"
  | "Migration";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  tagline: string;
  description: string;
  stack: string[];
  complexity: number;
  size: ProjectSize;
  image: string;
  imageMobile?: string;
  link?: string;
  stat?: string;
}

