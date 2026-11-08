"use server";

// Placeholder until the Supabase schema and session cookie land (next step).
export async function loginAction(username: string, pin: string): Promise<{ error?: string }> {
  if (!/^\d{4}$/.test(pin)) return { error: "PIN must be 4 digits." };
  return { error: `Login for "${username}" is not wired up yet.` };
}
