import { notFound } from "next/navigation";
import AppBar from "@/components/AppBar";
import { loadSession } from "@/lib/content";
import Player from "@/app/m/[module]/[session]/Player";

/** Dev-only: render a session without login or database. Not available in production. */
export default async function PreviewPage({ params }: PageProps<"/preview/[session]">) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PREVIEW !== "1") notFound();
  const { session: sessionId } = await params;
  const session = await loadSession("m1-handling-children", sessionId);
  if (!session) notFound();
  return (
    <>
      <AppBar right={<span className="text-sm text-white/80">Preview</span>} />
      <Player moduleId="m1-handling-children" session={session} alreadyDone preview />
    </>
  );
}
