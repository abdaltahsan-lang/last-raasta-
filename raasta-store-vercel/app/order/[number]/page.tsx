import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { tk } from "@/lib/client";
export default async function OrderPage({ params }: { params: { number: string } }) {
  const o = await db.order.findUnique({ where: { number: params.number }, include: { items: true } });
  if (!o) notFound();
  return <div style={{ maxWidth: 560 }}>
    <h1>Order placed</h1><p>Your order number is <b>{o.number}</b>. We will call to confirm before dispatch.</p>
    {o.items.map(i => <div className="row" key={i.id}><span>{i.name} × {i.qty}<br /><span className="mu">{i.label}</span></span><span>{tk(i.price * i.qty)}</span></div>)}
    <div className="row"><span>Delivery</span><span>{o.shipping ? tk(o.shipping) : "Free"}</span></div>
    <div className="row"><b>Total due on delivery</b><b>{tk(o.total)}</b></div>
    <p className="mu">Status: {o.status.toLowerCase()}</p>
  </div>;
}
