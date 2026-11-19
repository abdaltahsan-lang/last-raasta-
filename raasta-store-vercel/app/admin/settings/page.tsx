import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/pricing";
import SettingsForm from "@/components/SettingsForm";
export default async function Settings() {
  await requireAdmin();
  const [s, coupons] = await Promise.all([getSettings(), db.coupon.findMany({ orderBy: { code: "asc" } })]);
  return <><h2 style={{ marginBottom: 10 }}>Settings</h2><SettingsForm initial={{ announce: s.announce, shipIn: +s.shipIn, shipOut: +s.shipOut, freeShip: +s.freeShip, coupons }} /></>;
}
