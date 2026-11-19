import { getUser, issueToken } from "@/lib/auth";
import { ip, json, limited, sameOrigin } from "@/lib/http";
import { appUrl, sendMail } from "@/lib/mail";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Request blocked." }, 403);
  const u = await getUser();
  if (!u) return json({ error: "Sign in first." }, 401);
  if (u.emailVerifiedAt) return json({ ok: true });
  if (await limited("resend:" + ip(req), 5, 36e5)) return json({ error: "Too many requests. Try again later." }, 429);
  const t = await issueToken(u.id, "VERIFY", 48);
  await sendMail(u.email, "Verify your RAASTA account", `Confirm your email: ${appUrl()}/api/auth/verify?token=${t}`);
  return json({ ok: true });
}
