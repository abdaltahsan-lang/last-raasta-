import { NextResponse } from "next/server";
import { ZodSchema } from "zod";
import { db } from "./db";

export const json = (d: unknown, status = 200) => NextResponse.json(d, { status });
export function sameOrigin(req: Request) {
  const o = req.headers.get("origin");
  return !o || new URL(o).host === req.headers.get("host");
}
export async function parse<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T; error?: undefined } | { error: NextResponse; data?: undefined }> {
  if (!sameOrigin(req)) return { error: json({ error: "Request blocked." }, 403) };
  let raw: unknown;
  try { raw = await req.json(); } catch { return { error: json({ error: "Invalid request." }, 400) }; }
  const r = schema.safeParse(raw);
  if (!r.success) return { error: json({ error: r.error.issues[0]?.message || "Invalid input." }, 400) };
  return { data: r.data };
}
export const ip = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
/** Counts attempts in the database, so limits hold across serverless instances. */
export async function limited(key: string, max: number, windowMs: number) {
  const r = await db.rateLimit.findUnique({ where: { key } });
  if (!r || r.resetAt < new Date()) {
    const resetAt = new Date(Date.now() + windowMs);
    await db.rateLimit.upsert({ where: { key }, update: { count: 1, resetAt }, create: { key, count: 1, resetAt } });
    return false;
  }
  const u = await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return u.count > max;
}
