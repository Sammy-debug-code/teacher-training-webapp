import { db } from "./db";

export const COINS = { card: 10, session: 50, checkin: 20 } as const;

export async function coinBalance(teacherId: string): Promise<number> {
  const { data } = await db().from("coin_ledger").select("delta").eq("teacher_id", teacherId);
  return (data ?? []).reduce((s, r) => s + (r.delta as number), 0);
}

export type Progress = {
  started_at: string;
  completed_at: string | null;
  current_day: number;
  unlocked_until: number;
};

export async function getProgress(teacherId: string, moduleId: string): Promise<Progress | null> {
  const { data } = await db()
    .from("module_progress")
    .select("started_at, completed_at, current_day, unlocked_until")
    .eq("teacher_id", teacherId)
    .eq("module_id", moduleId)
    .maybeSingle();
  return (data as Progress | null) ?? null;
}

export async function ensureProgress(teacherId: string, moduleId: string): Promise<Progress> {
  const existing = await getProgress(teacherId, moduleId);
  if (existing) return existing;
  await db().from("module_progress").insert({ teacher_id: teacherId, module_id: moduleId });
  return (await getProgress(teacherId, moduleId))!;
}

/** Session ids the teacher has completed, from the event log. */
export async function completedSessions(teacherId: string, moduleId: string): Promise<Set<string>> {
  const { data } = await db()
    .from("card_events")
    .select("session_id")
    .eq("teacher_id", teacherId)
    .eq("module_id", moduleId)
    .eq("event_type", "session_completed");
  return new Set((data ?? []).map((r) => r.session_id as string));
}
