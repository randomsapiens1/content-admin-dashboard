import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    return NextResponse.json(
      { error: "Admin credentials are not configured" },
      { status: 500 }
    );
  }

  const usernameMatches = username === adminUsername;
  const passwordMatches = await verifyPassword(password, adminPasswordHash);

  if (!usernameMatches || !passwordMatches) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  await setSessionCookie();

  const from = new URL(request.url).searchParams.get("from");
  const redirectTo = from && from.startsWith("/admin") ? from : "/admin";
  return NextResponse.redirect(new URL(redirectTo, request.url), {
    status: 303,
  });
}
