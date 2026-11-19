import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";

const COOKIE = "rs_session";
export const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const checkPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(userId: string) {
  const raw = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 864e5);
  await db.session.create({ data: { tokenHash: sha(raw), userId, expiresAt } });
  cookies().set(COOKIE, raw, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}
export async function destroySession() {
  const raw = cookies().get(COOKIE)?.value;
  if (raw) await db.session.deleteMany({ where: { tokenHash: sha(raw) } });
  cookies().delete(COOKIE);
}
export async function getUser() {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const s = await db.session.findUnique({ where: { tokenHash: sha(raw) }, include: { user: true } });
  if (!s || s.expiresAt < new Date()) return null;
  return s.user;
}
export async function requireUser() {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}
/** Use at the top of every admin page. Layout checks alone are not enough. */
export async function requireAdmin() {
  const u = await getUser();
  if (!u || u.role !== "ADMIN" || !u.emailVerifiedAt) redirect("/login?next=/admin");
  return u;
}
/** For admin API routes: returns the admin or null. */
export async function adminApi() {
  const u = await getUser();
  return u && u.role === "ADMIN" && u.emailVerifiedAt ? u : null;
}
export async function issueToken(userId: string, type: "VERIFY" | "RESET", hours: number) {
  const raw = crypto.randomBytes(32).toString("hex");
  await db.token.deleteMany({ where: { userId, type } });
  await db.token.create({ data: { tokenHash: sha(raw), type, userId, expiresAt: new Date(Date.now() + hours * 36e5) } });
  return raw;
}
export async function consumeToken(raw: string, type: "VERIFY" | "RESET") {
  const t = await db.token.findUnique({ where: { tokenHash: sha(raw) } });
  if (!t || t.type !== type || t.expiresAt < new Date()) return null;
  await db.token.delete({ where: { id: t.id } });
  return t.userId;
}
