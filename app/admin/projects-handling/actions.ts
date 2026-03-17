"use server";

import { revalidatePath } from "next/cache";

import type { Project } from "@/app/components/ProjectComponents/types";
import { replaceProjects } from "@/app/lib/projects/repository";

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") {
    return false;
  }

  const project = value as Record<string, unknown>;

  return (
    typeof project.id === "string" &&
    typeof project.title === "string" &&
    typeof project.category === "string" &&
    typeof project.tagline === "string" &&
    typeof project.description === "string" &&
    Array.isArray(project.stack) &&
    project.stack.every((item) => typeof item === "string") &&
    typeof project.complexity === "number" &&
    typeof project.size === "string" &&
    typeof project.image === "string" &&
    (typeof project.imageMobile === "string" ||
      typeof project.imageMobile === "undefined") &&
    (typeof project.link === "string" || typeof project.link === "undefined") &&
    (typeof project.stat === "string" || typeof project.stat === "undefined")
  );
}

export async function syncProjects(projects: unknown) {
  if (!Array.isArray(projects) || !projects.every(isProject)) {
    throw new Error("Invalid projects payload");
  }

  await replaceProjects(projects);
  revalidatePath("/projects");
  revalidatePath("/admin/projects-handling");
}
