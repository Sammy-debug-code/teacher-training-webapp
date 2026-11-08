import { NextResponse, type NextRequest } from "next/server";

// Cheap gate: if there is no session cookie at all, go to /login.
// Real verification happens in server code (requireTeacher).
export function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has("btt_session");
  const { pathname } = request.nextUrl;
  if (!hasCookie && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|brand|fonts|icons|manifest.webmanifest|favicon.ico|.*\\.(?:png|svg|jpg|webp|woff2)).*)"],
};
