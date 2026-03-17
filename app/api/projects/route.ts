import { NextRequest, NextResponse } from "next/server";
import type { Project } from "@/app/components/ProjectComponents/types";

import { fallbackProjects } from "@/app/api/projects/fallback";
import { getProjects, replaceProjects } from "@/app/lib/projects/repository";

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

export async function GET() {
  try {
    const data = await getProjects();

    if (data.length === 0) {
      return NextResponse.json({ found: false, data: fallbackProjects });
    }

    return NextResponse.json({
      found: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching projects from Neon:", error);
    return NextResponse.json({ found: false, data: fallbackProjects });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projects } = body as { projects?: unknown };

    if (!Array.isArray(projects) || !projects.every(isProject)) {
      return NextResponse.json(
        { error: "Invalid request: projects must be an array" },
        { status: 400 }
      );
    }

    await replaceProjects(projects);

    return NextResponse.json({
      success: true,
      message: "Projects synced successfully",
    });
  } catch (error) {
    console.error("Error saving projects to Neon:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save projects";

    return NextResponse.json(
      { error: `Failed to save: ${errorMessage}` },
      { status: 500 }
    );
  }
}
