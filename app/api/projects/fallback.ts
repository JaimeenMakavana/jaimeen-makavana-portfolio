import type { Project } from "@/app/components/ProjectComponents/types";

export const fallbackProjects: Project[] = [
  {
    id: "bookself",
    title: "Bookself",
    category: "Frontend Arch",
    tagline: "Book collection and management platform",
    description:
      "A modern web application for managing and organizing book collections. Built with focus on clean UI, responsive design, and intuitive user experience.",
    stack: ["React", "Next.js", "TypeScript"],
    complexity: 3,
    size: "medium",
    image: "/project-images/bookself-lg.png",
    imageMobile: "/project-images/bookself-sm.png",
    link: "https://books-collections-five.vercel.app/",
  },
  {
    id: "growth-vector",
    title: "Growth Vector",
    category: "Frontend Arch",
    tagline: "Growth analytics and visualization platform",
    description:
      "An analytics platform designed to track and visualize growth metrics. Features interactive dashboards and data visualization capabilities.",
    stack: ["React", "Next.js", "TypeScript"],
    complexity: 4,
    size: "medium",
    image: "/project-images/growth-vector-lg.png",
    imageMobile: "/project-images/growth-vector-sm.png",
    link: "https://growth-vector.vercel.app/",
  },
  {
    id: "agent-vis",
    title: "Agent Vis",
    category: "AI Engineering",
    tagline: "AI agent visualization and monitoring tool",
    description:
      "A visualization platform for monitoring and understanding AI agent behavior. Provides insights into agent decision-making processes and performance metrics.",
    stack: ["React", "Next.js", "TypeScript", "AI APIs"],
    complexity: 4,
    size: "medium",
    image: "/project-images/agent-vis-lg.png",
    imageMobile: "/project-images/agent-vis-sm.png",
    link: "https://agent-vis.vercel.app/",
  },
];
