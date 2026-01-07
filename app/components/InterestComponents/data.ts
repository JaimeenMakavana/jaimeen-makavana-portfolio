import { BookOpen, Activity, Gamepad2 } from "lucide-react";
import { InterestItem } from "./types";

export const INTERESTS_DATA: InterestItem[] = [
  {
    category: "LITERATURE • PERSONAL",
    title: "Book Reading",
    description:
      "Exploring worlds through words, from philosophy to fiction, technology to biographies. Each book is a journey into new perspectives and ideas.",
    icon: BookOpen,
    highlights: ["Philosophy", "Tech Literature", "Biographies", "Fiction"],
    image: "/interest/jaimeen_reading.png",
    overlayText: "200+ books read • Active reader",
    metadata: [
      { label: "GENRES", value: "Diverse" },
      { label: "PACE", value: "2-3/month" },
      { label: "FAVORITE", value: "Philosophy" },
    ],
    stats: "200+",
  },
  {
    category: "SPORTS • PASSION",
    title: "Cricket",
    description:
      "A passion for the gentleman's game. Following matches, analyzing strategies, and appreciating the artistry of both batting and bowling.",
    icon: Activity,
    highlights: ["Strategy", "Team Dynamics", "History", "Statistics"],
    image: "/interest/jaimeen_cricket.png",
    overlayText: "15+ years following • Strategy enthusiast",
    metadata: [
      { label: "FORMAT", value: "All formats" },
      { label: "FOCUS", value: "Strategy" },
      { label: "PASSION", value: "High" },
    ],
    stats: "15+",
  },
  {
    category: "ENTERTAINMENT • HOBBY",
    title: "Video Gaming",
    description:
      "Immersive storytelling, strategic gameplay, and the evolving art of interactive entertainment. From indie gems to AAA experiences.",
    icon: Gamepad2,
    highlights: ["Strategy Games", "RPGs", "Indie Titles", "Game Design"],
    image: "/interest/jaimeen_gaming.png",
    overlayText: "500+ hours played • Game design enthusiast",
    metadata: [
      { label: "GENRES", value: "RPG/Strategy" },
      { label: "PLATFORM", value: "PC/Console" },
      { label: "STYLE", value: "Strategic" },
    ],
    stats: "500+",
  },
];
