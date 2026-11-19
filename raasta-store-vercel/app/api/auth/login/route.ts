import { z } from "zod";
import { db } from "@/lib/db";
import { checkPassword, createSession } from "@/lib/auth";
import { ip, json, limited, parse } from "@/lib/http";

const S = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(128) });
export async function POST(req: Request) {
  const p = await parse(req, S); if (p.error) return p.error;
  const { email, password } = p.data;
  if (await limited(`login:${ip(req)}:${email}`, 8, 15 * 60e3)) return json({ error: "Too many attempts. Wait 15 minutes and try again." }, 429);
  const u = await db.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password.
  if (!u || !(await checkPassword(password, u.passwordHash))) return json({ error: "Incorrect email or password." }, 401);
  await createSession(u.id);
  return json({ ok: true, role: u.role });
}
