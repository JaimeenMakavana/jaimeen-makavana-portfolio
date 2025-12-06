import { Github, Linkedin } from "lucide-react";

export const CONTACT_INFO = {
  email: "jaimeen.makavana@gmail.com",
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/jaimeen-makavana/",
      icon: Linkedin,
    },
    {
      label: "GitHub",
      href: "https://github.com/JaimeenMakavana",
      icon: Github,
    },
  ],
  calendlyLink: "https://calendly.com/jaimeen/15min",
};

export const INTENT_OPTIONS = [
  {
    id: "project",
    label: "New Project",
    desc: "Building a product from scratch",
  },
  { id: "hiring", label: "Hiring", desc: "Joining a technical team" },
  { id: "consulting", label: "Consulting", desc: "Architecture or AI advice" },
  { id: "hi", label: "Just Hi", desc: "Networking & vibes" },
];

export type FormState = {
  name: string;
  email: string;
  message: string;
  intent: string;
};
