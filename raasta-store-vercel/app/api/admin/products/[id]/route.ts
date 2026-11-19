import { db } from "@/lib/db";
import { adminApi } from "@/lib/auth";
import { json, parse, sameOrigin } from "@/lib/http";
import { ProductIn } from "@/lib/product-schema";
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!(await adminApi())) return json({ error: "Not allowed." }, 403);
  const p = await parse(req, ProductIn); if (p.error) return p.error;
  const { variants, compareAt, ...d } = p.data, id = params.id;
  await db.$transaction(async tx => {
    await tx.product.update({ where: { id }, data: { ...d, compareAt: compareAt || null } });
    await tx.variant.deleteMany({ where: { productId: id, id: { notIn: variants.flatMap(v => v.id ? [v.id] : []) } } });
    for (const v of variants) {
      const data = { label: v.label, stock: v.stock, priceDelta: v.priceDelta };
      if (v.id) await tx.variant.updateMany({ where: { id: v.id, productId: id }, data });
      else await tx.variant.create({ data: { ...data, productId: id } });
    }
  });
  return json({ ok: true });
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!sameOrigin(req)) return json({ error: "Request blocked." }, 403);
  if (!(await adminApi())) return json({ error: "Not allowed." }, 403);
  await db.product.delete({ where: { id: params.id } });
  return json({ ok: true });
}
