import { z } from "zod";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { json, parse } from "@/lib/http";
const S = z.object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().max(20), address: z.string().trim().max(200), city: z.string().trim().max(60), area: z.enum(["Dhaka", "Outside Dhaka"]) });
export async function PATCH(req: Request) {
  const u = await getUser(); if (!u) return json({ error: "Sign in first." }, 401);
  const p = await parse(req, S); if (p.error) return p.error;
  const { name, ...address } = p.data;
  await db.user.update({ where: { id: u.id }, data: { name, address } });
  return json({ ok: true });
}
