"use server";

import { redirect } from "next/navigation";

function appendIfValue(
  searchParams: URLSearchParams,
  key: string,
  value: FormDataEntryValue | null
) {
  if (typeof value !== "string") {
    return;
  }

  const trimmed = value.trim();
  if (trimmed.length > 0 && trimmed !== "ALL") {
    searchParams.set(key, trimmed);
  }
}

export async function applyContactFilters(formData: FormData) {
  const searchParams = new URLSearchParams();

  appendIfValue(searchParams, "intent", formData.get("intent"));
  appendIfValue(searchParams, "search", formData.get("search"));

  redirect(
    searchParams.size > 0
      ? `/admin/contact-list?${searchParams.toString()}`
      : "/admin/contact-list"
  );
}
