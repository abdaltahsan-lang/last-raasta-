import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { tk } from "@/lib/client";
import AccountForm from "@/components/AccountForm";
export default async function Account({ searchParams }: { searchParams: { verified?: string } }) {
  const u = await requireUser();
  const orders = await db.order.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, include: { items: true } });
  const a = (u.address || {}) as { phone?: string; address?: string; city?: string; area?: "Dhaka" | "Outside Dhaka" };
  return <>
    <h1 style={{ marginBottom: 14 }}>Account</h1>
    {searchParams.verified === "1" && <p className="ok">Email verified. Thank you.</p>}
    {searchParams.verified === "0" && <p className="err">That verification link is invalid or has expired.</p>}
    <p className="mu">{u.email}</p>
    <AccountForm verified={!!u.emailVerifiedAt} initial={{ name: u.name, phone: a.phone || "", address: a.address || "", city: a.city || "", area: a.area || "Dhaka" }} />
    <h2 style={{ margin: "28px 0 8px" }}>Orders</h2>
    {orders.length ? orders.map(o => <details key={o.id} style={{ borderBottom: "1px solid var(--mu)", padding: "8px 0" }}><summary>{o.number} · {o.createdAt.toLocaleDateString("en-GB")} · {o.status.toLowerCase()} · {tk(o.total)}</summary>{o.items.map(i => <div className="mu" key={i.id}>{i.name} ({i.label}) × {i.qty}</div>)}</details>) : <p className="mu">No orders yet.</p>}
  </>;
}
