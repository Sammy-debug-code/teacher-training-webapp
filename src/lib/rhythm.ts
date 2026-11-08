import { db } from "./db";

/** All dates in this app are Asia/Kolkata calendar days. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function istDate(d: Date = new Date()): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function isSunday(ymd: string): boolean {
  return new Date(`${ymd}T00:00:00Z`).getUTCDay() === 0;
}

export async function holidaySet(): Promise<Set<string>> {
  const { data } = await db().from("holidays").select("day");
  return new Set((data ?? []).map((r) => r.day as string));
}

export function isWorkingDay(ymd: string, holidays: Set<string>): boolean {
  return !isSunday(ymd) && !holidays.has(ymd);
}

/** The most recent working day strictly before `ymd`. */
export function previousWorkingDay(ymd: string, holidays: Set<string>): string {
  let d = addDays(ymd, -1);
  while (!isWorkingDay(d, holidays)) d = addDays(d, -1);
  return d;
}

export type Rhythm = {
  today: string;
  streak: number;
  /** Set when a penalty was applied on this visit: the day that was missed and coins lost. */
  missed?: { day: string; lost: number };
};

/**
 * Record today's visit, compute the streak, and apply the missed-day penalty once if due.
 * Streak counts consecutive working days with a visit, ending today. Sundays and holidays
 * neither count nor break it.
 */
export async function recordVisit(teacherId: string): Promise<Rhythm> {
  const today = istDate();
  const holidays = await holidaySet();

  const { data: rows } = await db()
    .from("daily_visits")
    .select("visit_date")
    .eq("teacher_id", teacherId)
    .order("visit_date", { ascending: false })
    .limit(60);
  const visits = new Set((rows ?? []).map((r) => r.visit_date as string));
  const firstVisitEver = visits.size === 0;

  if (!visits.has(today)) {
    await db().from("daily_visits").upsert({ teacher_id: teacherId, visit_date: today });
    visits.add(today);
  }

  let missed: Rhythm["missed"];
  if (!firstVisitEver) {
    const lastWorking = previousWorkingDay(today, holidays);
    const lastVisit = [...visits].filter((d) => d !== today).sort().pop();
    if (lastVisit && lastVisit < lastWorking) {
      // At least one working day was skipped since the last visit. Penalise once per missed stretch.
      const ref = `missed:${lastWorking}`;
      const { data: already } = await db().from("coin_ledger").select("id").eq("teacher_id", teacherId).eq("ref", ref).limit(1);
      if (!already || already.length === 0) {
        const { data: led } = await db().from("coin_ledger").select("delta").eq("teacher_id", teacherId);
        const balance = (led ?? []).reduce((s, r) => s + (r.delta as number), 0);
        const lost = Math.floor(balance / 2);
        if (lost > 0) {
          await db().from("coin_ledger").insert({ teacher_id: teacherId, delta: -lost, reason: "missed_day", ref });
        }
        missed = { day: lastWorking, lost };
      }
    }
  }

  // Streak: consecutive working days with a visit, ending at today (or, on a Sunday/holiday, at the last working day).
  let streak = 0;
  let d = isWorkingDay(today, holidays) ? today : previousWorkingDay(today, holidays);
  while (visits.has(d) && streak < 60) {
    streak += 1;
    d = previousWorkingDay(d, holidays);
  }
  return { today, streak, missed };
}

/**
 * Which session number is open today. Session 1 is always open.
 * Session n+1 opens on any day after the day session n was completed (Sundays and holidays
 * do not matter here: the day after a Saturday completion is Sunday, and the teacher may use it).
 */
export function openSessionNumber(completedOn: Map<number, string>, today: string): number {
  let n = 1;
  while (completedOn.has(n)) {
    if (completedOn.get(n)! < today) n += 1;
    else return n; // completed today: next one opens tomorrow
  }
  return n;
}

/** Map of session number → IST date it was completed. */
export async function completionDates(teacherId: string, moduleId: string): Promise<Map<number, string>> {
  const { data } = await db()
    .from("card_events")
    .select("session_id, created_at")
    .eq("teacher_id", teacherId)
    .eq("module_id", moduleId)
    .eq("event_type", "session_completed");
  const m = new Map<number, string>();
  for (const r of data ?? []) {
    const n = Number(String(r.session_id).replace(/^s/, ""));
    if (!Number.isNaN(n)) m.set(n, istDate(new Date(r.created_at as string)));
  }
  return m;
}
