# EntryDesk – Fixes & Root Causes (Jan 31, 2026)

This doc captures the main issues encountered while setting up/running the app locally, what was changed, and why.

## 1) Supabase migration error: `must be owner of table users`

**Symptom**
- Running the SQL migrations failed with: `ERROR: 42501: must be owner of table users`

**Root cause**
- The migration attempted to run:
  - `alter table auth.users enable row level security;`
- `auth.users` is a Supabase-managed table owned by an internal database role (the `auth` schema owner), not by your migration role. So Postgres blocks that statement.

**Fix**
- Removed that statement from the initial schema migration.

**Why this is correct**
- You generally shouldn’t modify Supabase’s internal `auth.*` tables in your app migrations.
- Your app’s security is implemented via RLS policies on your own tables (e.g. `profiles`, `events`, `entries`, etc.).

## 2) “Merge the db files” (multiple migration files)

**Symptom**
- DB logic was split across multiple migration files (schema + view creation).

**Fix**
- Moved the `organizer_entries_view` creation into the initial schema migration.
- Turned the later view migration into a **no-op** to prevent duplicate definition errors.

**Why**
- Keeping the foundational schema and required views together reduces setup friction when bootstrapping a fresh database.

## 3) Login appears to “work” but you stay on the landing page

**Symptom**
- After logging in, you could manually visit `/dashboard` and it worked, but the UI didn’t guide you there.
- Landing page always showed “Login / Get Started” even when already logged in.

**Root cause**
- The landing page didn’t check `supabase.auth.getUser()` to render a logged-in state.
- The login page didn’t redirect already-authenticated users away from `/login`.

**Fix**
- Landing page now detects the current user and shows:
  - a **Dashboard** nav button
  - a **Go to Dashboard** hero CTA
- Login page now checks for an existing session and redirects authenticated users to `/dashboard`.

**Why**
- This aligns UI state with auth state so users don’t get “stuck” on marketing/landing views after a successful sign-in.

## 4) Next.js warning: `"middleware" file convention is deprecated. Please use "proxy" instead.`

**Symptom**
- `npm run dev` warns that `middleware.ts` is deprecated and should be renamed to `proxy.ts`.

**Root cause**
- Newer Next.js versions are renaming the file convention from `middleware` to `proxy`.

**Fix**
- Created `src/proxy.ts` with the same session-refresh logic.
- Removed `src/middleware.ts` so Next.js stops warning.

**Why**
- The warning is triggered by the presence of the `middleware` file.
- Using `proxy` follows the newer convention and avoids future breakage.

## Verification Checklist

- Start dev server: `npm run dev`
- Visit `/`:
  - Logged out: see Login / Get Started
  - Logged in: see Dashboard / Go to Dashboard
- Visit `/login` while already logged in:
  - you should be redirected to `/dashboard`
- Re-run migrations:
  - should not fail with `must be owner of table users`

## Notes

- If Google OAuth is used, make sure `NEXT_PUBLIC_BASE_URL` matches your local site (e.g. `http://localhost:3000`) and also matches the redirect URL configured in Supabase Auth providers.
