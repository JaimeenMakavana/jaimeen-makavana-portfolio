import { NextRequest, NextResponse } from "next/server";

import {
  deleteAboutMilestones,
  getAboutMilestones,
  replaceAboutMilestones,
  type AboutMilestone,
} from "@/app/lib/about/repository";

function isValidMilestone(value: unknown): value is AboutMilestone {
  if (!value || typeof value !== "object") {
    return false;
  }

  const milestone = value as Record<string, unknown>;

  return (
    typeof milestone.id === "string" &&
    typeof milestone.era === "string" &&
    typeof milestone.title === "string" &&
    typeof milestone.description === "string" &&
    typeof milestone.image === "string"
  );
}

export async function GET() {
  try {
    const data = await getAboutMilestones();

    return NextResponse.json({
      found: data.length > 0,
      data: data.length > 0 ? data : null,
    });
  } catch (error) {
    console.error("Error fetching about data from Neon:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch about data";

    return NextResponse.json(
      { error: `Failed to fetch about data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body as { data?: unknown };

    if (!Array.isArray(data) || !data.every(isValidMilestone)) {
      return NextResponse.json(
        { error: "Invalid request: data must be an array of milestones" },
        { status: 400 }
      );
    }

    await replaceAboutMilestones(data);

    return NextResponse.json({
      success: true,
      message: "About data synced successfully",
    });
  } catch (error) {
    console.error("Error saving about data to Neon:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to save about data";

    return NextResponse.json(
      { error: `Failed to save: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await deleteAboutMilestones();

    return NextResponse.json({
      success: true,
      message: "About data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting about data from Neon:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete about data";

    return NextResponse.json(
      { error: `Failed to delete: ${errorMessage}` },
      { status: 500 }
    );
  }
}
