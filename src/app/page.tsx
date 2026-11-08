import { redirect } from "next/navigation";

export default function Home() {
  // Until sessions exist, the app starts at login.
  redirect("/login");
}
