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

export type Level = { name: string; min: number };
export const LEVELS: Level[] = [
  { name: "Starter", min: 0 },
  { name: "Bronze", min: 300 },
  { name: "Silver", min: 800 },
  { name: "Gold", min: 1400 },
];

export function levelFor(lifetimeCoins: number) {
  let current: Level = LEVELS[0];
  for (const l of LEVELS) if (lifetimeCoins >= l.min) current = l;
  const next = LEVELS.find((l) => l.min > lifetimeCoins) ?? null;
  return { current, next };
}

/** Coins earned in total, ignoring penalties — this drives levels so a missed day never demotes anyone. */
export async function lifetimeCoins(teacherId: string): Promise<number> {
  const { data } = await db().from("coin_ledger").select("delta").eq("teacher_id", teacherId).gt("delta", 0);
  return (data ?? []).reduce((s, r) => s + (r.delta as number), 0);
}

export async function assignedModuleIds(teacherId: string): Promise<Set<string>> {
  const { data } = await db().from("module_assignments").select("module_id").eq("teacher_id", teacherId);
  return new Set((data ?? []).map((r) => r.module_id as string));
}
