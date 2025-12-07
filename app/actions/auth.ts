"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  // HARDCODED CREDENTIALS
  // In a real app, use environment variables: process.env.ADMIN_USER
  const VALID_USER = "jaimeen";
  const VALID_PASS = "jaimeen0315";

  if (username === VALID_USER && password === VALID_PASS) {
    // Set cookie valid for 24 hours (86400 seconds)
    const oneDay = 24 * 60 * 60; // in seconds

    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: oneDay,
      path: "/",
    });

    redirect("/admin");
  } else {
    return { error: "Invalid credentials" };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}
