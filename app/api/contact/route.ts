import { NextRequest, NextResponse } from "next/server";

import {
  createContactSubmission,
  getContactSubmissions,
} from "@/app/lib/contact/repository";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, intent } = body as Record<string, unknown>;

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(message) ||
      !isNonEmptyString(intent)
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const submission = await createContactSubmission({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      intent: intent.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Form submitted successfully",
        submissionId: submission.submissionId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving contact submission to Neon:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1),
      100
    );
    const intent = searchParams.get("intent");

    const { submissions, total } = await getContactSubmissions({
      limit,
      intent,
    });

    return NextResponse.json(
      {
        success: true,
        count: submissions.length,
        total,
        submissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching contact submissions from Neon:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch submissions";

    return NextResponse.json(
      {
        error: `An unexpected error occurred: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
