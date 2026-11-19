"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { api, tk } from "@/lib/client";

type Q = { lines: { variantId: string; name: string; label: string; qty: number; price: number; image: string | null; slug: string }[]; subtotal: number; discount: number; shipping: number; total: number; issues: string[]; couponValid: boolean };
export default function Cart() {
  const r = useRouter(), { items, setQty, remove, clear } = useCart();
  const [area, setArea] = useState<"Dhaka" | "Outside Dhaka">("Dhaka"), [code, setCode] = useState(""), [coupon, setCoupon] = useState("");
  const [q, setQ] = useState<Q | null>(null), [err, setErr] = useState(""), [busy, setBusy] = useState(false), [ready, setReady] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", address: "", city: "" });
  useEffect(() => setReady(true), []);
  useEffect(() => { api("/api/me", "GET").then(u => { if (u) setF(x => ({ ...x, name: u.name, email: u.email, ...(u.address || {}) })); }).catch(() => {}); }, []);
  useEffect(() => { if (!ready) return; if (!items.length) { setQ(null); return; } api<Q>("/api/quote", "POST", { items, area, coupon: coupon || undefined }).then(setQ).catch(e => setErr(e.message)); }, [items, area, coupon, ready]);
  async function place() {
    setBusy(true); setErr("");
    try { const d = await api("/api/orders", "POST", { items, ...f, area, coupon: coupon || undefined }); clear(); r.push(`/order/${d.number}`); }
    catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }
  if (!ready) return null;
  if (!items.length) return <><h1>Your cart is empty</h1><p><Link className="btn" href="/">Shop the drop</Link></p></>;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return <><h1 style={{ marginBottom: 16 }}>Checkout</h1><div className="two"><div>
    <h3>1. Your items</h3>
    {q?.lines.map(l => <div className="ln" key={l.variantId}><div className="ph">{l.image ? <img src={l.image} alt="" /> : "RS"}</div><div style={{ flex: 1 }}><Link href={`/products/${l.slug}`}><b>{l.name}</b></Link><div className="mu">{l.label} · {tk(l.price)}</div><div className="q"><button onClick={() => setQty(l.variantId, l.qty - 1)}>−</button><span>{l.qty}</span><button onClick={() => setQty(l.variantId, l.qty + 1)}>+</button></div> <button className="opt" style={{ border: 0 }} onClick={() => remove(l.variantId)}>Remove</button></div><b>{tk(l.price * l.qty)}</b></div>)}
    {q?.issues.map(i => <p className="err" key={i}>{i}</p>)}
    <div className="f" style={{ margin: "14px 0" }}><label>Discount code<input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code" /></label><button className="btn ol" onClick={() => setCoupon(code.trim())}>Apply code</button>{q && !q.couponValid && <span className="err">That code is not valid.</span>}</div>
    <h3 style={{ margin: "20px 0 10px" }}>2. Your details</h3>
    <div className="f"><label>Full name<input value={f.name} onChange={set("name")} autoComplete="name" /></label><label>Email<input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></label><label>Mobile number<input value={f.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" autoComplete="tel" /></label><label>Street address<input value={f.address} onChange={set("address")} autoComplete="street-address" /></label><label>City or district<input value={f.city} onChange={set("city")} /></label><label>Delivery area<select value={area} onChange={e => setArea(e.target.value as typeof area)}><option>Dhaka</option><option>Outside Dhaka</option></select></label></div>
    <h3 style={{ margin: "20px 0 10px" }}>3. Payment</h3>
    <div className="pay"><input type="radio" checked readOnly aria-label="Cash on delivery" /><div><b>Cash on delivery</b><div className="mu">Pay the courier when your order arrives.</div></div></div>
    {["bKash", "Nagad", "SSLCommerz"].map(x => <div className="pay" key={x} style={{ opacity: .55 }}><input type="radio" disabled aria-label={x} /><div><b>{x}</b><div className="mu">Not enabled. Needs merchant credentials and a gateway integration.</div></div></div>)}
  </div><div>
    <h3>Order summary</h3>
    {q && <><div className="row"><span>Subtotal</span><span>{tk(q.subtotal)}</span></div>{q.discount > 0 && <div className="row"><span>Discount</span><span>−{tk(q.discount)}</span></div>}<div className="row"><span>Delivery</span><span>{q.shipping ? tk(q.shipping) : "Free"}</span></div><div className="mu">VAT included. Totals are calculated by the server.</div><div className="row"><b>Total</b><b>{tk(q.total)}</b></div></>}
    {err && <p className="err">{err}</p>}
    <button className="btn ac" style={{ width: "100%", marginTop: 12 }} disabled={busy || !q || !!q.issues.length} onClick={place}>{busy ? "Placing order…" : "Place order"}</button>
  </div></div></>;
}
