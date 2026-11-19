"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { tk } from "@/lib/client";
type V = { id: string; label: string; stock: number; priceDelta: number };
type P = { id: string; name: string; category: string; description: string; price: number; compareAt: number | null; images: string[]; variants: V[] };
export default function Buy({ product: p }: { product: P }) {
  const first = Math.max(0, p.variants.findIndex(v => v.stock > 0));
  const [vi, setVi] = useState(first), [qty, setQty] = useState(1), [im, setIm] = useState(0), [msg, setMsg] = useState("");
  const { add, wish, toggleWish } = useCart();
  const v = p.variants[vi], price = p.price + v.priceDelta, was = p.compareAt && p.compareAt > p.price ? p.compareAt + v.priceDelta : 0;
  return <div className="two">
    <div>
      <div className="ph" style={{ fontSize: 40 }}>{p.images[im] ? <img src={p.images[im]} alt={p.name} /> : "RAASTA"}</div>
      {p.images.length > 1 && <div className="th">{p.images.map((s, i) => <button key={s} className={i === im ? "on" : ""} onClick={() => setIm(i)} aria-label={`Photo ${i + 1}`}><img src={s} alt="" /></button>)}</div>}
    </div>
    <div>
      <span className="mu">{p.category}</span>
      <h1 style={{ fontSize: 34, margin: "6px 0 12px" }}>{p.name}</h1>
      <div><b style={{ fontSize: 24 }}>{tk(price)}</b> {was ? <><s className="mu">{tk(was)}</s> <b className="ok">Save {Math.round(100 - (price / was) * 100)}%</b></> : null}</div>
      <p>{p.description}</p>
      <div className="mu" style={{ marginBottom: 6 }}>Size and color</div>
      <div>{p.variants.map((x, i) => <button key={x.id} className={`opt ${i === vi ? "on" : ""}`} disabled={x.stock < 1} onClick={() => { setVi(i); setQty(1); }}>{x.label}{x.priceDelta ? ` (+${tk(x.priceDelta)})` : ""}</button>)}</div>
      <p className={v.stock && v.stock < 6 ? "err" : "mu"}>{v.stock ? (v.stock < 6 ? `Only ${v.stock} left` : "In stock") : "Sold out"}</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div className="q"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button><span>{qty}</span><button onClick={() => setQty(Math.min(v.stock, 10, qty + 1))} aria-label="More">+</button></div>
        <button className="btn ac" disabled={!v.stock} onClick={() => { add({ variantId: v.id, qty }); setMsg("Added to cart."); }}>Add to cart</button>
        <Link className="btn" href="/cart" onClick={e => { if (!v.stock) e.preventDefault(); else add({ variantId: v.id, qty }); }} aria-disabled={!v.stock}>Buy now</Link>
        <button className="btn ol" onClick={() => toggleWish(p.id)}>{wish.includes(p.id) ? "♥ Saved" : "♡ Save"}</button>
      </div>
      {msg && <p className="ok">{msg} <Link href="/cart"><u>View cart</u></Link></p>}
      <p className="mu">Delivery: 1–2 days in Dhaka, 3–5 days elsewhere. 7-day exchange on unworn items.</p>
    </div>
  </div>;
}
