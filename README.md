# Dashforge

An open-source, config-driven admin dashboard for managing content and media uploads in any Next.js backend. Fork it, describe your content in one file, set a few environment variables, and deploy — no CMS SaaS, no vendor lock-in.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Neon Postgres (via the Vercel Marketplace)
- Vercel Blob for file/media storage
- A small, custom single-admin session (signed cookie) — no auth framework

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Provision infrastructure** (requires the Vercel CLI, `npm i -g vercel`)

   ```bash
   vercel link
   vercel integration add neon      # or add via the Vercel dashboard Marketplace
   # Add a Blob store from the Vercel dashboard (Storage tab) if not already present
   vercel env pull .env.local
   ```

3. **Set the remaining env vars** in `.env.local` (see `.env.example`):

   ```bash
   npm run hash-password -- "your-password"   # paste result into ADMIN_PASSWORD_HASH
   openssl rand -base64 32                     # paste result into AUTH_SECRET
   ```

4. **Push the database schema**

   ```bash
   npm run db:push
   ```

5. *(Optional)* seed some sample content:

   ```bash
   npm run seed
   ```

6. **Run it**

   ```bash
   npm run dev
   ```

   Visit `/admin` and sign in with `ADMIN_USERNAME` / your password.

## Adapting this template to a new project

This is the one file you're expected to edit per project:

- **`src/collections/*.config.ts`** — define your content types here (see `posts.config.ts` for an example). Each collection has a `slug`, a `label`, and a list of `fields` (`text`, `richtext`, `number`, `boolean`, `date`, `image`, `select`). Register new collections in `src/collections/index.ts`.

Everything else — the dynamic form, item table, media library, auth, and public API — is generic and works for any collection you define.

Other customization points:

- **Branding**: `src/lib/branding.ts` (dashboard title) and `NEXT_PUBLIC_SITE_NAME`.
- **Public API shape**: `src/app/api/content/[collection]/route.ts` and `.../[itemSlug]/route.ts` — adjust the returned fields to match your frontend's needs.

## How content is consumed by your website

The dashboard exposes a small public, read-only API for published content:

- `GET /api/content/<collection>` — paginated list of published items
- `GET /api/content/<collection>/<slug>` — a single published item (404 if draft or missing)

Your website's frontend (a separate app, or other routes in this same app) fetches from these endpoints — nothing else in `/admin` is exposed publicly.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store token |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password — generate with `npm run hash-password -- "..."` |
| `AUTH_SECRET` | 32+ byte random string used to sign the session cookie |
| `NEXT_PUBLIC_SITE_NAME` | Optional — dashboard title |

## Future enhancements (not built here)

- UI-based collection builder (DB-backed collection definitions)
- Multi-user accounts with roles
- Versioning / revision history
- Direct-to-Blob client uploads for very large files
- Relational fields between collections, full-text search, i18n
