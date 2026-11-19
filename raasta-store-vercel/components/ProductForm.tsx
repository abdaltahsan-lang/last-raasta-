"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
type V = { id?: string; label: string; stock: number; priceDelta: number };
export type P = { id?: string; name: string; category: string; description: string; price: number; compareAt: number | null; images: string[]; isNew: boolean; isBest: boolean; active: boolean; variants: V[] };
export default function ProductForm({ initial }: { initial: P }) {
  const r = useRouter(), [p, setP] = useState(initial), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const set = <K extends keyof P>(k: K, v: P[K]) => setP(x => ({ ...x, [k]: v }));
  const setV = (i: number, patch: Partial<V>) => set("variants", p.variants.map((v, j) => j === i ? { ...v, ...patch } : v));
  async function upload(files: FileList | null) {
    if (!files) return; setErr(""); const urls: string[] = [];
    for (const f of Array.from(files)) { const fd = new FormData(); fd.append("file", f); const res = await fetch("/api/admin/upload", { method: "POST", body: fd }); const d = await res.json(); if (!res.ok) setErr(d.error); else urls.push(d.url); }
    setP(x => ({ ...x, images: [...x.images, ...urls] }));
  }
  async function save() {
    setBusy(true); setErr("");
    try { await api(p.id ? `/api/admin/products/${p.id}` : "/api/admin/products", p.id ? "PUT" : "POST", p); r.push("/admin/products"); r.refresh(); }
    catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }
  async function del() { if (!p.id || !confirm("Delete this product? This cannot be undone.")) return; await api(`/api/admin/products/${p.id}`, "DELETE"); r.push("/admin/products"); r.refresh(); }
  return <div className="two"><div className="f">
    <h2>{p.id ? "Edit product" : "New product"}</h2>
    <label>Name<input value={p.name} onChange={e => set("name", e.target.value)} /></label>
    <label>Category<input value={p.category} onChange={e => set("category", e.target.value)} /></label>
    <label>Price (৳)<input type="number" value={p.price} onChange={e => set("price", +e.target.value)} /></label>
    <label>Original price (৳), 0 for no discount<input type="number" value={p.compareAt ?? 0} onChange={e => set("compareAt", +e.target.value || null)} /></label>
    <label>Description<textarea value={p.description} onChange={e => set("description", e.target.value)} /></label>
    <label><span><input type="checkbox" style={{ width: "auto" }} checked={p.isNew} onChange={e => set("isNew", e.target.checked)} /> Mark as new</span></label>
    <label><span><input type="checkbox" style={{ width: "auto" }} checked={p.isBest} onChange={e => set("isBest", e.target.checked)} /> Mark as best seller</span></label>
    <label><span><input type="checkbox" style={{ width: "auto" }} checked={p.active} onChange={e => set("active", e.target.checked)} /> Visible in the store</span></label>
  </div><div className="f">
    <b>Photos</b>
    <div className="imgs">{p.images.map((s, i) => <div key={s}><img src={s} alt="" /><button aria-label="Remove photo" onClick={() => set("images", p.images.filter((_, j) => j !== i))}>×</button></div>)}{!p.images.length && <span className="mu">No photos yet.</span>}</div>
    <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" multiple onChange={e => upload(e.target.files)} />
    <b>Variants</b><span className="mu">One row per size or color. Stock is reduced automatically when orders arrive.</span>
    {p.variants.map((v, i) => <div key={v.id || i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: 6 }}>
      <input value={v.label} onChange={e => setV(i, { label: e.target.value })} aria-label="Label" placeholder="Black / M" />
      <input type="number" value={v.stock} onChange={e => setV(i, { stock: +e.target.value })} aria-label="Stock" />
      <input type="number" value={v.priceDelta} onChange={e => setV(i, { priceDelta: +e.target.value })} aria-label="Extra price" />
      <button className="btn sm ol" onClick={() => set("variants", p.variants.filter((_, j) => j !== i))} aria-label="Remove variant">×</button></div>)}
    <div className="mu">Columns: label · stock · extra price (৳)</div>
    <button className="btn sm ol" onClick={() => set("variants", [...p.variants, { label: "", stock: 0, priceDelta: 0 }])}>Add variant</button>
    {err && <p className="err">{err}</p>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn ac" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save product"}</button>{p.id && <button className="btn ol" style={{ color: "var(--er)" }} onClick={del}>Delete</button>}</div>
  </div></div>;
}
