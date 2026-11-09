import Link from "next/link";
import AppBar from "@/components/AppBar";
import Illo from "@/components/Illo";
import { requireTeacher } from "@/lib/auth";

const MODULE = "m1-handling-children";

export default async function StartPage() {
  const t = await requireTeacher();
  const first = t.display_name.split(" ")[0];
  const items: { illo: Parameters<typeof Illo>[0]["name"]; title: string; hi: string; text: string }[] = [
    {
      illo: "calendar",
      title: "One session a day, 15 minutes",
      hi: "रोज़ एक सेशन, 15 मिनट",
      text: "Eight sessions on eight school days. Each one opens the morning after you finish the last. Sundays and holidays are off.",
    },
    {
      illo: "notebook",
      title: "One small thing to try in class",
      hi: "क्लास में आज़माने के लिए एक छोटी चीज़",
      text: "Every session ends with a task for your classroom. The next session starts by asking how it went. That is where the learning happens.",
    },
    {
      illo: "coins",
      title: "Coins, and a streak to protect",
      hi: "सिक्के, और बचाने के लिए एक स्ट्रीक",
      text: "You earn coins for every card and every session. Miss a school day and half your coins are gone. Top teachers at the end get recognised in the staff room.",
    },
    {
      illo: "map",
      title: "No lecture. Real situations.",
      hi: "कोई लेक्चर नहीं। असली हालात।",
      text: "You will be put in classroom moments you recognise, choose what to do, and see what happens. Wrong turns are allowed; you can always rewind.",
    },
  ];
  return (
    <>
      <AppBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6 pb-28">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">Before you begin</p>
          <h1 className="mt-1 font-serif text-[32px] font-medium leading-[40px] text-plum">How this works, {first}</h1>
        </div>
        <ol className="flex flex-col gap-5">
          {items.map((it, i) => (
            <li key={i} className="overflow-hidden rounded-lg border border-line bg-raised shadow-card">
              <Illo name={it.illo} />
              <div className="p-4">
                <h2 className="font-serif text-[24px] font-semibold leading-[30px] text-plum">{it.title}</h2>
                <p className="hi text-sm text-muted">{it.hi}</p>
                <p className="mt-2">{it.text}</p>
                {it.illo === "coins" && (
                  <Link href="/coins" className="mt-2 inline-block text-[15px] font-semibold text-accent">
                    What are coins for? →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface to-transparent px-4 pb-6 pt-8">
          <Link
            href={`/m/${MODULE}/s1`}
            className="mx-auto block h-12 w-full max-w-md rounded-md bg-purple text-center text-[15px] font-semibold leading-[48px] text-white"
          >
            Start Session 1
          </Link>
        </div>
      </main>
    </>
  );
}
