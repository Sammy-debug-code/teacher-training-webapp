import Link from "next/link";
import AppBar from "@/components/AppBar";
import { requireTeacher } from "@/lib/auth";
import { loadModule } from "@/lib/content";
import { coinBalance, completedSessions, ensureProgress } from "@/lib/progress";
import { logoutAction } from "./login/actions";

const MODULE = "m1-handling-children";

export default async function Home() {
  const t = await requireTeacher();
  const first = t.display_name.split(" ")[0];
  const [mod, progress, done, coins] = await Promise.all([
    loadModule(MODULE),
    ensureProgress(t.id, MODULE),
    completedSessions(t.id, MODULE),
    coinBalance(t.id),
  ]);
  const next = mod.sessions.find((s) => !done.has(s.id) && s.n <= progress.unlocked_until);

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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t.is_admin ? "Admin" : "Teacher"}
            </p>
            <h1 className="mt-1 font-serif text-[32px] font-medium leading-[40px] text-plum">Namaste, {first}</h1>
          </div>
          <div className="rounded-lg bg-cream px-3 py-2 text-center">
            <div className="text-[22px] font-bold leading-none text-sunrise-deep">{coins}</div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">coins</div>
          </div>
        </div>

        <section className="rounded-lg bg-plum p-5 text-white shadow-card">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">Module 1</p>
          <h2 className="mt-1 font-serif text-[24px] font-semibold leading-[30px]">{mod.title.en}</h2>
          <p className="mt-1 text-sm text-white/80">{mod.subtitle.en}</p>
          <div className="mt-4 flex gap-1">
            {mod.sessions.map((s) => (
              <span
                key={s.id}
                className={`h-1.5 flex-1 rounded-full ${done.has(s.id) ? "bg-marigold" : s.n <= progress.unlocked_until ? "bg-white/70" : "bg-white/20"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-sm text-white/80">
            {done.size} of {mod.sessions.length} sessions done
          </p>
        </section>

        {next ? (
          <Link
            href={`/m/${MODULE}/${next.id}`}
            className="rounded-lg border border-line bg-raised p-5 shadow-card active:bg-mist"
          >
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-sunrise-deep">
              {done.size === 0 ? "Start here" : "Ready for you"}
            </p>
            <h3 className="mt-1 font-serif text-[24px] font-semibold leading-[30px] text-plum">
              Session {next.n}: {next.title.en}
            </h3>
            <p className="mt-1 text-sm text-muted">About {next.minutes} minutes</p>
            <span className="mt-4 inline-block rounded-md bg-purple px-4 py-2 text-[15px] font-semibold text-white">
              {done.size === 0 ? "Begin" : "Continue"}
            </span>
          </Link>
        ) : done.size === mod.sessions.length ? (
          <section className="rounded-lg bg-cream p-5">
            <h3 className="font-serif text-[24px] font-semibold text-plum">Module complete</h3>
            <p className="mt-1 text-muted">Well done. Module 2 is coming.</p>
          </section>
        ) : (
          <section className="rounded-lg bg-cream p-5">
            <h3 className="font-serif text-[24px] font-semibold text-plum">Next session opens soon</h3>
            <p className="mt-1 text-muted">Come back tomorrow for your nugget and check-in.</p>
          </section>
        )}

        <section>
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">All sessions</h3>
          <ol className="mt-2 divide-y divide-line rounded-lg border border-line bg-raised">
            {mod.sessions.map((s) => {
              const isDone = done.has(s.id);
              const open = s.n <= progress.unlocked_until;
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
                  <span className="text-sm text-muted">{s.minutes} min</span>
                </div>
              );
              return (
                <li key={s.id}>
                  {open ? <Link href={`/m/${MODULE}/${s.id}`}>{row}</Link> : row}
                </li>
              );
            })}
          </ol>
        </section>
      </main>
    </>
  );
}
