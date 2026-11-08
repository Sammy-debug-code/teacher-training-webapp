import { notFound, redirect } from "next/navigation";
import AppBar from "@/components/AppBar";
import { requireTeacher } from "@/lib/auth";
import { loadSession } from "@/lib/content";
import { completedSessions, ensureProgress } from "@/lib/progress";
import Player from "./Player";

export default async function SessionPage({ params }: PageProps<"/m/[module]/[session]">) {
  const { module: moduleId, session: sessionId } = await params;
  const t = await requireTeacher();
  const session = await loadSession(moduleId, sessionId);
  if (!session) notFound();

  const progress = await ensureProgress(t.id, moduleId);
  if (session.n > progress.unlocked_until) redirect("/");
  const done = await completedSessions(t.id, moduleId);

  return (
    <>
      <AppBar right={<span className="text-sm text-white/80">Session {session.n}</span>} />
      <Player moduleId={moduleId} session={session} alreadyDone={done.has(session.id)} />
    </>
  );
}
