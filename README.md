# EntryDesk

EntryDesk is a role-based event management dashboard for martial arts / sports events.

- **Organizers** create events, approve/reject coach applications, and review/export entries.
- **Coaches** manage dojos + students, apply to public events, and submit entries for approved events.

Built with Next.js App Router + Supabase (Auth + Postgres) and a clean Tailwind/shadcn UI.

---

## Tech Stack

- **Next.js (App Router)** (see `next` in `package.json`)
- **React**
- **Supabase**
	- Auth (email/password + optional Google OAuth)
	- Postgres (tables + RLS policies)
	- SSR helpers via `@supabase/ssr`
- **Tailwind CSS** + Radix UI components (shadcn-style)

---

## Key Features

### Organizer

- Create and manage events (public/private)
- Approve/reject coach applications per event
- View all entries for your events via the `organizer_entries_view`
- Export entries
- Clickable metric cards that deep-link into filtered views

### Coach

- Manage dojos and students
- Browse public events and apply to participate
- Manage entries per event (draft/submitted/approved/rejected)
- Simplified event participation UI (overview + entries + register flow combined)

### UX / Quality of Life

- Determinate navigation loader overlay for instant feedback
- “One-step back” behavior using browser history (no forced jump to list pages)
- Professional, compact dashboard layout

---

## Project Structure (high-level)

- `src/app/` — Next.js routes
	- `src/app/page.tsx` — landing
	- `src/app/login/` — login/register
	- `src/app/auth/callback/route.ts` — OAuth callback (`/auth/callback`)
	- `src/app/dashboard/` — role-based dashboard routes
- `src/lib/supabase/`
	- `client.ts` — browser client
	- `server.ts` — server client (cookies)
	- `middleware.ts` — session refresh helper
- `src/proxy.ts` — Next.js proxy hook for session refresh (replaces deprecated middleware convention)
- `supabase/migrations/db.sql` — schema + RLS policies + `organizer_entries_view`

---

## Setup (Local Development)

### 1) Prerequisites

- Node.js (recommend Node 20+)
- A Supabase project (free tier is fine)

### 2) Install dependencies

```bash
npm install
```

### 3) Create environment variables

Copy the template:

```bash
copy .env.example .env.local
```

Fill in the values from Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BASE_URL` (local default: `http://localhost:3000`)

The template lives in `.env.example`.

### 4) Set up Supabase database schema (tables + RLS)

This repo stores the schema and policies in:

- `supabase/migrations/db.sql`

**Recommended (simple) approach:**

1) Supabase Dashboard → **SQL Editor**
2) Paste the contents of `supabase/migrations/db.sql`
3) Run it

That creates:

- tables: `profiles`, `dojos`, `students`, `events`, `event_days`, `categories`, `event_applications`, `entries`
- enums: `user_role`, `event_type`, `entry_status`
- RLS policies for the app
- view: `organizer_entries_view`

### 5) Supabase Auth configuration

#### Email/password

Works out of the box once your Supabase project is created.

#### Google OAuth (optional)

If you use “Sign in with Google”, you must configure redirect URLs.

1) Supabase Dashboard → **Authentication → Providers → Google**
2) Enable Google and add your OAuth client ID/secret
3) Set allowed redirect URLs to include:
	 - `http://localhost:3000/auth/callback`
4) Ensure `NEXT_PUBLIC_BASE_URL=http://localhost:3000` locally

The app’s OAuth redirect is:

- `${NEXT_PUBLIC_BASE_URL}/auth/callback`

### 6) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Roles & Profiles (important)

Supabase Auth users exist in `auth.users`, but the app’s role system uses `public.profiles`.

### Creating the `profiles` row

- Some flows will auto-create `profiles` if missing (ex: applying to an event).
- If you need to guarantee profiles exist immediately after signup, add a DB trigger later.

### Promoting a user to organizer

To use organizer routes (create/manage events), a user must have:

- a row in `public.profiles`
- `role = 'organizer'`

You can update it from Supabase SQL editor. Example:

```sql
-- Replace <USER_UUID> and <EMAIL>
insert into public.profiles (id, email, role)
values ('<USER_UUID>', '<EMAIL>', 'organizer')
on conflict (id) do update set role = 'organizer';
```

You can get the user UUID from Supabase Dashboard → Authentication → Users.

---

## Typical Workflows

### Organizer workflow

1) Go to Dashboard → Events
2) Create an event, set it public if coaches should be able to apply
3) Review coach applications (Approvals)
4) Review entries for the event and export as needed

### Coach workflow

1) Create Dojos + Students
2) Browse public events
3) Apply to an event
4) Once approved, go to Entries and register students + submit entries

---

## Scripts

From `package.json`:

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — eslint

---

## Troubleshooting

### Supabase errors / empty data

- Confirm `.env.local` has the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Confirm you ran `supabase/migrations/db.sql` in the correct Supabase project.

### “Apply to event” errors

- Ensure the schema is applied (especially `profiles` and `event_applications`).
- Ensure RLS policies from `supabase/migrations/db.sql` are in place.

### `npm run dev` exits with code 1 but `npm run build` works

This usually indicates a dev-only runtime error. Quick checklist:

```bash
rm -rf .next
npm install
npm run dev
```

If it still fails, copy the full terminal output (stack trace) and we’ll pin the exact cause.

---

## Deployment Notes

- Set the same env vars in your host (Vercel/Render/etc):
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `NEXT_PUBLIC_BASE_URL=https://<your-domain>`
- Update Supabase Auth redirect URLs to include your production domain:
	- `https://<your-domain>/auth/callback`
