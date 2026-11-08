import Link from "next/link";
import { redirect } from "next/navigation";
import AppBar from "@/components/AppBar";
import Illo from "@/components/Illo";
import { requireTeacher } from "@/lib/auth";
import { loadModule } from "@/lib/content";
import { coinBalance, completedSessions, getProgress } from "@/lib/progress";
import { completionDates, openSessionNumber, recordVisit } from "@/lib/rhythm";
import { logoutAction } from "./login/actions";
import { toggleUnlockAll, unlockAllActive } from "./admin-actions";

const MODULE = "m1-handling-children";

export default async function Home() {
  const t = await requireTeacher();
  const first = t.display_name.split(" ")[0];

  const progress = await getProgress(t.id, MODULE);
  if (!progress) redirect("/start");

  const rhythm = await recordVisit(t.id);
  const [mod, done, dates, coins] = await Promise.all([
    loadModule(MODULE),
    completedSessions(t.id, MODULE),
    completionDates(t.id, MODULE),
    coinBalance(t.id),
  ]);
  const unlockAll = await unlockAllActive(t.is_admin);
  const openN = unlockAll ? mod.sessions.length : openSessionNumber(dates, rhythm.today);
  const next = mod.sessions.find((s) => (unlockAll ? !done.has(s.id) : s.n === openN && !done.has(s.id)));
  const finishedToday = [...dates.values()].includes(rhythm.today);
  const allDone = done.size === mod.sessions.length;

  return (
    <>
      <AppBar
        right={
          <form action={logoutAction}>
            <button className="rounded-md px-2 py-1 text-sm text-white/80">Log out</button>
          </form>
        }
      />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t.is_admin ? "Admin" : "Teacher"}
            </p>
            <h1 className="mt-1 font-serif text-[32px] font-medium leading-[40px] text-plum">Namaste, {first}</h1>
          </div>
          <div className="flex gap-2">
            <Stat value={coins} label="coins" />
            <Stat value={rhythm.streak} label={rhythm.streak === 1 ? "day" : "days"} accent />
          </div>
        </div>

        {rhythm.missed && (
          <section className="rounded-lg border-l-4 border-sunrise-deep bg-cream p-4">
            <h2 className="font-semibold text-plum">You missed a school day</h2>
            <p className="mt-1 text-[15px]">
              {rhythm.missed.lost > 0
                ? `Half your coins (${rhythm.missed.lost}) are gone and the streak starts again from today. It happens; the sessions are still here.`
                : "The streak starts again from today. The sessions are still here."}
            </p>
          </section>
        )}

        <section className="overflow-hidden rounded-lg bg-plum text-white shadow-card">
          <div className="p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">Module 1</p>
            <h2 className="mt-1 font-serif text-[24px] font-semibold leading-[30px]">{mod.title.en}</h2>
            <p className="mt-1 text-sm text-white/80">{mod.subtitle.en}</p>
            <div className="mt-4 flex gap-1">
              {mod.sessions.map((s) => (
                <span
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full ${done.has(s.id) ? "bg-marigold" : s.n === openN ? "bg-white/80" : "bg-white/20"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-white/80">
              {done.size} of {mod.sessions.length} sessions done
            </p>
          </div>
        </section>

        {next ? (
          <Link href={`/m/${MODULE}/${next.id}`} className="overflow-hidden rounded-lg border border-line bg-raised shadow-card active:bg-mist">
            <Illo name={next.n === 1 ? "staffroom" : "classroom-disturb"} />
            <div className="p-5">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sunrise-deep">
                {done.size === 0 ? "Start here" : "Today's session"}
              </p>
              <h3 className="mt-1 font-serif text-[24px] font-semibold leading-[30px] text-plum">
                Session {next.n}: {next.title.en}
              </h3>
              <p className="mt-1 text-sm text-muted">About {next.minutes} minutes</p>
              <span className="mt-4 inline-block rounded-md bg-purple px-4 py-2 text-[15px] font-semibold text-white">
                {done.size === 0 ? "Begin" : "Continue"}
              </span>
            </div>
          </Link>
        ) : allDone ? (
          <section className="overflow-hidden rounded-lg bg-cream">
            <Illo name="coins" />
            <div className="p-5">
              <h3 className="font-serif text-[24px] font-semibold text-plum">Module complete</h3>
              <p className="mt-1 text-muted">Well done. Module 2 is coming.</p>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg bg-cream">
            <Illo name="calendar" />
            <div className="p-5">
              <h3 className="font-serif text-[24px] font-semibold text-plum">
                {finishedToday ? "Done for today" : "Next session opens tomorrow"}
              </h3>
              <p className="mt-1 text-muted">
                Session {openN} opens tomorrow morning. Today, try the task from your last session in class — that is the real work.
              </p>
            </div>
          </section>
        )}

        {t.is_admin && (
          <form action={toggleUnlockAll} className="flex items-center justify-between rounded-lg border border-dashed border-line-strong px-4 py-3">
            <div>
              <p className="text-[15px] font-semibold">Test mode: unlock all sessions</p>
              <p className="text-sm text-muted">Admin only, this device only. {unlockAll ? "On" : "Off"}.</p>
            </div>
            <button className={`rounded-md px-3 py-1.5 text-[15px] font-semibold ${unlockAll ? "bg-marigold text-plum" : "bg-purple text-white"}`}>
              {unlockAll ? "Turn off" : "Turn on"}
            </button>
          </form>
        )}
        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">All sessions</h3>
          <ol className="mt-2 divide-y divide-line rounded-lg border border-line bg-raised">
            {mod.sessions.map((s) => {
              const isDone = done.has(s.id);
              const open = isDone || s.n === openN || unlockAll;
              const row = (
                <div className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`h-7 w-7 flex-none rounded-full text-center text-[13px] font-bold leading-7 ${
                      isDone ? "bg-marigold text-plum" : open ? "bg-purple text-white" : "bg-mist text-muted"
                    }`}
                  >
                    {isDone ? "✓" : s.n}
                  </span>
                  <span className={`flex-1 text-[16px] ${open ? "text-ink" : "text-muted"}`}>{s.title.en}</span>
                  <span className="text-sm text-muted">{isDone ? "Review" : open ? `${s.minutes} min` : "Locked"}</span>
                </div>
              );
              return <li key={s.id}>{open ? <Link href={`/m/${MODULE}/${s.id}`}>{row}</Link> : row}</li>;
            })}
          </ol>
        </section>
      </main>
    </>
  );
}

function Stat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className={`min-w-[64px] rounded-lg px-3 py-2 text-center ${accent ? "bg-mist" : "bg-cream"}`}>
      <div className={`text-[22px] font-bold leading-none ${accent ? "text-purple" : "text-sunrise-deep"}`}>{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}
