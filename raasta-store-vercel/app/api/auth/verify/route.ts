import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeToken } from "@/lib/auth";
import { appUrl } from "@/lib/mail";
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") || "";
  const id = token ? await consumeToken(token, "VERIFY") : null;
  if (id) await db.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });
  return NextResponse.redirect(`${appUrl()}/account?verified=${id ? "1" : "0"}`);
}
