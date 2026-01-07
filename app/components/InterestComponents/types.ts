import { LucideIcon } from "lucide-react";

export interface InterestItem {
  category: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
  image: string;
  overlayText: string;
  metadata: {
    label: string;
    value: string;
  }[];
  stats?: string;
}
