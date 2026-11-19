import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Buy from "@/components/Buy";
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({ where: { slug: params.slug }, include: { variants: { orderBy: { id: "asc" } } } });
  if (!p || !p.active) notFound();
  const related = await db.product.findMany({ where: { active: true, category: p.category, NOT: { id: p.id } }, take: 4 });
  return <>
    <Buy product={{ id: p.id, name: p.name, category: p.category, description: p.description, price: p.price, compareAt: p.compareAt, images: p.images, variants: p.variants.map(v => ({ id: v.id, label: v.label, stock: v.stock, priceDelta: v.priceDelta })) }} />
    {related.length > 0 && <><h3 style={{ margin: "28px 0 10px" }}>More from {p.category}</h3><div className="grid">{related.map(r => <a key={r.id} className="card" href={`/products/${r.slug}`}><div className="ph">{r.images[0] ? <img src={r.images[0]} alt={r.name} /> : "RAASTA"}</div><b>{r.name}</b></a>)}</div></>}
  </>;
}
