"use client";

import { useState } from "react";
import type { Card, T } from "@/lib/content";

type Lang = "en" | "hi";
const t = (x: T, lang: Lang) => (lang === "hi" && x.hi ? x.hi : x.en);

export default function Tiles({
  card,
  lang,
  onDone,
}: {
  card: Extract<Card, { type: "tiles" }>;
  lang: Lang;
  onDone: (picked: string[], score: number) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const sel = card.tiles.filter((x) => picked.includes(x.key));
  const result: Record<string, boolean> = {};
  for (const test of card.tests) {
    const passed = sel.some((x) => x.passes.includes(test.key));
    const broken = sel.some((x) => x.breaks?.includes(test.key));
    result[test.key] = passed && !broken;
  }
  const score = Object.values(result).filter(Boolean).length;
  const notes = sel.filter((x) => x.note);

  function toggle(k: string) {
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : p.length < card.max ? [...p, k] : p));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{L("Build it", "बनाइए")}</div>
      <h2 className="font-serif text-[24px] font-semibold leading-[30px] text-plum">{t(card.title, lang)}</h2>
      <p className={`text-muted ${lang === "hi" ? "hi" : ""}`}>{t(card.intro, lang)}</p>

      <div className="grid grid-cols-4 gap-2">
        {card.tests.map((test) => (
          <div key={test.key} className={`rounded-md p-2 text-center text-[12px] font-semibold ${result[test.key] ? "bg-success/15 text-success" : "bg-cream text-muted"}`}>
            <div className="text-[18px]">{result[test.key] ? "✓" : "–"}</div>
            {t(test.name, lang)}
          </div>
        ))}
      </div>
      <p className="text-sm text-muted">
        {L(`Pick up to ${card.max}. Passing ${score} of ${card.tests.length} tests.`, `ज़्यादा से ज़्यादा ${card.max} चुनिए। ${card.tests.length} में से ${score} जाँच पास।`)}
      </p>

      <div className="flex flex-col gap-2">
        {card.tiles.map((x) => {
          const on = picked.includes(x.key);
          return (
            <button
              key={x.key}
              type="button"
              onClick={() => toggle(x.key)}
              className={`rounded-lg border p-3 text-left text-[16px] leading-[24px] ${on ? "border-purple bg-mist" : "border-line-strong bg-raised"} ${lang === "hi" ? "hi" : ""}`}
            >
              {on && <span className="mr-2 text-accent">✓</span>}
              {t(x.text, lang)}
            </button>
          );
        })}
      </div>

      {notes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {notes.map((x) => (
            <li key={x.key} className={`rounded-md border-l-4 border-sunrise-deep bg-cream p-3 text-[15px] ${lang === "hi" ? "hi" : ""}`}>
              {t(x.note!, lang)}
            </li>
          ))}
        </ul>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface via-surface to-transparent px-4 pb-6 pt-8">
        <button
          type="button"
          disabled={picked.length === 0}
          onClick={() => onDone(picked, score)}
          className="mx-auto block h-12 w-full max-w-md rounded-md bg-purple text-[15px] font-semibold text-white disabled:opacity-40"
        >
          {score === card.tests.length ? L("All four. Continue", "चारों पास। आगे") : L("Continue with this", "इसी के साथ आगे")}
        </button>
      </div>
      <div className="h-16" />
    </div>
  );
}
