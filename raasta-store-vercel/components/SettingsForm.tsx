"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
type C = { code: string; percent: number; freeShip: boolean; active: boolean };
type S = { announce: string; shipIn: number; shipOut: number; freeShip: number; coupons: C[] };
export default function SettingsForm({ initial }: { initial: S }) {
  const r = useRouter(), [s, setS] = useState(initial), [msg, setMsg] = useState(""), [err, setErr] = useState("");
  const setC = (i: number, p: Partial<C>) => setS({ ...s, coupons: s.coupons.map((c, j) => j === i ? { ...c, ...p } : c) });
  async function save() { setErr(""); setMsg(""); try { await api("/api/admin/settings", "PUT", s); setMsg("Saved."); r.refresh(); } catch (e) { setErr((e as Error).message); } }
  return <div className="f">
    <label>Announcement bar<input value={s.announce} onChange={e => setS({ ...s, announce: e.target.value })} /></label>
    <label>Delivery fee in Dhaka (৳)<input type="number" value={s.shipIn} onChange={e => setS({ ...s, shipIn: +e.target.value })} /></label>
    <label>Delivery fee outside Dhaka (৳)<input type="number" value={s.shipOut} onChange={e => setS({ ...s, shipOut: +e.target.value })} /></label>
    <label>Free Dhaka delivery over (৳)<input type="number" value={s.freeShip} onChange={e => setS({ ...s, freeShip: +e.target.value })} /></label>
    <b>Discount codes</b>
    {s.coupons.map((c, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto auto auto", gap: 6, alignItems: "center" }}>
      <input value={c.code} onChange={e => setC(i, { code: e.target.value.toUpperCase() })} aria-label="Code" /><input type="number" value={c.percent} onChange={e => setC(i, { percent: +e.target.value })} aria-label="Percent off" />
      <label style={{ display: "flex", gap: 4 }}><input type="checkbox" style={{ width: "auto" }} checked={c.freeShip} onChange={e => setC(i, { freeShip: e.target.checked })} />Free delivery</label>
      <label style={{ display: "flex", gap: 4 }}><input type="checkbox" style={{ width: "auto" }} checked={c.active} onChange={e => setC(i, { active: e.target.checked })} />Active</label>
      <button className="btn sm ol" aria-label="Remove code" onClick={() => setS({ ...s, coupons: s.coupons.filter((_, j) => j !== i) })}>×</button></div>)}
    <div className="mu">Columns: code · percent off</div>
    <button className="btn sm ol" onClick={() => setS({ ...s, coupons: [...s.coupons, { code: "", percent: 10, freeShip: false, active: true }] })}>Add code</button>
    {err && <p className="err">{err}</p>}{msg && <p className="ok">{msg}</p>}
    <button className="btn ac" onClick={save}>Save settings</button>
  </div>;
}
