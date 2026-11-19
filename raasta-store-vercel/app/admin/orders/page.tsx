import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tk } from "@/lib/client";
import StatusSelect from "@/components/StatusSelect";
export default async function Orders({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  await requireAdmin();
  const q = searchParams.q?.trim(), st = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].find(s => s === searchParams.status);
  const orders = await db.order.findMany({
    where: { ...(st ? { status: st as "PENDING" } : {}), ...(q ? { OR: [{ number: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }, { email: { contains: q, mode: "insensitive" } }] } : {}) },
    orderBy: { createdAt: "desc" }, take: 100, include: { items: true },
  });
  return <><h2 style={{ marginBottom: 10 }}>Orders</h2>
    <form className="tools" action="/admin/orders"><input name="q" defaultValue={q} placeholder="Order number, name, phone or email" style={{ minWidth: 260 }} /><select name="status" defaultValue={st || ""}><option value="">All statuses</option>{["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(s => <option key={s} value={s}>{s.toLowerCase()}</option>)}</select><button className="btn sm">Filter</button></form>
    <div className="ts"><table className="tb"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>
      {orders.map(o => <tr key={o.id}><td>{o.number}<br /><span className="mu">{o.createdAt.toLocaleDateString("en-GB")}</span></td>
        <td>{o.name}<br /><span className="mu">{o.phone} · {o.email}<br />{o.address}, {o.city} ({o.area})</span></td>
        <td>{o.items.map(i => <div key={i.id}>{i.name} ({i.label}) × {i.qty}</div>)}</td>
        <td>{tk(o.total)}<br /><span className="mu">{o.payment}{o.coupon ? ` · ${o.coupon}` : ""}</span></td>
        <td><StatusSelect id={o.id} status={o.status} /></td></tr>)}
      {!orders.length && <tr><td colSpan={5} className="mu">No orders match.</td></tr>}
    </tbody></table></div></>;
}
