import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tk } from "@/lib/client";
const LIVE = { notIn: ["CANCELLED", "REFUNDED"] as ("CANCELLED" | "REFUNDED")[] };
export default async function Dash() {
  await requireAdmin();
  const since = new Date(Date.now() - 14 * 864e5);
  const [rev, orders, pending, customers, products, low, best, recent, last14] = await Promise.all([
    db.order.aggregate({ _sum: { total: true }, where: { status: LIVE } }),
    db.order.count(), db.order.count({ where: { status: "PENDING" } }), db.user.count({ where: { role: "CUSTOMER" } }), db.product.count(),
    db.variant.findMany({ where: { stock: { lte: 3 } }, include: { product: { select: { name: true } } }, take: 12, orderBy: { stock: "asc" } }),
    db.orderItem.groupBy({ by: ["name"], _sum: { qty: true }, where: { order: { status: LIVE } }, orderBy: { _sum: { qty: "desc" } }, take: 5 }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.order.findMany({ where: { createdAt: { gte: since }, status: LIVE }, select: { createdAt: true, total: true } }),
  ]);
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5).toDateString(); return last14.filter(o => o.createdAt.toDateString() === d).reduce((s, o) => s + o.total, 0); });
  const max = Math.max(...days, 1);
  return <>
    <div className="kp"><div><b>{tk(rev._sum.total || 0)}</b>Revenue</div><div><b>{orders}</b>Orders</div><div><b>{pending}</b>Pending</div><div><b>{customers}</b>Customers</div><div><b>{products}</b>Products</div></div>
    <h3>Revenue, last 14 days</h3><div className="bars">{days.map((d, i) => <i key={i} title={tk(d)} style={{ height: `${(d / max) * 100}%` }} />)}</div>
    <div className="two"><div><h3>Best sellers</h3>{best.map(b => <div className="row" key={b.name}><span>{b.name}</span><b>{b._sum.qty}</b></div>)}{!best.length && <p className="mu">No sales yet.</p>}</div>
    <div><h3>Low stock</h3>{low.map(v => <div className="row" key={v.id}><span>{v.product.name} ({v.label})</span><b className={v.stock ? "" : "err"}>{v.stock}</b></div>)}{!low.length && <p className="mu">Nothing running low.</p>}</div></div>
    <h3 style={{ margin: "20px 0 6px" }}>Recent orders</h3>{recent.map(o => <div className="row" key={o.id}><span>{o.number} · {o.name}</span><span>{o.status.toLowerCase()} · {tk(o.total)}</span></div>)}
  </>;
}
