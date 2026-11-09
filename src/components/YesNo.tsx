"use client";

import { useState } from "react";
import type { Card, T } from "@/lib/content";

type Lang = "en" | "hi";
const t = (x: T, lang: Lang) => (lang === "hi" && x.hi ? x.hi : x.en);

export default function YesNo({
  card,
  lang,
  onDone,
}: {
  card: Extract<Card, { type: "yesno" }>;
  lang: Lang;
  onDone: (answers: Record<string, boolean>, agree: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const done = card.questions.every((q) => q.key in answers);
  const passes = card.questions.filter((q) => q.answer).length;
  const agree = card.questions.filter((q) => answers[q.key] === q.answer).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{L("Test it", "जाँचिए")}</div>
      <h2 className="font-serif text-[24px] font-semibold leading-[30px] text-plum">{t(card.title, lang)}</h2>
      <div className={`rounded-lg bg-cream p-4 text-[17px] leading-[27px] ${lang === "hi" ? "hi" : ""}`}>{t(card.subject, lang)}</div>
      <ul className="flex flex-col gap-3">
        {card.questions.map((q) => {
          const a = answers[q.key];
          const answered = a !== undefined;
          return (
            <li key={q.key} className="rounded-lg border border-line bg-raised p-3">
              <p className={`font-semibold text-plum ${lang === "hi" ? "hi" : ""}`}>{t(q.text, lang)}</p>
              {!answered ? (
                <div className="mt-2 flex gap-2">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setAnswers((m) => ({ ...m, [q.key]: v }))}
                      className="h-10 flex-1 rounded-md border border-line-strong text-[15px] font-semibold text-ink active:bg-mist"
                    >
                      {v ? L("Yes", "हाँ") : L("No", "नहीं")}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-[15px]">
                  <span className={`mr-2 rounded-sm px-1.5 py-0.5 text-[12px] font-bold uppercase ${q.answer ? "bg-success/15 text-success" : "bg-danger/10 text-danger"}`}>
                    {q.answer ? L("Yes", "हाँ") : L("No", "नहीं")}
                  </span>
                  <span className={lang === "hi" ? "hi" : ""}>{t(q.reason, lang)}</span>
                  {a !== q.answer && <span className="ml-1 text-muted">({L("you said", "आपने कहा")} {a ? L("yes", "हाँ") : L("no", "नहीं")})</span>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {done && (
        <>
          <p className="text-[17px]">
            {L(`Score: ${passes} of ${card.questions.length}.`, `स्कोर: ${card.questions.length} में से ${passes}।`)}{" "}
            <span className="text-muted">{L(`You agreed on ${agree}.`, `आप ${agree} पर सहमत थे।`)}</span>
          </p>
          <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface via-surface to-transparent px-4 pb-6 pt-8">
            <button type="button" onClick={() => onDone(answers, agree)} className="mx-auto block h-12 w-full max-w-md rounded-md bg-purple text-[15px] font-semibold text-white">
              {L("Continue", "आगे")}
            </button>
          </div>
          <div className="h-16" />
        </>
      )}
    </div>
  );
}
