import { notFound, redirect } from "next/navigation";
import AppBar from "@/components/AppBar";
import { requireTeacher } from "@/lib/auth";
import { loadSession } from "@/lib/content";
import { completedSessions, ensureProgress } from "@/lib/progress";
import { completionDates, istDate, openSessionNumber } from "@/lib/rhythm";
import Player from "./Player";

export default async function SessionPage({ params }: PageProps<"/m/[module]/[session]">) {
  const { module: moduleId, session: sessionId } = await params;
  const t = await requireTeacher();
  const session = await loadSession(moduleId, sessionId);
  if (!session) notFound();

  await ensureProgress(t.id, moduleId);
  const [done, dates] = await Promise.all([completedSessions(t.id, moduleId), completionDates(t.id, moduleId)]);
  const open = openSessionNumber(dates, istDate());
  if (session.n > open && !done.has(session.id)) redirect("/");

  return (
    <>
      <AppBar right={<span className="text-sm text-white/80">Session {session.n}</span>} />
      <Player moduleId={moduleId} session={session} alreadyDone={done.has(session.id)} />
    </>
  );
}
