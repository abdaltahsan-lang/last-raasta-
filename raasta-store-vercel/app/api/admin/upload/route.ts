import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { adminApi } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/avif": "avif" };
const useS3 = () => !!(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_PUBLIC_URL);
let client: S3Client | null = null;
const s3 = () => client ??= new S3Client({
  region: process.env.S3_REGION || "auto",
  forcePathStyle: true, // needed by Supabase Storage, fine for Cloudflare R2
  endpoint: process.env.S3_ENDPOINT || undefined, // R2: https://<account-id>.r2.cloudflarestorage.com · Supabase: https://<project-ref>.supabase.co/storage/v1/s3
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Request blocked." }, 403);
  if (!(await adminApi())) return json({ error: "Not allowed." }, 403);
  const f = (await req.formData()).get("file");
  if (!(f instanceof File)) return json({ error: "No file received." }, 400);
  const ext = EXT[f.type];
  if (!ext) return json({ error: "Use a PNG, JPG, WebP or AVIF image." }, 400);
  if (f.size > 4 * 1024 * 1024) return json({ error: "Images must be under 4 MB." }, 400);
  const name = `${crypto.randomUUID()}.${ext}`, body = Buffer.from(await f.arrayBuffer());
  if (useS3()) {
    await s3().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: `products/${name}`, Body: body, ContentType: f.type, CacheControl: "public, max-age=31536000, immutable" }));
    return json({ url: `${process.env.S3_PUBLIC_URL!.replace(/\/$/, "")}/products/${name}` });
  }
  // Local fallback for development only. Not persistent on serverless hosts.
  const dir = process.env.UPLOAD_DIR || "./uploads";
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), body);
  return json({ url: `/uploads/${name}` });
}
