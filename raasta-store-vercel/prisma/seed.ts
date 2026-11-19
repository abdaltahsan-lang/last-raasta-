import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
const S = ["S", "M", "L", "XL"];
const mk = (colors: string[], sizes: string[], stock: number[]) => colors.flatMap((c, i) => sizes.map((s, j) => ({ label: sizes.length === 1 && s === "One size" ? c : `${c} / ${s}`, stock: stock[(i + j) % stock.length], priceDelta: 0 })));
const products = [
  ["Night Shift Boxy Tee", "Tops", 1490, 1890, "Heavyweight 280 gsm cotton, boxy cut, dropped shoulder. Puff-print back graphic.", mk(["Black"], S, [9, 14, 11, 4]), true, true],
  ["Rickshaw Art Hoodie", "Tops", 3490, 4200, "Brushed fleece hoodie with hand-painted rickshaw art embroidery on the chest.", mk(["Rust", "Grey"], S, [6, 10, 8, 3]), true, true],
  ["Gulshan Cargo Pants", "Bottoms", 3290, null, "Relaxed cargo with six pockets and adjustable ankle toggles. Ripstop cotton blend.", mk(["Olive", "Black"], ["30", "32", "34", "36"], [7, 9, 12, 5]), true, false],
  ["Dept. Dad Cap", "Headwear", 990, 1290, "Six-panel cap with woven label and brass-tone buckle. One size, adjustable.", mk(["Navy", "Black"], ["One size"], [20, 16]), false, true],
  ["Runner 01 Sneakers", "Footwear", 5990, 6990, "Chunky runner with mesh upper and reflective heel tab. Runs true to size.", mk(["Grey"], ["40", "41", "42", "43", "44"], [4, 8, 10, 7, 2]), true, false],
  ["Flyover Cargo Shorts", "Bottoms", 1990, null, "Knee-length cargo shorts in washed twill with a drawcord waist.", mk(["Charcoal"], ["30", "32", "34"], [10, 12, 8]), false, false],
  ["Tin Shed Crewneck", "Tops", 2590, null, "Garment-dyed crewneck sweatshirt with raw hem and tonal chest print.", mk(["Stone"], S, [5, 9, 7, 2]), false, true],
  ["Alley Tote", "Accessories", 890, 1190, "Canvas tote with inside zip pocket and screen-printed logo. Fits a 15 inch laptop.", mk(["Black"], ["One size"], [30]), false, true],
] as const;
async function main() {
  const email = (process.env.ADMIN_EMAIL || "").toLowerCase(), pw = process.env.ADMIN_PASSWORD || "";
  if (!email || pw.length < 10) throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 10 characters in .env first.");
  await db.user.upsert({ where: { email }, update: { role: "ADMIN" }, create: { email, name: "Store admin", role: "ADMIN", emailVerifiedAt: new Date(), passwordHash: await bcrypt.hash(pw, 12) } });
  if (await db.product.count() === 0) for (const [name, category, price, compareAt, description, variants, isNew, isBest] of products)
    await db.product.create({ data: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), category, price, compareAt, description, isNew, isBest, images: [], variants: { create: variants } } });
  for (const c of [{ code: "RAASTA10", percent: 10, freeShip: false }, { code: "FREESHIP", percent: 0, freeShip: true }])
    await db.coupon.upsert({ where: { code: c.code }, update: {}, create: c });
  console.log("Seeded. Sign in at /login with", email);
}
main().finally(() => db.$disconnect());
