import { z } from "zod";
import { db } from "@/lib/db";
import { adminApi } from "@/lib/auth";
import { json, parse } from "@/lib/http";
const S = z.object({
  announce: z.string().max(200), shipIn: z.number().int().min(0), shipOut: z.number().int().min(0), freeShip: z.number().int().min(0),
  coupons: z.array(z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,20}$/, "Codes use 3-20 letters, numbers, - or _."), percent: z.number().int().min(0).max(100), freeShip: z.boolean(), active: z.boolean() })).max(50),
});
export async function PUT(req: Request) {
  if (!(await adminApi())) return json({ error: "Not allowed." }, 403);
  const p = await parse(req, S); if (p.error) return p.error;
  const { coupons, ...s } = p.data;
  await db.$transaction([
    ...Object.entries(s).map(([key, v]) => db.setting.upsert({ where: { key }, update: { value: String(v) }, create: { key, value: String(v) } })),
    db.coupon.deleteMany(), db.coupon.createMany({ data: coupons, skipDuplicates: true }),
  ]);
  return json({ ok: true });
}
