"use client";

import { useState, useTransition } from "react";
import PinPad from "@/components/PinPad";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const res = await loginAction(username.trim().toLowerCase(), pin);
      if (res?.error) {
        setError(res.error);
        setPin("");
      }
    });
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">Username</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          inputMode="text"
          placeholder="e.g. priya.k"
          className="h-12 rounded-md border border-line-strong bg-raised px-3 text-base"
          required
        />
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold">4-digit PIN</span>
        <PinPad value={pin} onChange={setPin} disabled={pending} />
      </div>
      {error && (
        <p role="alert" className="rounded-md bg-cream px-3 py-2 text-[15px] text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || pin.length < 4 || !username}
        className="h-12 rounded-md bg-purple text-[15px] font-semibold text-white disabled:opacity-40"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        Forgot your PIN? Ask Sam to reset it.
      </p>
    </form>
  );
}
