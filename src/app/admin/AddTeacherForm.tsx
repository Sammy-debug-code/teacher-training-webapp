"use client";

import { useActionState } from "react";
import { addTeacher, resetPin, type ActionResult } from "./actions";

export function AddTeacherForm() {
  const [state, action, pending] = useActionState(addTeacher, null);
  return (
    <form action={action} className="rounded-lg border border-line bg-raised p-4 shadow-card">
      <h2 className="font-serif text-[20px] font-semibold text-plum">Add a teacher</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Full name
          <input name="display_name" required className="h-11 rounded-md border border-line-strong px-3 text-base font-normal" placeholder="Damini Kumari" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Username
          <input name="username" required className="h-11 rounded-md border border-line-strong px-3 text-base font-normal" placeholder="damini" autoCapitalize="none" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Section
          <select name="section" className="h-11 rounded-md border border-line-strong bg-raised px-3 text-base font-normal">
            <option value="junior">Primary (Nursery–5)</option>
            <option value="senior">Senior (6–12)</option>
          </select>
        </label>
      </div>
      <button disabled={pending} className="mt-3 h-11 rounded-md bg-purple px-4 text-[15px] font-semibold text-white disabled:opacity-50">
        {pending ? "Adding…" : "Add teacher"}
      </button>
      <Result state={state} />
    </form>
  );
}

export function ResetPinButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resetPin, null);
  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button disabled={pending} className="rounded-md border border-line-strong px-2 py-1 text-sm font-semibold text-accent disabled:opacity-50">
        {pending ? "…" : "Reset PIN"}
      </button>
      {state?.pin && (
        <span className="rounded-sm bg-marigold px-2 py-0.5 text-sm font-bold text-plum">PIN {state.pin}</span>
      )}
      {state?.error && <span className="text-sm text-danger">{state.error}</span>}
    </form>
  );
}

function Result({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (state.error) return <p role="alert" className="mt-3 text-[15px] text-danger">{state.error}</p>;
  return (
    <div className="mt-3 rounded-md bg-cream p-3">
      <p className="font-semibold text-plum">{state.ok}</p>
      <p className="mt-1 text-[15px]">
        Username <code className="rounded-sm bg-white px-1">{state.username}</code> · PIN{" "}
        <span className="rounded-sm bg-marigold px-2 py-0.5 font-bold text-plum">{state.pin}</span>
      </p>
      <p className="mt-1 text-sm text-muted">Write the PIN down now; it is not shown again. You can always reset it.</p>
    </div>
  );
}
