"use server";

import { redirect } from "next/navigation";
import { verifyLogin } from "@/lib/auth";
import { clearSessionCookie } from "@/lib/session";

export async function loginAction(username: string, pin: string): Promise<{ error?: string }> {
  if (!/^[a-z0-9._-]{2,40}$/.test(username)) return { error: "Please enter your username." };
  if (!/^\d{4}$/.test(pin)) return { error: "PIN must be 4 digits." };
  const res = await verifyLogin(username, pin);
  if (res.error) return { error: res.error };
  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
