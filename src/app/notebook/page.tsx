import Link from "next/link";
import AppBar from "@/components/AppBar";
import Illo from "@/components/Illo";
import { requireTeacher } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function NotebookPage() {
  const t = await requireTeacher();
  const { data } = await db()
    .from("reflections")
    .select("id, module_id, session_id, prompt_id, text, created_at")
    .eq("teacher_id", t.id)
    .not("prompt_id", "like", "%-message")
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long" });
  return (
    <>
      <AppBar right={<Link href="/" className="text-sm text-white/80">Home</Link>} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <div className="overflow-hidden rounded-lg border border-line bg-raised shadow-card">
          <Illo name="notebook" />
          <div className="p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{t.display_name}</p>
            <h1 className="mt-1 font-serif text-[28px] font-medium leading-[34px] text-plum">My notebook</h1>
            <p className="mt-1 text-sm text-muted">Everything you have written in the sessions, newest first.</p>
          </div>
        </div>
        {rows.length === 0 && <p className="text-muted">Nothing here yet. Your first entry comes in Session 1.</p>}
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg bg-cream p-4">
              <p className="text-sm text-muted">
                Session {String(r.session_id).replace(/^s/, "")} · {fmt(r.created_at as string)}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[16px] leading-[26px]">{r.text as string}</p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
