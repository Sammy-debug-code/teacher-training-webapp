import { readFile } from "node:fs/promises";
import path from "node:path";

/** Bilingual text: English always, Hindi optional. */
export type T = { en: string; hi?: string };

export type Option = {
  key: string;
  text: T;
  /** Card id to go to after choosing. Defaults to the next card in order. */
  next?: string;
  /** Which rung of the ladder this response sits on (0 = no response, 1–5), or null for non-ladder choices. */
  rung?: number | null;
};

export type Card =
  | { id: string; type: "scene"; eyebrow?: T; text: T; prompt?: T; image?: string }
  | { id: string; type: "quote"; text: T; attribution: T }
  | { id: string; type: "choice"; question: T; options: Option[]; /** 'ladder' choices feed the metrics; 'poll' and 'rating' are baselines */ kind?: "ladder" | "poll" | "rating" }
  | { id: string; type: "consequence"; text: T; outcome: "rewind" | "continue"; back_to?: string; next?: string }
  | { id: string; type: "why"; title: T; points: T[] }
  | { id: string; type: "nugget"; title: T; text: T; source?: string }
  | { id: string; type: "ladder"; title: T; rungs: { n: number; name: T; line: T }[]; highlight?: number }
  | { id: string; type: "reflection"; prompt: T; placeholder?: T; min_chars?: number }
  | { id: string; type: "task"; title: T; text: T }
  | { id: string; type: "complete"; title: T; text: T };

export type Session = {
  id: string;
  n: number;
  title: T;
  minutes: number;
  cards: Card[];
};

export type Module = {
  id: string;
  title: T;
  subtitle: T;
  sessions: { id: string; n: number; title: T; minutes: number }[];
};

const ROOT = path.join(process.cwd(), "content");

export async function loadModule(moduleId: string): Promise<Module> {
  const raw = await readFile(path.join(ROOT, moduleId, "module.json"), "utf8");
  return JSON.parse(raw) as Module;
}

export async function loadSession(moduleId: string, sessionId: string): Promise<Session | null> {
  if (!/^[a-z0-9-]+$/.test(moduleId) || !/^[a-z0-9-]+$/.test(sessionId)) return null;
  try {
    const raw = await readFile(path.join(ROOT, moduleId, `${sessionId}.json`), "utf8");
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}
