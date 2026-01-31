# EntryDesk – Fixes & Root Causes 

This doc captures the main issues encountered while setting up/running the app locally, what was changed, and why.

## Session Summary (one-liners)

- **1st session:** Fixed Supabase migration ownership error (`auth.users` ownership/RLS).
- **1st session:** Consolidated DB schema into a single migration file.
- **1st session:** Fixed auth UX (landing shows Dashboard CTA; `/login` redirects when already logged in).
- **1st session:** Migrated Next.js `middleware.ts` → `proxy.ts` to remove deprecation warning.
- **1st session:** Repo hygiene: added `.env.example`, updated `.gitignore`, documented fixes.

- **2nd session:** Added instant navigation loader overlay for dashboard + app routes.
- **2nd session:** Added determinate progress behavior during route transitions.
- **2nd session:** Prevented same-route clicks from causing slow “reload-like” navigation.
- **2nd session:** Removed/disabled the awkward partial (right-side) loader so behavior is consistent.
- **2nd session:** Improved auth feedback + navigation (login/logout messaging, login page back-to-home links).
- **2nd session:** Clarified role management by populating `public.profiles` for coach/organizer roles.

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

---

# Second Session 

This section captures the second round of issues and UX improvements around navigation/loading, auth feedback, and role management.

## 1) Dashboard navigation felt “unresponsive” / loader appeared late

**Symptom**
- Clicking dashboard sidebar links sometimes showed no feedback for a moment.
- Then a loader would appear only briefly (felt useless).

**Root cause**
- Next.js App Router `loading.tsx` only renders once the new route actually suspends/streams.
- Fast routes may not show a loader at all; slower routes may show it late.

**Fix / Addition**
- Added an immediate client-side navigation overlay that starts on click.
- Added a determinate progress bar that ramps up while navigation is in-flight and completes when the route changes.

**Why this is correct**
- This provides instant feedback (click → loader) instead of waiting for suspense boundaries.
- It avoids adding heavy “real network progress” tracking that could slow the app.

## 2) Clicking the same section caused “reloading” / slow refresh

**Symptom**
- Clicking “My Entries” while already on “My Entries” triggered a slow transition.

**Root cause**
- The click handler still allowed “navigate to the same URL”, which can cause unnecessary route work.

**Fix**
- Updated the dashboard nav link wrapper to treat same-path clicks as a no-op.

## 3) Two loaders showed (full overlay + partial right-side loader)

**Symptom**
- After the full-page overlay, a second loader appeared inside the dashboard content area (only on the right side), which looked odd.

**Root cause**
- Route-level `loading.tsx` inside `/dashboard` was rendering in the `children` area after the overlay.

**Fix**
- Disabled the dashboard segment `loading.tsx` (so the overlay is the main navigation feedback).

## 4) Progress bar looked “static” during login/register/sign out

**Symptom**
- Auth actions (login/register/logout) didn’t show the progress animation.

**Root cause**
- The “navigation overlay” logic initially only existed in the dashboard shell.
- Some auth redirects only changed query params (e.g. `/login?message=...`), which can prevent a pathname-only detector from closing the overlay.

**Fix / Addition**
- Added an app-wide navigation provider so the overlay/progress can be shown outside the dashboard too.
- Updated the “route changed” detection to consider `pathname + searchParams`, not just `pathname`.
- Kept the same loader design and changed only the text for auth actions:
  - Login/Register: “Please wait while we log you in”
  - Sign out: “Please wait while we log you out”

## 5) Login page had no way back to the hero page

**Symptom**
- From `/login`, there wasn’t an obvious way to return to the landing page.

**Fix / Addition**
- Made the “EntryDesk” title link back to `/`.
- Added an explicit “Back to Home” button/link.

## 6) Supabase roles/coaches not visible in `public.profiles` (Not fixed, rn just hardcoded into db file)

**Symptom**
- Supabase Auth → Users showed accounts, but `public.profiles` was empty.
- Roles (coach/organizer) couldn’t be managed via the `profiles` table because there were no rows.

**Root cause**
- Auth works independently using `auth.users`.
- The app role system depends on `public.profiles`, but there was no automatic mechanism (trigger or app code) inserting a profile row for each user.

**Fix / Workaround used**
- Manually inserted/updated the missing `profiles` row using the user’s Auth UID and email.

**Why this matters**
- Without a `profiles` row, the app can authenticate users, but cannot reliably assign/lookup roles.
- Long-term, this should be automated (e.g. a DB trigger on `auth.users` insert) to prevent `profiles` from staying empty.
