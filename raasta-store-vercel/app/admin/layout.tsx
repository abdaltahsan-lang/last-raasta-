import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <><nav className="anav">{[["/admin", "Overview"], ["/admin/products", "Products"], ["/admin/orders", "Orders"], ["/admin/settings", "Settings"]].map(([h, t]) => <Link className="ib" key={h} href={h}>{t}</Link>)}</nav>{children}</>;
}
