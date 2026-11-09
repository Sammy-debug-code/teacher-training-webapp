import Link from "next/link";
import AppBar from "@/components/AppBar";
import Illo from "@/components/Illo";
import { requireTeacher } from "@/lib/auth";
import { COINS, LEVELS, levelFor, lifetimeCoins } from "@/lib/progress";

export default async function CoinsPage() {
  const t = await requireTeacher();
  const lifetime = await lifetimeCoins(t.id);
  const level = levelFor(lifetime);
  return (
    <>
      <AppBar right={<Link href="/" className="text-sm text-white/80">Home</Link>} />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
        <div className="overflow-hidden rounded-lg border border-line bg-raised shadow-card">
          <Illo name="coins" />
          <div className="p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Coins and levels</p>
            <h1 className="mt-1 font-serif text-[28px] font-medium leading-[34px] text-plum">What are the coins for?</h1>
          </div>
        </div>

        <section className="flex flex-col gap-3 text-[16px] leading-[26px]">
          <h2 className="font-serif text-[22px] font-semibold text-plum">How you earn them</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><b>+{COINS.card}</b> for every card you complete</li>
            <li><b>+{COINS.session}</b> for finishing a session</li>
            <li>Rewinding a wrong choice costs nothing. That is how the training works.</li>
          </ul>

          <h2 className="mt-2 font-serif text-[22px] font-semibold text-plum">The one way to lose them</h2>
          <p>
            Miss a school day without opening the app and half your coins are gone. Sundays and school holidays do not count.
            This is deliberate: a fifteen-minute session every day changes how you teach; the same sessions spread over two
            months do not.
          </p>

          <h2 className="mt-2 font-serif text-[22px] font-semibold text-plum">Levels never go down</h2>
          <p>
            Levels count every coin you have ever earned, so a missed day cannot take one away. You are at{" "}
            <b>{level.current.name}</b>{level.next ? `, ${level.next.min - lifetime} coins from ${level.next.name}` : " — the top"}.
          </p>
          <ol className="grid grid-cols-4 gap-2 text-center text-sm">
            {LEVELS.map((l) => (
              <li
                key={l.name}
                className={`rounded-md border p-2 ${l.name === level.current.name ? "border-purple bg-mist" : "border-line"}`}
              >
                <div className="font-bold text-plum">{l.name}</div>
                <div className="text-muted">{l.min}+</div>
              </li>
            ))}
          </ol>

          <h2 className="mt-2 font-serif text-[22px] font-semibold text-plum">What they lead to</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>A certificate at the end of the module, Bronze, Silver or Gold by your level, presented at a staff meeting.</li>
            <li>The top five teachers of the module are recognised in the staff room.</li>
            <li>When the whole section crosses a shared coin total, the staff room celebrates together.</li>
            <li>Any further recognition is announced by the school when the module ends.</li>
          </ul>
          <p className="text-muted">
            Coins are not money and cannot be exchanged. They are a record of showing up and doing the work.
          </p>
        </section>
      </main>
    </>
  );
}
