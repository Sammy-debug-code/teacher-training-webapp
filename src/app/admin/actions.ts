"use server";

import { revalidatePath } from "next/cache";
import { hashPin, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

function randomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export type ActionResult = { ok?: string; error?: string; pin?: string; username?: string };

export async function addTeacher(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const display = String(form.get("display_name") ?? "").trim();
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const section = String(form.get("section") ?? "junior");
  if (display.length < 2) return { error: "Please enter the teacher's name." };
  if (!/^[a-z0-9._-]{2,40}$/.test(username)) return { error: "Username: lowercase letters, numbers, dots or dashes only." };
  if (!["junior", "senior"].includes(section)) return { error: "Pick a section." };
  const pin = randomPin();
  const { error } = await db().from("teachers").insert({
    username,
    display_name: display,
    pin_hash: await hashPin(pin),
    section,
  });
  if (error) return { error: error.code === "23505" ? `Username "${username}" is already taken.` : error.message };
  revalidatePath("/admin");
  return { ok: `${display} added.`, pin, username };
}

export async function resetPin(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const pin = randomPin();
  const { data, error } = await db()
    .from("teachers")
    .update({ pin_hash: await hashPin(pin), failed_attempts: 0, locked_until: null })
    .eq("id", id)
    .select("username")
    .maybeSingle();
  if (error || !data) return { error: "Could not reset the PIN." };
  revalidatePath("/admin");
  return { ok: `New PIN for ${data.username}.`, pin, username: data.username };
}

export async function setActive(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const active = String(form.get("active")) === "1";
  await db().from("teachers").update({ is_active: active }).eq("id", id);
  revalidatePath("/admin");
}
