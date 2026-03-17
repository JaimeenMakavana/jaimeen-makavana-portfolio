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

export async function applyAnalyticsFilters(formData: FormData) {
  const searchParams = new URLSearchParams();

  appendIfValue(searchParams, "deviceType", formData.get("deviceType"));
  appendIfValue(searchParams, "dateFrom", formData.get("dateFrom"));
  appendIfValue(searchParams, "dateTo", formData.get("dateTo"));

  redirect(
    searchParams.size > 0
      ? `/admin/analytics?${searchParams.toString()}`
      : "/admin/analytics"
  );
}
