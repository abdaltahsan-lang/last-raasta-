import { z } from "zod";
import { db } from "@/lib/db";
import { consumeToken, hashPassword } from "@/lib/auth";
import { json, parse } from "@/lib/http";

export async function POST(req: Request) {
  const p = await parse(req, z.object({ token: z.string().min(10), password: z.string().min(8, "Password must be at least 8 characters.").max(128) })); if (p.error) return p.error;
  const id = await consumeToken(p.data.token, "RESET");
  if (!id) return json({ error: "This reset link is invalid or has expired." }, 400);
  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(p.data.password), emailVerifiedAt: new Date() } });
  await db.session.deleteMany({ where: { userId: id } }); // sign out everywhere
  return json({ ok: true });
}
