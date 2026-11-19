import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getUser } from "@/lib/auth";
import { getSettings } from "@/lib/pricing";
import CartLink from "@/components/CartLink";

const font = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font" });
export const metadata: Metadata = { title: "RAASTA – Streetwear from Dhaka", description: "Heavyweight streetwear made in small runs in Dhaka." };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([getUser(), getSettings()]);
  return (
    <html lang="en" className={font.variable}>
      <body>
        {s.announce && <div className="bar">{s.announce}</div>}
        <header><div className="hd">
          <Link href="/" className="logo">RAASTA</Link>
          <nav className="nav">
            <Link className="ib" href="/">Shop</Link>
            {user?.role === "ADMIN" && <Link className="ib" href="/admin">Admin</Link>}
            <Link className="ib" href={user ? "/account" : "/login"}>{user ? "Account" : "Sign in"}</Link>
            <CartLink />
          </nav>
        </div></header>
        <main>{children}</main>
        <footer>RAASTA · Dhaka · Exchanges within 7 days on unworn items with tags.</footer>
      </body>
    </html>
  );
}
