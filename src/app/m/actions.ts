"use server";

import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";
import { loadSession } from "@/lib/content";
import { COINS, ensureProgress } from "@/lib/progress";

const ID = /^[a-z0-9-]+$/;

export async function logEvent(
  moduleId: string,
  sessionId: string,
  cardId: string,
  eventType: "viewed" | "chose" | "rewound",
  payload: Record<string, unknown> = {},
) {
  const t = await requireTeacher();
  if (![moduleId, sessionId, cardId].every((s) => ID.test(s))) return;
  await db().from("card_events").insert({
    teacher_id: t.id,
    module_id: moduleId,
    session_id: sessionId,
    card_id: cardId,
    event_type: eventType,
    payload,
  });
}

export async function saveReflection(moduleId: string, sessionId: string, promptId: string, text: string) {
  const t = await requireTeacher();
  const clean = text.trim().slice(0, 2000);
  if (!clean || ![moduleId, sessionId, promptId].every((s) => ID.test(s))) return { error: "Nothing to save." };
  await db().from("reflections").insert({
    teacher_id: t.id,
    module_id: moduleId,
    session_id: sessionId,
    prompt_id: promptId,
    text: clean,
  });
  return { ok: true };
}

/** Marks a session complete once, awards coins once, and advances unlocks. Returns coins earned (0 if already done). */
export async function completeSession(moduleId: string, sessionId: string): Promise<{ coins: number }> {
  const t = await requireTeacher();
  if (!ID.test(moduleId) || !ID.test(sessionId)) return { coins: 0 };
  const session = await loadSession(moduleId, sessionId);
  if (!session) return { coins: 0 };

  const { data: done } = await db()
    .from("card_events")
    .select("id")
    .eq("teacher_id", t.id)
    .eq("module_id", moduleId)
    .eq("session_id", sessionId)
    .eq("event_type", "session_completed")
    .limit(1);
  if (done && done.length) return { coins: 0 };

  // Distinct cards this teacher viewed in this session
  const { data: viewed } = await db()
    .from("card_events")
    .select("card_id")
    .eq("teacher_id", t.id)
    .eq("module_id", moduleId)
    .eq("session_id", sessionId)
    .eq("event_type", "viewed");
  const distinct = new Set((viewed ?? []).map((r) => r.card_id as string)).size;
  const coins = distinct * COINS.card + COINS.session;

  await db().from("card_events").insert({
    teacher_id: t.id, module_id: moduleId, session_id: sessionId, card_id: "session", event_type: "session_completed", payload: { coins },
  });
  await db().from("coin_ledger").insert([
    { teacher_id: t.id, delta: distinct * COINS.card, reason: "cards", ref: `${moduleId}/${sessionId}` },
    { teacher_id: t.id, delta: COINS.session, reason: "session_bonus", ref: `${moduleId}/${sessionId}` },
  ]);

  const p = await ensureProgress(t.id, moduleId);
  const nextN = session.n + 1;
  if (nextN > p.unlocked_until) {
    // Unlock rhythm (next session the day after) lands with the streak work; for now unlock immediately.
    await db().from("module_progress").update({ unlocked_until: nextN }).eq("teacher_id", t.id).eq("module_id", moduleId);
  }
  return { coins };
}
