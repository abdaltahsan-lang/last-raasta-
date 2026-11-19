import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
/** Setup check: shows which settings exist (never their values) and whether the database is ready. */
export async function GET() {
  const env = Object.fromEntries(["DATABASE_URL", "DIRECT_URL", "APP_URL", "S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_URL"].map(k => [k, !!process.env[k]]));
  let database = "ok", hint = "Database is ready.", products = 0, adminExists = false;
  try { products = await db.product.count(); adminExists = (await db.user.count({ where: { role: "ADMIN" } })) > 0; }
  catch (e) {
    const x = e as { code?: string; message?: string }, c = x.code || "unknown";
    database = "fail";
    hint = c === "P2021" || c === "P2010" ? "The tables do not exist. The build did not create them."
      : c === "P1001" || c === "P1002" ? "Cannot reach the database. Check DATABASE_URL."
      : c === "P1000" ? "Database rejected the login. Check the password in DATABASE_URL."
      : /Environment variable not found/.test(x.message || "") ? "A required setting (DATABASE_URL or DIRECT_URL) is missing."
      : /Query Engine|query engine/.test(x.message || "") ? "Prisma engine file missing in the deployment."
      : `Database error code: ${c}. See the Netlify function logs.`;
  }
  return Response.json({ database, hint, products, adminExists, settingsPresent: env });
}
