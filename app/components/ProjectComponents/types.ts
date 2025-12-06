export type ProjectSize = "small" | "medium" | "large" | "tall";

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
  link?: string;
  stat?: string;
}

