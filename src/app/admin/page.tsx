import Link from "next/link";
import AppBar from "@/components/AppBar";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddTeacherForm, ResetPinButton } from "./AddTeacherForm";
import { setActive } from "./actions";

type Row = {
  id: string;
  username: string;
  display_name: string;
  section: string;
  is_admin: boolean;
  is_active: boolean;
  last_seen_at: string | null;
};

export default async function AdminPage() {
  await requireAdmin();
  const [{ data: teachers }, { data: completions }, { data: ledger }] = await Promise.all([
    db().from("teachers").select("id, username, display_name, section, is_admin, is_active, last_seen_at").order("display_name"),
    db().from("card_events").select("teacher_id, session_id").eq("event_type", "session_completed"),
    db().from("coin_ledger").select("teacher_id, delta"),
  ]);
  const sessionsDone = new Map<string, number>();
  for (const c of completions ?? []) sessionsDone.set(c.teacher_id, (sessionsDone.get(c.teacher_id) ?? 0) + 1);
  const coins = new Map<string, number>();
  for (const l of ledger ?? []) coins.set(l.teacher_id, (coins.get(l.teacher_id) ?? 0) + (l.delta as number));

  const rows = (teachers ?? []) as Row[];
  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "never";

  return (
    <>
      <AppBar right={<Link href="/" className="text-sm text-white/80">Home</Link>} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Admin</p>
            <h1 className="mt-1 font-serif text-[28px] font-medium leading-[34px] text-plum">Teachers</h1>
          </div>
          <nav className="flex gap-2 text-sm">
            <span className="rounded-md bg-mist px-3 py-1.5 font-semibold text-plum">Teachers</span>
            <Link href="/admin/reflections" className="rounded-md px-3 py-1.5 font-semibold text-accent">Reflections</Link>
          </nav>
        </div>

        <AddTeacherForm />

        <div className="overflow-x-auto rounded-lg border border-line bg-raised">
          <table className="w-full text-left text-[15px]">
            <thead className="bg-cream text-[13px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-2 font-semibold">Name</th>
                <th className="px-4 py-2 font-semibold">Username</th>
                <th className="px-4 py-2 font-semibold">Section</th>
                <th className="px-4 py-2 font-semibold">Sessions</th>
                <th className="px-4 py-2 font-semibold">Coins</th>
                <th className="px-4 py-2 font-semibold">Last seen</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className={r.is_active ? "" : "opacity-50"}>
                  <td className="px-4 py-2 font-semibold text-plum">
                    {r.display_name} {r.is_admin && <span className="ml-1 rounded-sm bg-mist px-1 text-[11px] uppercase text-accent">admin</span>}
                  </td>
                  <td className="px-4 py-2"><code>{r.username}</code></td>
                  <td className="px-4 py-2">{r.section === "junior" ? "Primary" : "Senior"}</td>
                  <td className="px-4 py-2">{sessionsDone.get(r.id) ?? 0} / 8</td>
                  <td className="px-4 py-2">{coins.get(r.id) ?? 0}</td>
                  <td className="px-4 py-2 text-muted">{fmt(r.last_seen_at)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <ResetPinButton id={r.id} />
                      {!r.is_admin && (
                        <form action={setActive}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="active" value={r.is_active ? "0" : "1"} />
                          <button className="rounded-md border border-line px-2 py-1 text-sm text-muted">
                            {r.is_active ? "Deactivate" : "Reactivate"}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
