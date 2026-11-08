import AppBar from "@/components/AppBar";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <AppBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-8">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
            Teacher training
          </p>
          <h1 className="mt-1 font-serif text-[32px] font-medium leading-[40px] text-plum">
            Welcome back
          </h1>
          <p className="mt-2 text-muted">Log in with the username and PIN you were given.</p>
        </div>
        <LoginForm />
      </main>
    </>
  );
}
