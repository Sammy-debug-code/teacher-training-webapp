import Link from "next/link";
import AppBar from "@/components/AppBar";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ReflectionsPage() {
  await requireAdmin();
  const { data } = await db()
    .from("reflections")
    .select("id, session_id, prompt_id, text, created_at, teachers(display_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as { id: number; session_id: string; prompt_id: string; text: string; created_at: string; teachers: { display_name: string } | null }[];
  const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return (
    <>
      <AppBar right={<Link href="/" className="text-sm text-white/80">Home</Link>} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Admin</p>
            <h1 className="mt-1 font-serif text-[28px] font-medium leading-[34px] text-plum">Reflections and messages</h1>
          </div>
          <nav className="flex gap-2 text-sm">
            <Link href="/admin" className="rounded-md px-3 py-1.5 font-semibold text-accent">Teachers</Link>
            <span className="rounded-md bg-mist px-3 py-1.5 font-semibold text-plum">Reflections</span>
          </nav>
        </div>
        {rows.length === 0 && <p className="text-muted">Nothing written yet.</p>}
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-raised p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-muted">
                <span className="font-semibold text-plum">{r.teachers?.display_name ?? "—"}</span>
                <span>
                  <span className={`mr-2 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold uppercase ${r.prompt_id.endsWith("-message") ? "bg-marigold text-plum" : "bg-mist text-accent"}`}>
                    {r.prompt_id.endsWith("-message") ? "Message" : "Notebook"}
                  </span>
                  {r.session_id.toUpperCase()} · {fmt(r.created_at)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[16px]">{r.text}</p>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
