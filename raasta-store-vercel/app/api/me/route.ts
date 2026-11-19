import { getUser } from "@/lib/auth";
import { json } from "@/lib/http";
export async function GET() {
  const u = await getUser();
  return json(u ? { name: u.name, email: u.email, role: u.role, address: u.address } : null);
}
