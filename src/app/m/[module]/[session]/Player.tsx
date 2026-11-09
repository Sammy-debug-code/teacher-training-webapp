"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Card, Option, Session, T } from "@/lib/content";
import Illo, { type IlloName } from "@/components/Illo";
import GridSort from "@/components/GridSort";
import SelfPlace from "@/components/SelfPlace";
import { logEvent, saveReflection, completeSession } from "@/app/m/actions";

type Lang = "en" | "hi";

function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const v = localStorage.getItem("btt_lang");
      if (v === "hi" || v === "en") setLangState(v);
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("btt_lang", l);
    } catch {}
  };
  return [lang, setLang];
}

function Txt({ t, lang, className = "" }: { t: T; lang: Lang; className?: string }) {
  const hi = lang === "hi" && t.hi;
  const text = hi ? t.hi! : t.en;
  const paras = text.split(/\n\n+/);
  return (
    <div className={`${hi ? "hi" : ""} ${className}`}>
      {paras.map((p, i) => (
        <p key={i} className={i > 0 ? "mt-3" : ""}>
          {p}
        </p>
      ))}
    </div>
  );
}

export default function Player({
  moduleId,
  session,
  alreadyDone,
  preview = false,
}: {
  moduleId: string;
  session: Session;
  alreadyDone: boolean;
  /** Dev preview: no server calls at all. */
  preview?: boolean;
}) {
  const cards = session.cards;
  const index = useMemo(() => new Map(cards.map((c, i) => [c.id, i])), [cards]);
  const [i, setI] = useState(0);
  const [lang, setLang] = useLang();
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<number[]>([]);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [written, setWritten] = useState<Record<string, string>>({});
  const [earned, setEarned] = useState<number | null>(null);
  const viewed = useRef(new Set<string>());
  const [shuffleSeed] = useState(() => Math.random().toString(36).slice(2));

  const card = cards[i];
  const hasHi = useMemo(() => cardHasHindi(card), [card]);

  // Log each card view once per visit
  useEffect(() => {
    if (!card || viewed.current.has(card.id)) return;
    viewed.current.add(card.id);
    if (!preview) void logEvent(moduleId, session.id, card.id, "viewed");
  }, [card, moduleId, session.id, preview]);

  const goTo = useCallback(
    (id?: string) => {
      setI((cur) => {
        const nxt = id && index.has(id) ? index.get(id)! : Math.min(cur + 1, cards.length - 1);
        if (nxt !== cur) setHistory((h) => [...h, cur]);
        return nxt;
      });
      window.scrollTo({ top: 0 });
    },
    [index, cards.length],
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setI(prev);
      return h.slice(0, -1);
    });
    window.scrollTo({ top: 0 });
  }, []);

  async function choose(c: Extract<Card, { type: "choice" }>, o: Option) {
    const attempt = (attempts[c.id] ?? 0) + 1;
    setAttempts((a) => ({ ...a, [c.id]: attempt }));
    setChosen((m) => ({ ...m, [c.id]: o.key }));
    if (!preview) void logEvent(moduleId, session.id, c.id, "chose", { key: o.key, rung: o.rung ?? null, attempt, kind: c.kind ?? "ladder" });
    goTo(o.next);
  }

  function rewind(c: Extract<Card, { type: "consequence" }>) {
    if (!preview) void logEvent(moduleId, session.id, c.id, "rewound");
    if (c.back_to) {
      // A rewind re-opens the question; the back arrow does not.
      setChosen((m) => {
        const copy = { ...m };
        delete copy[c.back_to!];
        return copy;
      });
    }
    goTo(c.back_to);
  }

  useEffect(() => {
    if (card?.type === "complete" && earned === null && !alreadyDone) {
      completeSession(moduleId, session.id).then((r) => setEarned(r.coins));
    }
  }, [card, earned, alreadyDone, moduleId, session.id]);

  // Progress: count only main-line cards (exclude consequence branches)
  const mainline = cards.filter((c) => c.type !== "consequence");
  const mainIdx = Math.max(0, mainline.findIndex((c) => c.id === card.id));
  const pct = Math.round(((mainIdx + (card.type === "complete" ? 1 : 0)) / mainline.length) * 100);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      {/* top bar */}
      <div className="sticky top-14 z-10 flex items-center gap-3 bg-surface px-4 py-2">
        {history.length > 0 ? (
          <button type="button" onClick={goBack} aria-label="Previous card" className="px-1 text-[18px] leading-none text-accent">
            ←
          </button>
        ) : (
          <Link href="/" aria-label="Back to home" className="px-1 text-sm text-muted">
            ✕
          </Link>
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist">
          <div className="h-full bg-purple transition-all" style={{ width: `${pct}%` }} />
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          disabled={!hasHi}
          className={`rounded-sm border px-2 py-0.5 text-[13px] font-semibold ${
            hasHi ? "border-line-strong text-accent" : "border-line text-muted/50"
          }`}
          aria-pressed={lang === "hi"}
        >
          {lang === "en" ? "हिंदी" : "EN"}
        </button>
      </div>

      <main className="flex flex-1 flex-col gap-6 px-4 pb-28 pt-4">
        {card.image && <Illo name={card.image as IlloName} />}
        <CardView
          card={card}
          lang={lang}
          moduleId={moduleId}
          sessionId={session.id}
          preview={preview}
          hasHi={hasHi}
          shuffleSeed={shuffleSeed}
          chosenKey={chosen[card.id]}
          writtenText={written[card.id]}
          onWritten={(id, text) => setWritten((m) => ({ ...m, [id]: text }))}
          earned={earned}
          alreadyDone={alreadyDone}
          onChoose={choose}
          onRewind={rewind}
          onNext={() => goTo(card.type === "consequence" ? card.next : undefined)}
        />
      </main>
    </div>
  );
}

function cardHasHindi(card: Card | undefined): boolean {
  if (!card) return false;
  const walk = (v: unknown): boolean => {
    if (!v || typeof v !== "object") return false;
    if ("hi" in (v as object) && typeof (v as T).hi === "string") return true;
    return Object.values(v as Record<string, unknown>).some(walk);
  };
  return walk(card);
}

function HindiHint({ show, lang }: { show: boolean; lang: Lang }) {
  if (!show || lang === "hi") return null;
  return (
    <p className="text-sm text-muted">
      Want this in Hindi? Tap <span className="hi font-semibold text-accent">हिंदी</span> at the top.
    </p>
  );
}

function Primary({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-surface via-surface to-transparent px-4 pb-6 pt-8">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="mx-auto block h-12 w-full max-w-md rounded-md bg-purple text-[15px] font-semibold text-white disabled:opacity-40"
      >
        {children}
      </button>
    </div>
  );
}

function CardView({
  card,
  lang,
  moduleId,
  sessionId,
  preview,
  hasHi,
  shuffleSeed,
  chosenKey,
  writtenText,
  onWritten,
  earned,
  alreadyDone,
  onChoose,
  onRewind,
  onNext,
}: {
  card: Card;
  lang: Lang;
  moduleId: string;
  sessionId: string;
  preview: boolean;
  hasHi: boolean;
  shuffleSeed: string;
  chosenKey?: string;
  writtenText?: string;
  onWritten: (id: string, text: string) => void;
  earned: number | null;
  alreadyDone: boolean;
  onChoose: (c: Extract<Card, { type: "choice" }>, o: Option) => void;
  onRewind: (c: Extract<Card, { type: "consequence" }>) => void;
  onNext: () => void;
}) {
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);

  switch (card.type) {
    case "quote":
      return (
        <>
          <div className="rounded-lg bg-cream p-6">
            <div className="font-serif text-[40px] leading-none text-gold">“</div>
            <Txt t={card.text} lang={lang} className="-mt-3 font-serif text-[24px] font-medium leading-[32px] text-plum" />
            <Txt t={card.attribution} lang={lang} className="mt-4 text-sm text-muted" />
          </div>
          <Primary onClick={onNext}>{L("Continue", "आगे")}</Primary>
        </>
      );

    case "scene":
      return (
        <>
          {card.eyebrow && (
            <Txt t={card.eyebrow} lang={lang} className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent" />
          )}
          <Txt t={card.text} lang={lang} className="text-[19px] leading-[30px]" />
          {card.prompt && <Txt t={card.prompt} lang={lang} className="font-serif text-[24px] font-semibold text-plum" />}
          <HindiHint show={hasHi} lang={lang} />
          <Primary onClick={onNext}>{L("See your options", "विकल्प देखें")}</Primary>
        </>
      );

    case "choice": {
      const picked = chosenKey ? card.options.find((o) => o.key === chosenKey) : undefined;
      // Rating scales keep their order; everything else is shuffled so position cannot be learned.
      const options = card.kind === "rating" ? card.options : shuffled(card.options, card.id + shuffleSeed);
      return (
        <>
          <Txt t={card.question} lang={lang} className="font-serif text-[24px] font-semibold leading-[30px] text-plum" />
          <div className="flex flex-col gap-3">
            {options.map((o) => {
              const isPicked = picked?.key === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  disabled={!!picked}
                  onClick={() => onChoose(card, o)}
                  className={`rounded-lg border p-4 text-left text-[16px] leading-[24px] ${
                    isPicked
                      ? "border-purple bg-mist"
                      : picked
                        ? "border-line bg-raised text-muted"
                        : "border-line-strong bg-raised active:bg-mist"
                  }`}
                >
                  {isPicked && <span className="mb-1 block text-[12px] font-semibold uppercase tracking-wider text-accent">{L("Your answer", "आपका जवाब")}</span>}
                  <Txt t={o.text} lang={lang} />
                </button>
              );
            })}
          </div>
          <HindiHint show={hasHi} lang={lang} />
          {picked && <Primary onClick={() => onChoose(card, picked)}>{L("Continue", "आगे")}</Primary>}
        </>
      );
    }

    case "consequence":
      return (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            {L("What happens next", "आगे क्या होता है")}
          </p>
          <Txt t={card.text} lang={lang} className="text-[19px] leading-[30px]" />
          {card.outcome === "rewind" ? (
            <Primary onClick={() => onRewind(card)}>{L("Rewind and try again", "वापस जाएँ, फिर कोशिश करें")}</Primary>
          ) : (
            <Primary onClick={onNext}>{L("Continue", "आगे")}</Primary>
          )}
        </>
      );

    case "why":
      return (
        <>
          <Txt t={card.title} lang={lang} className="font-serif text-[24px] font-semibold text-plum" />
          <ul className="flex flex-col gap-3">
            {card.points.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 h-5 w-5 flex-none rounded-full bg-marigold text-center text-[13px] font-bold leading-5 text-plum">
                  {i + 1}
                </span>
                <Txt t={p} lang={lang} />
              </li>
            ))}
          </ul>
          <Primary onClick={onNext}>{L("Continue", "आगे")}</Primary>
        </>
      );

    case "nugget":
      return (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{L("Read", "पढ़िए")}</p>
          <Txt t={card.title} lang={lang} className="font-serif text-[24px] font-semibold leading-[30px] text-plum" />
          <Txt t={card.text} lang={lang} className="text-[17px] leading-[28px]" />
          {card.source && <p className="text-sm text-muted">{card.source}</p>}
          <Primary onClick={onNext}>{L("Continue", "आगे")}</Primary>
        </>
      );

    case "ladder":
      return (
        <>
          <Txt t={card.title} lang={lang} className="font-serif text-[24px] font-semibold text-plum" />
          <ol className="flex flex-col-reverse gap-2">
            {card.rungs.map((r) => {
              const hot = r.n === card.highlight;
              return (
                <li
                  key={r.n}
                  className={`flex gap-3 rounded-lg border p-3 ${hot ? "border-purple bg-mist" : "border-line bg-raised"}`}
                >
                  <span
                    className={`h-8 w-8 flex-none rounded-full text-center text-[15px] font-bold leading-8 ${
                      hot ? "bg-purple text-white" : "bg-cream text-plum"
                    }`}
                  >
                    {r.n}
                  </span>
                  <div>
                    <Txt t={r.name} lang={lang} className="font-semibold" />
                    <Txt t={r.line} lang={lang} className="text-sm text-muted" />
                  </div>
                </li>
              );
            })}
          </ol>
          {card.highlight && (
            <p className="text-sm text-muted">{L("Highlighted: the rung you just used.", "हाइलाइट: वो सीढ़ी जो आपने अभी इस्तेमाल की।")}</p>
          )}
          <Primary onClick={onNext}>{L("Continue", "आगे")}</Primary>
        </>
      );

    case "reflection":
      if (writtenText !== undefined)
        return <Written label={L("Your notebook", "आपकी नोटबुक")} prompt={card.prompt} text={writtenText} lang={lang} onNext={onNext} />;
      return (
        <Reflection
          card={card}
          lang={lang}
          moduleId={moduleId}
          sessionId={sessionId}
          preview={preview}
          hasHi={hasHi}
          onNext={onNext}
          onWritten={(text) => onWritten(card.id, text)}
        />
      );

    case "grid":
      return (
        <GridSort
          card={card}
          lang={lang}
          onDone={(placements, correct) => {
            if (!preview) void logEvent(moduleId, sessionId, card.id, "chose", { kind: "grid", placements, correct, total: card.items.length });
            onNext();
          }}
        />
      );

    case "selfplace":
      return (
        <SelfPlace
          card={card}
          lang={lang}
          onDone={(me, students) => {
            if (!preview) void logEvent(moduleId, sessionId, card.id, "chose", { kind: "selfplace", me, students });
            onNext();
          }}
        />
      );

    case "message":
      if (writtenText !== undefined)
        return <Written label={L("Optional", "वैकल्पिक")} prompt={card.prompt} text={writtenText || L("(skipped)", "(छोड़ा)")} lang={lang} onNext={onNext} />;
      return <Message card={card} lang={lang} moduleId={moduleId} sessionId={sessionId} preview={preview} onNext={onNext} onWritten={(text) => onWritten(card.id, text)} />;

    case "task":
      return (
        <>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sunrise-deep">{L("Your task", "आपका काम")}</p>
          <Txt t={card.title} lang={lang} className="font-serif text-[24px] font-semibold text-plum" />
          <div className="rounded-lg border-l-4 border-marigold bg-cream p-4">
            <Txt t={card.text} lang={lang} className="text-[17px] leading-[28px]" />
          </div>
          <Primary onClick={onNext}>{L("I'll do it", "मैं करूँगा/करूँगी")}</Primary>
        </>
      );

    case "complete":
      return (
        <>
          <div className="mt-6 flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-marigold font-serif text-[32px] font-semibold text-plum">
              ✓
            </div>
            <Txt t={card.title} lang={lang} className="font-serif text-[32px] font-medium text-plum" />
            {alreadyDone ? (
              <p className="text-muted">{L("You had already completed this session.", "आप यह सेशन पहले ही पूरा कर चुके हैं।")}</p>
            ) : earned === null ? (
              <p className="text-muted">{L("Counting your coins…", "आपके सिक्के गिने जा रहे हैं…")}</p>
            ) : (
              <p className="text-[19px]">
                <span className="font-semibold text-sunrise-deep">+{earned}</span> {L("coins earned", "सिक्के मिले")}
              </p>
            )}
            <Txt t={card.text} lang={lang} className="text-muted" />
            <Link
              href="/coins"
              className="relative mt-2 rounded-[20px] bg-mist px-5 py-3 text-[15px] font-semibold text-accent before:absolute before:-bottom-2 before:left-6 before:h-4 before:w-4 before:rounded-full before:bg-mist after:absolute after:-bottom-4 after:left-3 after:h-2 after:w-2 after:rounded-full after:bg-mist"
            >
              {L("See what coins can do →", "देखें सिक्के क्या कर सकते हैं →")}
            </Link>
          </div>
          <Link
            href="/"
            className="fixed inset-x-4 bottom-6 mx-auto block h-12 max-w-md rounded-md bg-purple text-center text-[15px] font-semibold leading-[48px] text-white"
          >
            {L("Back to home", "होम पर जाएँ")}
          </Link>
        </>
      );
  }
}

function Reflection({
  card,
  lang,
  moduleId,
  sessionId,
  preview,
  hasHi,
  onNext,
  onWritten,
}: {
  card: Extract<Card, { type: "reflection" }>;
  lang: Lang;
  moduleId: string;
  sessionId: string;
  preview: boolean;
  hasHi: boolean;
  onNext: () => void;
  onWritten: (text: string) => void;
}) {
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const starter = (lang === "hi" && card.starter?.hi) || card.starter?.en || "";
  const [text, setText] = useState(starter);
  const [saving, setSaving] = useState(false);
  const min = Math.max(card.min_chars ?? 40, starter.length + 15);
  async function save() {
    setSaving(true);
    if (!preview) await saveReflection(moduleId, sessionId, card.id, text);
    setSaving(false);
    onWritten(text);
    onNext();
  }
  return (
    <>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{L("Your notebook", "आपकी नोटबुक")}</p>
      <Txt t={card.prompt} lang={lang} className="font-serif text-[22px] font-semibold leading-[30px] text-plum" />
      <HindiHint show={hasHi} lang={lang} />
      <p className="text-[15px] text-muted">
        {L(
          "Write about your class, not about this training. A few honest lines are enough.",
          "अपनी क्लास के बारे में लिखिए, इस ट्रेनिंग के बारे में नहीं। दो-तीन सच्ची लाइनें काफ़ी हैं।",
        )}
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={lang === "hi" && card.placeholder?.hi ? card.placeholder.hi : card.placeholder?.en}
        rows={6}
        className="w-full rounded-md border border-line-strong bg-cream p-3 text-base leading-relaxed"
      />
      <p className="text-sm text-muted">
        {L("Writing it down is what makes tomorrow's class different.", "लिखने से ही कल की क्लास अलग होती है।")}
      </p>
      <Primary onClick={save} disabled={saving || text.trim().length < min}>
        {saving ? L("Saving…", "सेव हो रहा है…") : L("Save to my notebook", "नोटबुक में सेव करें")}
      </Primary>
    </>
  );
}

function Message({
  card,
  lang,
  moduleId,
  sessionId,
  preview,
  onNext,
  onWritten,
}: {
  card: Extract<Card, { type: "message" }>;
  lang: Lang;
  moduleId: string;
  sessionId: string;
  preview: boolean;
  onNext: () => void;
  onWritten: (text: string) => void;
}) {
  const L = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  async function send() {
    setSaving(true);
    if (!preview && text.trim()) await saveReflection(moduleId, sessionId, card.id, text);
    setSaving(false);
    onWritten(text.trim());
    onNext();
  }
  return (
    <>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sunrise-deep">{L("Optional", "वैकल्पिक")}</p>
      <Txt t={card.prompt} lang={lang} className="font-serif text-[22px] font-semibold leading-[30px] text-plum" />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={lang === "hi" && card.placeholder?.hi ? card.placeholder.hi : card.placeholder?.en}
        rows={4}
        className="w-full rounded-md border border-line-strong bg-raised p-3 text-base leading-relaxed"
      />
      <p className="text-sm text-muted">
        {L("Leave it empty to skip.", "छोड़ना हो तो ख़ाली रहने दें।")}
      </p>
      <Primary onClick={send} disabled={saving}>
        {text.trim() ? L("Send and continue", "भेजें और आगे बढ़ें") : L("Skip", "छोड़ें")}
      </Primary>
    </>
  );
}

function Written({ label, prompt, text, lang, onNext }: { label: string; prompt: T; text: string; lang: Lang; onNext: () => void }) {
  return (
    <>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{label}</p>
      <Txt t={prompt} lang={lang} className="font-serif text-[22px] font-semibold leading-[30px] text-plum" />
      <div className="whitespace-pre-wrap rounded-md border border-line bg-cream p-3 text-base leading-relaxed">{text}</div>
      <Primary onClick={onNext}>{lang === "hi" ? "आगे" : "Continue"}</Primary>
    </>
  );
}

/** Deterministic shuffle from a string seed, so an option list keeps its order while the card is on screen. */
function shuffled<T>(arr: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rnd = () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
