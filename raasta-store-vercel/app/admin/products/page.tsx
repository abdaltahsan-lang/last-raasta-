import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tk } from "@/lib/client";
export default async function Products() {
  await requireAdmin();
  const ps = await db.product.findMany({ orderBy: { createdAt: "desc" }, include: { variants: true } });
  return <><div className="row"><h2>Products</h2><Link className="btn ac" href="/admin/products/new">Add product</Link></div>
    <div className="ts"><table className="tb"><thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>
      {ps.map(p => <tr key={p.id}><td><div className="ph" style={{ width: 44, fontSize: 9 }}>{p.images[0] ? <img src={p.images[0]} alt="" /> : "RS"}</div></td><td>{p.name}</td><td>{p.category}</td><td>{tk(p.price)}</td><td>{p.variants.reduce((s, v) => s + v.stock, 0)}</td><td>{p.active ? "Live" : "Hidden"}</td><td><Link className="btn sm ol" href={`/admin/products/${p.id}`}>Edit</Link></td></tr>)}
    </tbody></table></div></>;
}
