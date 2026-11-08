import bcrypt from "bcryptjs";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "./db";
import { readSession, setSessionCookie } from "./session";

export type Teacher = {
  id: string;
  username: string;
  display_name: string;
  section: "junior" | "senior";
  is_admin: boolean;
  is_active: boolean;
};

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function verifyLogin(username: string, pin: string): Promise<{ teacher?: Teacher; error?: string }> {
  const generic = "That username and PIN don't match.";
  const { data: t } = await db()
    .from("teachers")
    .select("id, username, display_name, section, is_admin, is_active, pin_hash, failed_attempts, locked_until")
    .eq("username", username)
    .maybeSingle();

  if (!t || !t.is_active) return { error: generic };
  if (t.locked_until && new Date(t.locked_until) > new Date()) {
    return { error: `Too many wrong attempts. Try again in ${LOCK_MINUTES} minutes.` };
  }

  const ok = await bcrypt.compare(pin, t.pin_hash);
  if (!ok) {
    const attempts = (t.failed_attempts ?? 0) + 1;
    const locked = attempts >= MAX_ATTEMPTS;
    await db()
      .from("teachers")
      .update({
        failed_attempts: locked ? 0 : attempts,
        locked_until: locked ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() : null,
      })
      .eq("id", t.id);
    return { error: locked ? `Too many wrong attempts. Try again in ${LOCK_MINUTES} minutes.` : generic };
  }

  await db()
    .from("teachers")
    .update({ failed_attempts: 0, locked_until: null, last_seen_at: new Date().toISOString() })
    .eq("id", t.id);
  await setSessionCookie(t.id);
  const { pin_hash: _p, failed_attempts: _f, locked_until: _l, ...teacher } = t;
  void _p; void _f; void _l;
  return { teacher: teacher as Teacher };
}

/** The logged-in teacher, or null. Cached per request. */
export const currentTeacher = cache(async (): Promise<Teacher | null> => {
  const s = await readSession();
  if (!s) return null;
  const { data } = await db()
    .from("teachers")
    .select("id, username, display_name, section, is_admin, is_active")
    .eq("id", s.tid)
    .maybeSingle();
  if (!data || !data.is_active) return null;
  return data as Teacher;
});

export async function requireTeacher(): Promise<Teacher> {
  const t = await currentTeacher();
  if (!t) redirect("/login");
  return t;
}

export async function requireAdmin(): Promise<Teacher> {
  const t = await requireTeacher();
  if (!t.is_admin) redirect("/");
  return t;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}
