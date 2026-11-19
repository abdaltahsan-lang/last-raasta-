"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
type A = { name: string; phone: string; address: string; city: string; area: "Dhaka" | "Outside Dhaka" };
export default function AccountForm({ initial, verified }: { initial: A; verified: boolean }) {
  const r = useRouter(), [f, setF] = useState(initial), [msg, setMsg] = useState("");
  const set = (k: keyof A) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const act = async (fn: () => Promise<unknown>, ok: string) => { try { await fn(); setMsg(ok); } catch (e) { setMsg((e as Error).message); } };
  return <div className="f">
    {!verified && <p className="err">Your email is not verified. <button className="btn sm ol" onClick={() => act(() => api("/api/auth/resend", "POST"), "Verification email sent.")}>Send the link again</button></p>}
    <label>Name<input value={f.name} onChange={set("name")} /></label><label>Phone<input value={f.phone} onChange={set("phone")} /></label><label>Saved address<input value={f.address} onChange={set("address")} /></label><label>City or district<input value={f.city} onChange={set("city")} /></label>
    <label>Delivery area<select value={f.area} onChange={set("area")}><option>Dhaka</option><option>Outside Dhaka</option></select></label>
    <div style={{ display: "flex", gap: 8 }}><button className="btn" onClick={() => act(() => api("/api/account", "PATCH", f), "Saved.")}>Save details</button><button className="btn ol" onClick={async () => { await api("/api/auth/logout", "POST"); r.push("/"); r.refresh(); }}>Sign out</button></div>
    {msg && <p className="ok">{msg}</p>}
  </div>;
}
