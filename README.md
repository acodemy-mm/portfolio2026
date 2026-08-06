# Netflix-inspired Portfolio

Next.js App Router + Tailwind + Framer Motion portfolio with a **password-protected admin** at `/admin` for managing projects (info + cover photos).

## Quick start

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and admin at [http://localhost:3000/admin](http://localhost:3000/admin).

Until you save projects in admin, the site uses seed content. After the first create/update/delete, projects live in `data/projects.json` with uploads under `public/uploads/projects/`.

## Admin CMS

1. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local`
2. Visit `/admin` and sign in
3. Manage **Projects**, **Work Experiences**, and **Activity**

Until you save in admin, the site uses seed content. Data files: `data/projects.json`, `data/experiences.json`, `data/activity.json`.

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

## Deploy

Works with Node (`next start`) where the filesystem persists (`data/` + `public/uploads`). On ephemeral serverless disks (typical Vercel), uploads/JSON will not persist across deploys—use a host with persistent storage or a database/blob later.

## Env

```
ADMIN_PASSWORD=change-me
ADMIN_SESSION_SECRET=long-random-string
```
