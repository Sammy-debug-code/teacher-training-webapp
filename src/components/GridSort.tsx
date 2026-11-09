"use client";

import { useState } from "react";
import type { Card, T } from "@/lib/content";

type Q = "harsh" | "soft" | "absent" | "warmstrict";
type Lang = "en" | "hi";
type GridCard = Extract<Card, { type: "grid" }>;

const POS: Record<Q, string> = {
  soft: "row-start-1 col-start-1",      // high warmth, low structure
  warmstrict: "row-start-1 col-start-2", // high warmth, high structure
  absent: "row-start-2 col-start-1",    // low warmth, low structure
  harsh: "row-start-2 col-start-2",     // low warmth, high structure
};

const HINT: Record<Q, Record<Lang, string>> = {
  soft: { en: "Warm, few rules", hi: "अपनापन, कम नियम" },
  warmstrict: { en: "Warm, firm rules", hi: "अपनापन, पक्के नियम" },
  absent: { en: "Cold, few rules", hi: "रूखा, कम नियम" },
  harsh: { en: "Cold, firm rules", hi: "रूखा, पक्के नियम" },
};

function t(x: T, lang: Lang) {
  return lang === "hi" && x.hi ? x.hi : x.en;
}

export default function GridSort({
  card,
  lang,
  onDone,
}: {
  card: GridCard;
  lang: Lang;
  onDone: (placements: Record<string, Q>, correct: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<Record<string, Q>>({});
  const [reveal, setReveal] = useState(false);
  const item = card.items[idx];
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  function place(q: Q) {
    const next = { ...placed, [item.key]: q };
    setPlaced(next);
    if (idx + 1 < card.items.length) setIdx(idx + 1);
    else setReveal(true);
  }
  const correct = card.items.filter((it) => placed[it.key] === it.answer).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{L("Sort", "छाँटिए")}</div>
      <h2 className="font-serif text-[24px] font-semibold leading-[30px] text-plum">{t(card.title, lang)}</h2>
      {card.intro && !reveal && <p className="text-muted">{t(card.intro, lang)}</p>}

      {!reveal && (
        <div className="rounded-lg bg-cream p-4">
          <p className="text-sm text-muted">
            {idx + 1} / {card.items.length}
          </p>
          <p className={`mt-1 text-[19px] leading-[28px] ${lang === "hi" ? "hi" : ""}`}>“{t(item.text, lang)}”</p>
          <p className="mt-2 text-sm text-muted">{L("Tap where this teacher belongs.", "टैप कीजिए कि यह टीचर कहाँ है।")}</p>
        </div>
      )}

      {/* the 2x2 */}
      <div className="relative">
        <div className="mb-1 flex justify-between pl-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span>{L("↑ More warmth", "↑ ज़्यादा अपनापन")}</span>
          <span>{L("More rules →", "ज़्यादा नियम →")}</span>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-2 pl-3">
          {(Object.keys(POS) as Q[]).map((q) => {
            const mine = card.items.filter((it) => placed[it.key] === q);
            return (
              <button
                key={q}
                type="button"
                disabled={reveal}
                onClick={() => place(q)}
                className={`min-h-[120px] rounded-lg border p-2 text-left transition ${
                  reveal
                    ? q === "warmstrict"
                      ? "border-purple bg-mist"
                      : "border-line bg-raised"
                    : "border-line-strong bg-raised active:bg-mist"
                } ${POS[q]}`}
              >
                <div className={`text-[13px] font-bold ${reveal ? "text-plum" : "text-muted"}`}>
                  {reveal ? t(card.quadrants[q].name, lang) : HINT[q][lang]}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {mine.map((it) => (
                    <span
                      key={it.key}
                      className={`rounded-sm px-1.5 py-0.5 text-[11px] font-semibold ${
                        reveal ? (it.answer === q ? "bg-success/15 text-success" : "bg-danger/10 text-danger line-through") : "bg-mist text-accent"
                      }`}
                    >
                      {it.key}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {reveal && (
        <div className="flex flex-col gap-3">
          <p className="text-[15px]">
            {L(`You placed ${correct} of ${card.items.length} where the research would.`, `आपने ${card.items.length} में से ${correct} वहीं रखे जहाँ रिसर्च रखती।`)}
          </p>
          <ul className="flex flex-col gap-2">
            {(Object.keys(POS) as Q[]).map((q) => (
              <li key={q} className={`rounded-md p-3 ${q === "warmstrict" ? "bg-mist" : "bg-cream"}`}>
                <span className="font-semibold text-plum">{t(card.quadrants[q].name, lang)}: </span>
                <span className={lang === "hi" ? "hi" : ""}>{t(card.quadrants[q].verdict, lang)}</span>
              </li>
            ))}
          </ul>
          <ol className="text-sm text-muted">
            {card.items.map((it) => (
              <li key={it.key}>
                <b>{it.key}</b> “{t(it.text, lang)}” → {t(card.quadrants[it.answer].name, lang)}
              </li>
            ))}
          </ol>
          <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface via-surface to-transparent px-4 pb-6 pt-8">
            <button
              type="button"
              onClick={() => onDone(placed, correct)}
              className="mx-auto block h-12 w-full max-w-md rounded-md bg-purple text-[15px] font-semibold text-white"
            >
              {L("Continue", "आगे")}
            </button>
          </div>
          <div className="h-16" />
        </div>
      )}
    </div>
  );
}
