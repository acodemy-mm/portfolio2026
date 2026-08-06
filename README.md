# Netflix-inspired Portfolio

Next.js App Router + Tailwind + Framer Motion portfolio with a **password-protected admin** at `/admin` for managing projects (info + cover photos).

## Quick start

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and admin at [http://localhost:3000/admin](http://localhost:3000/admin).

Until you save content in admin, the site uses seed content. In production, content should be stored in Supabase tables and storage buckets.

## Admin CMS

1. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local`
2. Configure Supabase env vars
3. Apply the SQL in `supabase/schema.sql`
4. Visit `/admin` and sign in
5. Manage **Projects**, **Work Experiences**, and **Activity**
6. Optional one-time bootstrap: send a `POST` request to `/api/admin/bootstrap` after signing in to copy current local JSON/seed content into Supabase

Until your Supabase tables contain rows, the site uses seed content. Local data files are still supported as a bootstrap source during migration: `data/projects.json`, `data/experiences.json`, `data/activity.json`.

## Routes

| Path | Description |
|------|-------------|
| `/` | Billboard home + rows |
| `/work`, `/work/[slug]` | Projects |
| `/skills` | Skills + experience |
| `/services` | Services |
| `/activity` | Activity feed |
| `/articles`, `/articles/[slug]` | Articles (seed) |
| `/about` | About |
| `/contact` | Contact form |
| `/resume` | ATS-optimized CV |
| `/admin` | Password-protected project CMS |

## Deploy on Vercel

This app is set up for Vercel when content persistence is backed by Supabase.

1. Create a Supabase project
2. Run the SQL in `supabase/schema.sql`
3. In Supabase Storage, confirm the `projects`, `experiences`, and `activity` public buckets exist
4. Set these Vercel environment variables:
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional email vars if using the contact form
5. Deploy to Vercel with the default Next.js settings
6. Sign in to `/admin`
7. Optionally call `POST /api/admin/bootstrap` once to seed Supabase from current local JSON files or fallback seed data

After that, admin writes and uploads persist in Supabase and the public site reads the same live content.

## Env

```
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=long-random-string
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
