"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
type Mode = "login" | "register" | "forgot" | "reset";
const T = { login: "Sign in", register: "Create account", forgot: "Reset your password", reset: "Choose a new password" };
export default function AuthForm({ mode }: { mode: Mode }) {
  const r = useRouter(), sp = useSearchParams();
  const [f, setF] = useState({ name: "", email: "", password: "" }), [err, setErr] = useState(""), [note, setNote] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setNote("");
    try {
      if (mode === "forgot") { await api("/api/auth/forgot", "POST", { email: f.email }); setNote("If that email has an account, a reset link is on its way."); }
      else if (mode === "reset") { await api("/api/auth/reset", "POST", { token: sp.get("token") || "", password: f.password }); r.push("/login?reset=1"); }
      else {
        const d = await api(`/api/auth/${mode}`, "POST", mode === "register" ? f : { email: f.email, password: f.password });
        const next = sp.get("next");
        r.push(next && next.startsWith("/") && !next.startsWith("//") ? next : d.role === "ADMIN" ? "/admin" : "/account"); r.refresh();
      }
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return <form className="f" onSubmit={submit}>
    <h1>{T[mode]}</h1>
    {mode === "login" && sp.get("reset") && <p className="ok">Password updated. Sign in with the new one.</p>}
    {mode === "register" && <label>Full name<input value={f.name} onChange={set("name")} autoComplete="name" required /></label>}
    {mode !== "reset" && <label>Email<input type="email" value={f.email} onChange={set("email")} autoComplete="email" required /></label>}
    {mode !== "forgot" && <label>{mode === "reset" ? "New password" : "Password"}<input type="password" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "login" ? 1 : 8} required /></label>}
    {err && <p className="err">{err}</p>}{note && <p className="ok">{note}</p>}
    <button className="btn ac" disabled={busy}>{busy ? "One moment…" : T[mode]}</button>
    <p className="mu">{mode === "login" && <><Link href="/forgot"><u>Forgot password?</u></Link> · <Link href="/register"><u>Create an account</u></Link></>}{mode === "register" && <>Already have an account? <Link href="/login"><u>Sign in</u></Link></>}{mode === "forgot" && <Link href="/login"><u>Back to sign in</u></Link>}</p>
  </form>;
}
