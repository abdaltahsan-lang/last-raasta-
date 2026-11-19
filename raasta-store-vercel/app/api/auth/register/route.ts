import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword, issueToken } from "@/lib/auth";
import { ip, json, limited, parse } from "@/lib/http";
import { appUrl, sendMail } from "@/lib/mail";

const S = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), password: z.string().min(8, "Password must be at least 8 characters.").max(128) });
export async function POST(req: Request) {
  const p = await parse(req, S); if (p.error) return p.error;
  if (await limited("reg:" + ip(req), 10, 36e5)) return json({ error: "Too many attempts. Try again later." }, 429);
  const { name, email, password } = p.data;
  if (await db.user.findUnique({ where: { email } })) return json({ error: "An account with this email already exists." }, 409);
  const u = await db.user.create({ data: { name, email, passwordHash: await hashPassword(password) } });
  const t = await issueToken(u.id, "VERIFY", 48);
  await sendMail(email, "Verify your RAASTA account", `Hi ${name},\n\nConfirm your email: ${appUrl()}/api/auth/verify?token=${t}\n\nThe link works for 48 hours.`);
  await createSession(u.id);
  return json({ ok: true, role: u.role });
}
