"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export const UNLOCK_COOKIE = "btt_unlock_all";

/** Admin-only test switch: unlock every session on this device. */
export async function toggleUnlockAll() {
  await requireAdmin();
  const jar = await cookies();
  if (jar.get(UNLOCK_COOKIE)?.value === "1") jar.delete(UNLOCK_COOKIE);
  else jar.set(UNLOCK_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/");
}

export async function unlockAllActive(isAdmin: boolean): Promise<boolean> {
  if (!isAdmin) return false;
  return (await cookies()).get(UNLOCK_COOKIE)?.value === "1";
}
