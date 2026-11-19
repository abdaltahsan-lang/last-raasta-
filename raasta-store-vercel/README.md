# RAASTA — streetwear store

Next.js 14 (App Router) · TypeScript · PostgreSQL · Prisma.

## Deploy on Vercel (no Docker or BIOS changes)

This project is configured for Vercel. Use a hosted PostgreSQL database and object storage because Vercel's function filesystem is temporary.

### 1. Create the hosted database

1. Create a PostgreSQL project at [Neon](https://neon.tech/) (the free tier is suitable for getting started; usage limits apply).
2. Copy both connection strings from Neon:
   - **Pooled** connection string → `DATABASE_URL`
   - **Direct** connection string → `DIRECT_URL`
3. Keep these credentials private. Do not commit them to GitHub.

### 2. Prepare the project in VS Code

1. Open this folder in VS Code and run `npm install` in the terminal.
2. Copy `.env.example` to a new file named `.env`.
3. In `.env`, set `DATABASE_URL` and `DIRECT_URL` to your Neon connection strings. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` (at least 10 characters).
4. In the VS Code terminal, run:

   ```bash
   npx prisma db push
   npm run db:seed
   ```

These commands create the tables and the initial admin account in your hosted Neon database. They do not require Docker or a local PostgreSQL installation.

### 3. Configure persistent product image storage

Product uploads must use S3-compatible object storage in production. The local `./uploads` fallback is not persistent on Vercel.

1. Create a Cloudflare R2 bucket and enable its public development/custom domain URL.
2. Create an R2 API token with permission to read and write objects in that bucket.
3. Save the bucket name, S3 endpoint (`https://<account-id>.r2.cloudflarestorage.com`), access key, secret key, and public base URL.
4. Add these Vercel environment variables:
   - `S3_ENDPOINT`
   - `S3_REGION` = `auto`
   - `S3_BUCKET`
   - `S3_ACCESS_KEY_ID`
   - `S3_SECRET_ACCESS_KEY`
   - `S3_PUBLIC_URL`

Do not expose the access key or secret key in client-side code or commit them to GitHub.

### 4. Push the project to GitHub

1. Create a new empty repository at [GitHub](https://github.com/).
2. Upload/push the project files. Do **not** upload `.env`, `node_modules`, or `.next`.
3. Confirm `.env` remains excluded by `.gitignore`.

### 5. Import into Vercel

1. Sign in at [Vercel](https://vercel.com/) and choose **Add New → Project**.
2. Import your GitHub repository.
3. Use these settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build:vercel`
   - Install Command: `npm install`
   - Node.js version: **20.x** (if the project settings offer a version selector)
4. Add the environment variables from `.env.example` in Vercel → Project → Settings → Environment Variables. At minimum add `DATABASE_URL`, `DIRECT_URL`, `APP_URL`, and all six `S3_*` values above. Set `APP_URL` to the Vercel production URL, e.g. `https://your-project.vercel.app`.
5. Add `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the first setup if you have not already seeded the database. The seed command above already creates the admin, so these are not required at build time; keep the password private and remove it from Vercel after initial setup if you added it.
6. Deploy.

### 6. Sign in and test

Open `https://your-project.vercel.app/login` and sign in with the admin email and password you used when running `npm run db:seed`.

## Environment variables

See `.env.example` for the full list. `SMTP_*` values are optional for development; without SMTP configuration, verification/reset links are printed in the server logs. Configure a real email provider before using email verification or password resets in production.

## Important production notes

- Vercel does not provide persistent local disk for serverless functions. Configure R2 before uploading product photos; local `./uploads` storage is for local development only.
- Use the Neon pooled connection for `DATABASE_URL` and the direct connection for `DIRECT_URL`.
- Keep secrets in Vercel Environment Variables and your local `.env`; never commit them.
- The app currently supports cash on delivery. Other payment methods are placeholders until connected to a payment gateway.
- Review your Vercel and Neon usage limits before launch. Free plans have quotas and may change.
