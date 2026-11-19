import { z } from "zod";
export const CartSchema = z.array(z.object({ variantId: z.string(), qty: z.number().int().min(1).max(10) })).max(30);
