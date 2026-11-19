"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
export default function StatusSelect({ id, status }: { id: string; status: string }) {
  const r = useRouter(), [v, setV] = useState(status), [err, setErr] = useState("");
  return <><select value={v} aria-label="Order status" onChange={async e => { const n = e.target.value; setErr(""); try { await api(`/api/admin/orders/${id}`, "PATCH", { status: n }); setV(n); r.refresh(); } catch (x) { setErr((x as Error).message); } }}>
    {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(s => <option key={s} value={s}>{s.toLowerCase()}</option>)}</select>{err && <div className="err">{err}</div>}</>;
}
