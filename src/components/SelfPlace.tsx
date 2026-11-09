"use client";

import { useState } from "react";
import type { Card, T } from "@/lib/content";

type Lang = "en" | "hi";
type Pt = { x: number; y: number }; // 0..1, x = structure, y = warmth

function t(x: T, lang: Lang) {
  return lang === "hi" && x.hi ? x.hi : x.en;
}

export default function SelfPlace({
  card,
  lang,
  onDone,
}: {
  card: Extract<Card, { type: "selfplace" }>;
  lang: Lang;
  onDone: (me: Pt, students: Pt | null) => void;
}) {
  const [me, setMe] = useState<Pt | null>(null);
  const [them, setThem] = useState<Pt | null>(null);
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const stage: "me" | "them" | "done" = !me ? "me" : card.second_prompt && !them ? "them" : "done";

  function tap(e: React.MouseEvent<HTMLDivElement>) {
    if (stage === "done") return;
    const r = e.currentTarget.getBoundingClientRect();
    const p = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
    if (stage === "me") setMe(p);
    else setThem(p);
  }
  const dot = (p: Pt, cls: string, label: string) => (
    <div
      className={`absolute flex h-7 w-7 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold text-white ${cls}`}
      style={{ left: `${p.x * 100}%`, bottom: `${p.y * 100}%` }}
    >
      {label}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{L("Place yourself", "ख़ुद को रखिए")}</div>
      <h2 className="font-serif text-[24px] font-semibold leading-[30px] text-plum">{t(card.title, lang)}</h2>
      <p className={`text-[17px] ${lang === "hi" ? "hi" : ""}`}>
        {stage === "me" ? t(card.prompt, lang) : stage === "them" && card.second_prompt ? t(card.second_prompt, lang) : L("Look at the gap between the two.", "दोनों के बीच का फ़ासला देखिए।")}
      </p>
      <div className="relative">
        <div className="mb-1 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-muted">
          <span>{L("↑ More warmth", "↑ ज़्यादा अपनापन")}</span>
          <span>{L("More rules →", "ज़्यादा नियम →")}</span>
        </div>
        <div
          onClick={tap}
          role="button"
          aria-label="Grid"
          className="relative aspect-square w-full cursor-crosshair rounded-lg border border-line-strong bg-raised"
          style={{
            backgroundImage: "linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)",
            backgroundSize: "50% 50%",
          }}
        >
          <span className="absolute left-2 top-2 text-[11px] font-semibold text-muted">{L("Soft", "नरम")}</span>
          <span className="absolute right-2 top-2 text-[11px] font-semibold text-accent">{L("Warm & strict", "अपनापन और सख़्ती")}</span>
          <span className="absolute bottom-2 left-2 text-[11px] font-semibold text-muted">{L("Absent", "ग़ायब")}</span>
          <span className="absolute bottom-2 right-2 text-[11px] font-semibold text-muted">{L("Harsh", "कठोर")}</span>
          {me && dot(me, "bg-purple", L("Me", "मैं"))}
          {them && dot(them, "bg-sunrise", L("Kids", "बच्चे"))}
        </div>
      </div>
      {stage === "done" && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface via-surface to-transparent px-4 pb-6 pt-8">
            <button type="button" onClick={() => onDone(me!, them)} className="mx-auto block h-12 w-full max-w-md rounded-md bg-purple text-[15px] font-semibold text-white">
              {L("Continue", "आगे")}
            </button>
          </div>
          <div className="h-16" />
        </>
      )}
      {stage !== "done" && (
        <button type="button" onClick={() => { setMe(null); setThem(null); }} className="self-start text-sm text-muted underline">
          {L("Start again", "फिर से")}
        </button>
      )}
    </div>
  );
}
