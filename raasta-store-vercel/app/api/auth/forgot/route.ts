import { z } from "zod";
import { db } from "@/lib/db";
import { issueToken } from "@/lib/auth";
import { ip, json, limited, parse } from "@/lib/http";
import { appUrl, sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  const p = await parse(req, z.object({ email: z.string().trim().toLowerCase().email() })); if (p.error) return p.error;
  if (await limited("forgot:" + ip(req), 5, 36e5)) return json({ error: "Too many requests. Try again later." }, 429);
  const u = await db.user.findUnique({ where: { email: p.data.email } });
  if (u) {
    const t = await issueToken(u.id, "RESET", 1);
    await sendMail(u.email, "Reset your RAASTA password", `Choose a new password: ${appUrl()}/reset?token=${t}\n\nThe link works for 1 hour. If you did not ask for this, ignore this email.`);
  }
  // Always the same answer, so the form cannot be used to find out who has an account.
  return json({ ok: true });
}
