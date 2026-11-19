import { z } from "zod";
import { db } from "@/lib/db";
import { adminApi } from "@/lib/auth";
import { json, parse } from "@/lib/http";
const OUT = ["CANCELLED", "REFUNDED"];
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await adminApi())) return json({ error: "Not allowed." }, 403);
  const p = await parse(req, z.object({ status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]) })); if (p.error) return p.error;
  await db.$transaction(async tx => {
    const o = await tx.order.findUnique({ where: { id: params.id }, include: { items: true } });
    if (!o) return;
    // Put stock back the first time an order is cancelled or refunded.
    if (OUT.includes(p.data.status) && !OUT.includes(o.status))
      for (const i of o.items) if (i.variantId) await tx.variant.updateMany({ where: { id: i.variantId }, data: { stock: { increment: i.qty } } });
    await tx.order.update({ where: { id: o.id }, data: { status: p.data.status } });
  });
  return json({ ok: true });
}
