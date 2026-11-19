import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ip, json, limited, parse } from "@/lib/http";
import { priceCart } from "@/lib/pricing";
import { sendMail } from "@/lib/mail";
import { CartSchema } from "@/lib/cart-schema";

const S = z.object({
  items: CartSchema.min(1, "Your cart is empty."),
  name: z.string().trim().min(2, "Enter your full name.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().transform(s => s.replace(/[\s-]/g, "")).pipe(z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, "Enter a Bangladeshi mobile number like 01712345678.")),
  address: z.string().trim().min(6, "Enter your full street address.").max(200),
  city: z.string().trim().min(2, "Enter your city or district.").max(60),
  area: z.enum(["Dhaka", "Outside Dhaka"]),
  coupon: z.string().max(30).optional(),
});
export async function POST(req: Request) {
  const p = await parse(req, S); if (p.error) return p.error;
  if (await limited("order:" + ip(req), 10, 36e5)) return json({ error: "Too many orders from this connection. Try again later." }, 429);
  const d = p.data;
  const priced = await priceCart(d.items, d.area, d.coupon);
  if (!priced.couponValid) return json({ error: "That discount code is not valid." }, 409);
  if (priced.issues.length || !priced.lines.length) return json({ error: priced.issues[0] || "Your cart changed. Review it and try again." }, 409);
  const user = await getUser();
  const number = "RS-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  try {
    await db.$transaction(async tx => {
      for (const l of priced.lines) {
        // Conditional decrement: fails if another order took the last units first.
        const r = await tx.variant.updateMany({ where: { id: l.variantId, stock: { gte: l.qty } }, data: { stock: { decrement: l.qty } } });
        if (r.count !== 1) throw new Error("STOCK");
      }
      await tx.order.create({ data: {
        number, userId: user?.id, name: d.name, email: d.email, phone: d.phone, address: d.address, city: d.city, area: d.area,
        subtotal: priced.subtotal, discount: priced.discount, shipping: priced.shipping, total: priced.total, coupon: priced.coupon, payment: "COD",
        items: { create: priced.lines.map(l => ({ variantId: l.variantId, name: l.name, label: l.label, qty: l.qty, price: l.price })) },
      } });
    });
  } catch (e) {
    if ((e as Error).message === "STOCK") return json({ error: "Someone just bought the last units of an item. Review your cart." }, 409);
    throw e;
  }
  sendMail(d.email, `RAASTA order ${number}`, `Thanks ${d.name}. Your order ${number} is placed. Total due on delivery: ৳${priced.total}.`).catch(() => {});
  return json({ ok: true, number });
}
