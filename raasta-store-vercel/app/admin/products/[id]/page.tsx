import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";
export default async function EditProduct({ params }: { params: { id: string } }) {
  await requireAdmin();
  if (params.id === "new") return <ProductForm initial={{ name: "", category: "Tops", description: "", price: 0, compareAt: null, images: [], isNew: true, isBest: false, active: true, variants: [{ label: "One size", stock: 10, priceDelta: 0 }] }} />;
  const p = await db.product.findUnique({ where: { id: params.id }, include: { variants: { orderBy: { id: "asc" } } } });
  if (!p) notFound();
  return <ProductForm initial={{ id: p.id, name: p.name, category: p.category, description: p.description, price: p.price, compareAt: p.compareAt, images: p.images, isNew: p.isNew, isBest: p.isBest, active: p.active, variants: p.variants.map(v => ({ id: v.id, label: v.label, stock: v.stock, priceDelta: v.priceDelta })) }} />;
}
