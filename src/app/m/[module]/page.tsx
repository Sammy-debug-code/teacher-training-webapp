import Link from "next/link";
import { notFound } from "next/navigation";
import AppBar from "@/components/AppBar";
import Illo, { type IlloName } from "@/components/Illo";
import { requireTeacher } from "@/lib/auth";
import { loadModule } from "@/lib/content";
import { completedSessions, getProgress } from "@/lib/progress";
import { completionDates, istDate, openSessionNumber } from "@/lib/rhythm";
import { unlockAllActive } from "@/app/admin-actions";

export default async function ModulePage({ params }: PageProps<"/m/[module]">) {
  const { module: moduleId } = await params;
  const t = await requireTeacher();
  const mod = await loadModule(moduleId).catch(() => null);
  if (!mod) notFound();

  const [progress, done, dates, unlockAll] = await Promise.all([
    getProgress(t.id, moduleId),
    completedSessions(t.id, moduleId),
    completionDates(t.id, moduleId),
    unlockAllActive(t.is_admin),
  ]);
  const openN = unlockAll ? mod.sessions.length : openSessionNumber(dates, istDate());

  return (
    <>
      <AppBar right={<Link href="/" className="text-sm text-white/80">Home</Link>} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <div className="overflow-hidden rounded-lg bg-plum text-white shadow-card">
          <Illo name={(mod.illo as IlloName) ?? "map"} />
          <div className="p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">{mod.audience?.en ?? "Training"}</p>
            <h1 className="mt-1 font-serif text-[28px] font-medium leading-[34px]">{mod.title.en}</h1>
            <p className="mt-1 text-sm text-white/80">{mod.subtitle.en}</p>
            <p className="mt-3 text-sm text-white/80">
              {done.size} of {mod.sessions.length} sessions done
            </p>
          </div>
        </div>

        {!progress && (
          <Link href="/start" className="block rounded-md bg-purple px-4 py-3 text-center text-[15px] font-semibold text-white">
            How this works, then Session 1
          </Link>
        )}

        <ol className="divide-y divide-line rounded-lg border border-line bg-raised">
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
            return <li key={s.id}>{open ? <Link href={`/m/${moduleId}/${s.id}`}>{row}</Link> : row}</li>;
          })}
        </ol>
        <p className="text-sm text-muted">One session opens each school day, the morning after you finish the previous one.</p>
      </main>
    </>
  );
}
