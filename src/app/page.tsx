import Link from "next/link";
import AppBar from "@/components/AppBar";
import Illo, { type IlloName } from "@/components/Illo";
import { requireTeacher } from "@/lib/auth";
import { loadAllModules, type Module } from "@/lib/content";
import { assignedModuleIds, coinBalance, completedSessions, getProgress, levelFor, lifetimeCoins } from "@/lib/progress";
import { completionDates, openSessionNumber, recordVisit } from "@/lib/rhythm";
import { logoutAction } from "./login/actions";
import { toggleUnlockAll, unlockAllActive } from "./admin-actions";

type ModuleView = {
  mod: Module;
  doneCount: number;
  next: Module["sessions"][number] | null; // the session to do today, if any
  state: "new" | "today" | "waiting" | "complete";
};

export default async function Home() {
  const t = await requireTeacher();
  const first = t.display_name.split(" ")[0];

  const [rhythm, allModules, assigned, coins, lifetime, unlockAll] = await Promise.all([
    recordVisit(t.id),
    loadAllModules(),
    assignedModuleIds(t.id),
    coinBalance(t.id),
    lifetimeCoins(t.id),
    unlockAllActive(t.is_admin),
  ]);
  const visible = allModules.filter((m) => m.default || assigned.has(m.id));
  const level = levelFor(lifetime);

  const views: ModuleView[] = await Promise.all(
    visible.map(async (mod) => {
      const [progress, done, dates] = await Promise.all([
        getProgress(t.id, mod.id),
        completedSessions(t.id, mod.id),
        completionDates(t.id, mod.id),
      ]);
      const openN = unlockAll ? mod.sessions.length : openSessionNumber(dates, rhythm.today);
      const next = mod.sessions.find((s) => (unlockAll ? !done.has(s.id) : s.n === openN && !done.has(s.id))) ?? null;
      const state: ModuleView["state"] =
        done.size === mod.sessions.length ? "complete" : !progress ? "new" : next ? "today" : "waiting";
      return { mod, doneCount: done.size, next, state };
    }),
  );
  const today = views.find((v) => v.state === "today" || v.state === "new") ?? null;

  return (
    <>
      <AppBar
        right={
          <form action={logoutAction}>
            <button className="rounded-md px-2 py-1 text-sm text-white/80">Log out</button>
          </form>
        }
      />
      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        {rhythm.missed && (
          <section className="mb-6 rounded-lg border-l-4 border-sunrise-deep bg-cream p-4">
            <h2 className="font-semibold text-plum">You missed a school day</h2>
            <p className="mt-1 text-[15px]">
              {rhythm.missed.lost > 0
                ? `Half your coins (${rhythm.missed.lost}) are gone and the streak starts again from today. It happens; the sessions are still here.`
                : "The streak starts again from today. The sessions are still here."}
            </p>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Profile: top on phone, right column on laptop */}
          <aside className="order-1 lg:order-2">
            <div className="rounded-lg border border-line bg-raised p-5 shadow-card">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
                {t.is_admin ? "Admin" : t.section === "junior" ? "Primary section" : "Senior section"}
              </p>
              <h1 className="mt-1 font-serif text-[28px] font-medium leading-[34px] text-plum">Namaste, {first}</h1>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Stat value={coins} label="coins" />
                <Stat value={rhythm.streak} label="day streak" accent />
                <Stat value={level.current.name} label="level" gold />
              </div>
              {level.next && (
                <p className="mt-3 text-sm text-muted">
                  {level.next.min - lifetime} more coins to {level.next.name}. Levels only go up — a missed day never takes one away.
                </p>
              )}
            </div>
            {t.is_admin && (
              <Link href="/admin" className="mt-4 block rounded-md bg-purple px-4 py-2.5 text-center text-[15px] font-semibold text-white">
                Admin: teachers & reflections
              </Link>
            )}
            {t.is_admin && (
              <form
                action={toggleUnlockAll}
                className="mt-4 flex items-center justify-between rounded-lg border border-dashed border-line-strong px-4 py-3"
              >
                <div>
                  <p className="text-[15px] font-semibold">Test mode</p>
                  <p className="text-sm text-muted">Unlock all sessions on this device. {unlockAll ? "On" : "Off"}.</p>
                </div>
                <button
                  className={`rounded-md px-3 py-1.5 text-[15px] font-semibold ${unlockAll ? "bg-marigold text-plum" : "bg-purple text-white"}`}
                >
                  {unlockAll ? "Turn off" : "Turn on"}
                </button>
              </form>
            )}
          </aside>

          {/* Trainings: below profile on phone, left column on laptop */}
          <section className="order-2 flex flex-col gap-6 lg:order-1">
            {today && (
              <Link
                href={today.state === "new" ? "/start" : `/m/${today.mod.id}/${today.next!.id}`}
                className="overflow-hidden rounded-lg bg-plum text-white shadow-card lg:grid lg:grid-cols-[220px_1fr]"
              >
                <div className="hidden lg:block">
                  <Illo name={(today.mod.illo as IlloName) ?? "classroom-disturb"} />
                </div>
                <div className="p-5">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">
                    {today.state === "new" ? "Start here" : "Today"}
                  </p>
                  <h2 className="mt-1 font-serif text-[24px] font-semibold leading-[30px]">
                    {today.state === "new"
                      ? today.mod.title.en
                      : `Session ${today.next!.n}: ${today.next!.title.en}`}
                  </h2>
                  <p className="mt-1 text-sm text-white/80">
                    {today.state === "new" ? today.mod.subtitle.en : `${today.mod.short?.en ?? today.mod.title.en} · about ${today.next!.minutes} minutes`}
                  </p>
                  <span className="mt-4 inline-block rounded-md bg-marigold px-4 py-2 text-[15px] font-semibold text-plum">
                    {today.state === "new" ? "Begin" : "Continue"}
                  </span>
                </div>
              </Link>
            )}

            <div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Your trainings</h2>
              <ul className="mt-2 flex flex-col gap-3">
                {views.map((v) => (
                  <li key={v.mod.id}>
                    <Link
                      href={`/m/${v.mod.id}`}
                      className="flex gap-4 rounded-lg border border-line bg-raised p-4 shadow-card active:bg-mist"
                    >
                      <div className="w-24 flex-none overflow-hidden rounded-md">
                        <Illo name={(v.mod.illo as IlloName) ?? "map"} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-serif text-[20px] font-semibold leading-[26px] text-plum">{v.mod.title.en}</h3>
                        <p className="truncate text-sm text-muted">{v.mod.audience?.en ?? v.mod.subtitle.en}</p>
                        <div className="mt-2 flex gap-1">
                          {v.mod.sessions.map((s) => (
                            <span key={s.id} className={`h-1.5 flex-1 rounded-full ${s.n <= v.doneCount ? "bg-marigold" : "bg-mist"}`} />
                          ))}
                        </div>
                        <p className="mt-1 text-sm">
                          {v.state === "complete" && <span className="font-semibold text-success">Complete</span>}
                          {v.state === "new" && <span className="font-semibold text-accent">Not started · {v.mod.sessions.length} sessions</span>}
                          {v.state === "today" && <span className="font-semibold text-sunrise-deep">Session {v.next!.n} ready</span>}
                          {v.state === "waiting" && <span className="text-muted">{v.doneCount} of {v.mod.sessions.length} done · next opens tomorrow</span>}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {views.length === 0 && <p className="mt-2 text-muted">No trainings assigned yet.</p>}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ value, label, accent = false, gold = false }: { value: number | string; label: string; accent?: boolean; gold?: boolean }) {
  return (
    <div className={`rounded-lg px-2 py-2 text-center ${gold ? "bg-plum" : accent ? "bg-mist" : "bg-cream"}`}>
      <div className={`text-[20px] font-bold leading-none ${gold ? "text-gold" : accent ? "text-purple" : "text-sunrise-deep"}`}>{value}</div>
      <div className={`mt-1 text-[11px] font-semibold uppercase tracking-wider ${gold ? "text-white/70" : "text-muted"}`}>{label}</div>
    </div>
  );
}
