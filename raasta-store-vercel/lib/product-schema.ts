import { z } from "zod";
export const ProductIn = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(120),
  category: z.string().trim().min(2, "Enter a category.").max(40),
  description: z.string().trim().max(2000),
  price: z.number().int().min(1, "Enter a price above 0."),
  compareAt: z.number().int().min(0).nullable(),
  images: z.array(z.string().refine(u => /^\/uploads\/[a-f0-9-]{36}\.(png|jpg|webp|avif)$/.test(u) || (!!process.env.S3_PUBLIC_URL && u.startsWith(process.env.S3_PUBLIC_URL.replace(/\/$/, "") + "/")), "Invalid image address.")).max(10),
  isNew: z.boolean(), isBest: z.boolean(), active: z.boolean(),
  variants: z.array(z.object({ id: z.string().optional(), label: z.string().trim().min(1).max(60), stock: z.number().int().min(0), priceDelta: z.number().int() })).min(1, "Add at least one variant.").max(60),
});
