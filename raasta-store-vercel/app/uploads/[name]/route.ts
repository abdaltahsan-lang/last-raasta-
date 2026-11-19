import { readFile } from "fs/promises";
import path from "path";
const TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", avif: "image/avif" };
export async function GET(_: Request, { params }: { params: { name: string } }) {
  const m = /^[a-f0-9-]{36}\.(png|jpg|webp|avif)$/.exec(params.name);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(path.join(process.env.UPLOAD_DIR || "./uploads", params.name));
    return new Response(buf, { headers: { "Content-Type": TYPES[m[1]], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
