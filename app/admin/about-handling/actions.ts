"use server";

import { revalidatePath } from "next/cache";

import {
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

export async function syncAboutMilestones(milestones: unknown) {
  if (!Array.isArray(milestones) || !milestones.every(isValidMilestone)) {
    throw new Error("Invalid milestones payload");
  }

  await replaceAboutMilestones(milestones);
  revalidatePath("/about");
  revalidatePath("/admin/about-handling");
}
