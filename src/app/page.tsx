import AppBar from "@/components/AppBar";
import { requireTeacher } from "@/lib/auth";
import { logoutAction } from "./login/actions";

export default async function Home() {
  const t = await requireTeacher();
  const first = t.display_name.split(" ")[0];
  return (
    <>
      <AppBar
        right={
          <form action={logoutAction}>
            <button className="rounded-md px-2 py-1 text-sm text-white/80 hover:text-white">Log out</button>
          </form>
        }
      />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
            {t.section === "junior" ? "Junior section" : "Senior section"}
            {t.is_admin ? " · Admin" : ""}
          </p>
          <h1 className="mt-1 font-serif text-[32px] font-medium leading-[40px] text-plum">
            Namaste, {first}
          </h1>
          <p className="mt-2 text-muted">Your first session will appear here soon.</p>
        </div>
      </main>
    </>
  );
}
