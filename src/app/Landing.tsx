import Link from "next/link";
import AppBar from "@/components/AppBar";
import Illo, { type IlloName } from "@/components/Illo";
import type { Module } from "@/lib/content";

export default function Landing({ modules }: { modules: Module[] }) {
  return (
    <>
      <AppBar
        right={
          <Link href="/login" className="rounded-md bg-marigold px-3 py-1.5 text-[15px] font-semibold text-plum">
            Log in
          </Link>
        }
      />
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section className="order-2 lg:order-1">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">Trainings</h2>
            <ul className="mt-3 flex flex-col gap-4">
              {modules.map((m) => (
                <li key={m.id} className="overflow-hidden rounded-lg border border-line bg-raised shadow-card sm:grid sm:grid-cols-[200px_1fr]">
                  <Illo name={(m.illo as IlloName) ?? "map"} />
                  <div className="p-5">
                    <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{m.audience?.en ?? "All teachers"}</p>
                    <h3 className="mt-1 font-serif text-[24px] font-semibold leading-[30px] text-plum">{m.title.en}</h3>
                    <p className="mt-1 text-muted">{m.subtitle.en}</p>
                    <p className="mt-3 text-sm text-muted">
                      {m.sessions.length} sessions · one a day · about 15 minutes each · on your phone
                    </p>
                    <Link href="/login" className="mt-4 inline-block rounded-md bg-purple px-4 py-2 text-[15px] font-semibold text-white">
                      Log in to take this training
                    </Link>
                  </div>
                </li>
              ))}
              <li className="rounded-lg border border-dashed border-line-strong p-5 text-muted">
                More trainings are being built. Each one addresses a real problem our teachers raised.
              </li>
            </ul>
          </section>

          <aside className="order-1 lg:order-2">
            <div className="rounded-lg bg-plum p-6 text-white shadow-card">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-gold">Bethel Teacher Training</p>
              <h1 className="mt-2 font-serif text-[32px] font-medium leading-[40px]">
                Training built for our classrooms, not borrowed from someone else's.
              </h1>
              <p className="mt-4 text-white/85">
                Bethel Mission School, Kishanganj, has taught children in one of Bihar's most remote districts since 1997.
                Good teaching methods rarely reach places like ours in a form teachers can use on Monday morning. This portal
                closes that gap: short, practical trainings, built around situations from our own corridors, taken on a
                phone in fifteen minutes a day.
              </p>
              <p className="mt-4 text-white/85">
                Every training ends with something to try in class. The point is not a certificate. It is a classroom that
                works better for the teacher and the child.
              </p>
              <p className="mt-6 font-serif text-[19px] italic text-gold">Every child — seen, supported, strengthened.</p>
            </div>
            <div className="mt-4 rounded-lg border border-line bg-raised p-5">
              <h2 className="font-semibold text-plum">Are you a Bethel teacher?</h2>
              <p className="mt-1 text-[15px] text-muted">Log in with the username and PIN you were given. No email needed.</p>
              <Link href="/login" className="mt-3 inline-block rounded-md bg-purple px-4 py-2 text-[15px] font-semibold text-white">
                Log in
              </Link>
            </div>
          </aside>
        </div>
        <footer className="mt-12 border-t border-line pt-4 text-sm text-muted">
          Bethel Mission School, Uttar Pali, Kishanganj 855107 · Since 1997 · CBSE affiliated ·{" "}
          <a className="text-accent" href="https://www.bethelschoolkishanganj.com">bethelschoolkishanganj.com</a>
        </footer>
      </main>
    </>
  );
}
