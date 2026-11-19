import { db } from "./db";

export const DEFAULTS = { announce: "Free delivery in Dhaka over ৳4,000 · Code RAASTA10 for 10% off", shipIn: "80", shipOut: "130", freeShip: "4000" };
export async function getSettings() {
  const rows = await db.setting.findMany();
  return { ...DEFAULTS, ...Object.fromEntries(rows.map(r => [r.key, r.value])) } as typeof DEFAULTS;
}
export type CartIn = { variantId: string; qty: number }[];

/** The only place totals are computed. Prices, stock, coupons and delivery all come from the database. */
export async function priceCart(input: CartIn, area: string, couponCode?: string) {
  const merged = new Map<string, number>();
  for (const i of input) merged.set(i.variantId, (merged.get(i.variantId) || 0) + i.qty);
  const s = await getSettings();
  const vs = await db.variant.findMany({ where: { id: { in: [...merged.keys()] } }, include: { product: true } });
  const lines: { variantId: string; name: string; label: string; qty: number; price: number; image: string | null; slug: string }[] = [];
  const issues: string[] = [];
  let subtotal = 0;
  for (const [id, want] of merged) {
    const v = vs.find(x => x.id === id);
    if (!v || !v.product.active) { issues.push("An item in your cart is no longer available."); continue; }
    const qty = Math.min(want, v.stock);
    if (qty < want) issues.push(`${v.product.name} (${v.label}): only ${v.stock} left.`);
    if (qty < 1) continue;
    const price = v.product.price + v.priceDelta;
    lines.push({ variantId: v.id, name: v.product.name, label: v.label, qty, price, image: v.product.images[0] ?? null, slug: v.product.slug });
    subtotal += price * qty;
  }
  const c = couponCode ? await db.coupon.findFirst({ where: { code: couponCode.trim().toUpperCase(), active: true } }) : null;
  const discount = c ? Math.round((subtotal * c.percent) / 100) : 0;
  const inDhaka = area === "Dhaka";
  const shipping = !lines.length || c?.freeShip || (inDhaka && subtotal - discount >= +s.freeShip) ? 0 : inDhaka ? +s.shipIn : +s.shipOut;
  return { lines, subtotal, discount, shipping, total: subtotal - discount + shipping, issues, couponValid: !couponCode || !!c, coupon: c?.code ?? null };
}
