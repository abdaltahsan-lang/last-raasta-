import { z } from "zod";
import { json, parse } from "@/lib/http";
import { priceCart } from "@/lib/pricing";
import { CartSchema } from "@/lib/cart-schema";
export async function POST(req: Request) {
  const p = await parse(req, z.object({ items: CartSchema, area: z.enum(["Dhaka", "Outside Dhaka"]), coupon: z.string().max(30).optional() })); if (p.error) return p.error;
  return json(await priceCart(p.data.items, p.data.area, p.data.coupon));
}
