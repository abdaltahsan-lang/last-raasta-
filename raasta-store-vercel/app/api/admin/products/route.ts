import crypto from "crypto";
import { db } from "@/lib/db";
import { adminApi } from "@/lib/auth";
import { json, parse } from "@/lib/http";
import { ProductIn } from "@/lib/product-schema";
export async function POST(req: Request) {
  if (!(await adminApi())) return json({ error: "Not allowed." }, 403);
  const p = await parse(req, ProductIn); if (p.error) return p.error;
  const { variants, compareAt, ...d } = p.data;
  const slug = d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + crypto.randomBytes(2).toString("hex");
  const created = await db.product.create({ data: { ...d, slug, compareAt: compareAt || null, variants: { create: variants.map(v => ({ label: v.label, stock: v.stock, priceDelta: v.priceDelta })) } } });
  return json({ id: created.id });
}
