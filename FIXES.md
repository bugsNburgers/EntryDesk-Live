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

- **3rd session:** Fixed Next.js prerender error by wrapping global provider usage in `Suspense`.
- **3rd session:** Fixed coach “Apply to event” 500 by ensuring a `profiles` row exists before inserting `event_applications`.
- **3rd session:** Improved coach name display (fallback to email/email prefix when `full_name` is missing).
- **3rd session:** Added “Approved coaches” list panel on event overview (not just the count).
- **3rd session:** Made dashboard/event metric cards clickable and deep-link to filtered pages.
- **3rd session:** Compacted organizer per-event Entries/Approvals pages by merging headers into the card UI.
- **3rd session:** Removed coach tabs and merged overview + entries + register into a single page with a register dialog.
- **3rd session:** Made organizer event list cards fully clickable (not only the “Manage” button).
- **3rd session:** Implemented consistent one-step back navigation (history back) across organizer + coach dashboard pages.

- **4th session:** Merged coach “Browse Events” into dashboard home and removed the separate nav section.
- **4th session:** Fixed “Approved” applications still showing “Request to Participate” (Apply button state).
- **4th session:** Moved the global back button into the sidebar to reduce page-header clutter.
- **4th session:** Added a mobile slide-out dashboard nav (hamburger + sheet) to match desktop sidebar.
- **4th session:** Removed Settings from both organizer + coach dashboard navigation.
- **4th session:** Improved light-mode separation (borders/shadows) consistently across dashboard pages.
- **4th session:** Fixed multiple “Parsing ecmascript source code failed” issues caused by malformed JSX.

- **5th session:** Implemented a truly global navigation loading overlay (any internal link click triggers loader instantly).
- **5th session:** Covered programmatic navigations (router.push/replace/back) so non-Link buttons also show a loader.
- **5th session:** Removed duplicate dashboard-only loader plumbing to avoid double overlays and keep behavior consistent.

- **6th session:** Enforced role-based access in dashboard pages and server actions (coach vs organizer).
- **6th session:** Hardened Supabase RLS policies and organizer view to prevent role escalation and cross-role access.

- **7th session:** Unified dashboard navigation loader (single “Changing stances…” overlay; removed per-page loaders).

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


---

# Session 3 — Log of Fixes, Additions & Modifications

This session focused on making the dashboard behave like a “real product”: reliable data flows (especially coach→event apply), clearer organizer vs coach meaning, clickable + consistent UI patterns, and navigation that behaves predictably.

Below is a detailed, chronological and technical log of what changed, why it was needed, and how it was implemented.

## 0) Goal / UX direction for Session 3

**Primary UX goals**
- Reduce “dead UI”: metric cards should be actionable and take you to the relevant filtered view.
- Remove redundant page headers / duplicated blocks (the “top 3 texts” issue).
- Keep organizer and coach UI consistent in density and component sizing.
- Fix coach application flow (coach applies to event) and make approvals/coach names display correctly.
- Fix back navigation: back should go one step back (history), not jump to a fixed list page.

**Data/logic goals**
- Prevent hard failures when creating rows that depend on `public.profiles`.
- Make coach identity display stable even when `profiles.full_name` is empty.
- Make “Approved coaches” (applications) clearly distinct from “Approved entries” (entries status).

---

## 1) Next.js build/runtime issue: `useSearchParams()` must be wrapped in Suspense (404 prerender)

**Symptom**
- Production build complained about `useSearchParams()` needing a Suspense boundary for `/_not-found` / `/404` prerender.

**Root cause**
- Some global client/provider code referenced `useSearchParams()` (directly or indirectly).
- Next.js requires Suspense boundaries around certain hooks during pre-rendering paths.

**Fix**
- Wrapped the app provider tree with `<Suspense>` in `src/app/layout.tsx`.

**Why this works**
- It satisfies Next’s requirement for suspenseful rendering paths without forcing every page to add its own boundary.

---

## 2) Coach “Apply to event” failing (POST 500 + “Error applying to event”)

**Symptom**
- Coaches clicking “Apply” saw 500 errors and an alert failure.
- The server-side action inserting into `event_applications` failed.

**Root cause**
- `event_applications.coach_id` references `public.profiles(id)`.
- For many users, there was no row in `public.profiles` yet (auth exists in `auth.users`, but the app identity exists in `public.profiles`).
- Without a profile row, inserts fail (FK) and/or RLS blocks follow-up queries.

**Fix (server action hardening)**
- Updated `src/app/dashboard/events-browser/actions/index.ts` to:
  1) Fetch the current user.
  2) Ensure a `profiles` row exists for `user.id` (create it if missing).
  3) Use an idempotent “already applied?” check via `.maybeSingle()`.
  4) Handle unique constraint races (`23505`) as “Already applied”.
  5) On profile creation, best-effort populate `profiles.full_name` from user metadata or email prefix.

**Fix (client refresh + UX)**
- Updated `src/components/events/apply-button.tsx` to:
  - call the server action
  - surface the returned message clearly
  - call `router.refresh()` to update the UI after apply succeeds

**Why this is correct**
- It prevents a hard dependency on “profiles must be pre-provisioned.”
- It makes the apply action safe under concurrency (two fast clicks / double submissions).
- It improves display data quality (names) without requiring an immediate DB trigger.

---

## 3) Organizer approvals: coach name not appearing

**Symptom**
- Organizer approvals list showed blank coach names.

**Root cause**
- `profiles.full_name` was empty for some coaches.
- Some UI assumed full_name always existed.

**Fix**
- Approvals UI now falls back in this order:
  1) `profiles.full_name`
  2) `profiles.email`
  3) email prefix
  4) `—`

**Where**
- Organizer approvals pages (global and per-event):
  - `src/app/dashboard/approvals/page.tsx`
  - `src/app/dashboard/events/[id]/approvals/page.tsx`

**Why**
- A display name should never be “missing”; fallback prevents confusing empty UI.

---

## 4) “Approved entries” confusion vs “Approved coaches”

**Symptom**
- User expected approved coaches to show in “Approved entries” or vice versa.

**Root cause (domain mismatch)**
- “Approved entries” refers to `entries.status = 'approved'`.
- “Approved coaches” refers to `event_applications.status = 'approved'`.
- These are different tables and workflows.

**Fix / Clarification added in UI**
- Event overview now shows an explicit “Approved Coaches” metric.
- Approvals pages emphasize that they are *coach approvals*, not entries approvals.

**Why**
- Prevents product confusion and makes metrics map directly to their table/state.

---

## 5) Deep-linking: dashboard metric cards behave like buttons

**Symptom**
- Dashboard stats looked clickable but didn’t navigate.
- User wanted “cards as buttons” to go to relevant pages.

**Fix**
- Updated dashboards to make metric cards link to appropriate routes and filtered views.
- Organizer event overview metrics link into the correct per-event entries/approvals pages with query params.

**Where**
- Organizer dashboard: `src/app/dashboard/page.tsx`
- Event overview: `src/app/dashboard/events/[id]/page.tsx`
- Coach dashboard: `src/components/coach/coach-overview.tsx` and `src/components/coach/coach-dashboard.tsx`

**Why**
- Metrics become navigation primitives: “see the number → click to see the list.”

---

## 6) Organizer per-event Entries/Approvals pages: redundant top blocks + inconsistent sizing

**Symptom**
- Entries/Approvals pages had separate header blocks, making one page feel “big” and the other “small.”

**Fix**
- Merged title/count/actions/filters into the Card header for both pages.
- Removed redundant top text blocks.

**Where**
- `src/app/dashboard/events/[id]/entries/page.tsx`
- `src/app/dashboard/events/[id]/approvals/page.tsx`

**Why**
- One consistent page pattern improves perceived quality and reduces vertical clutter.

---

## 7) Organizer event overview: show Approved Coaches list

**Symptom**
- Under “Approved Coaches” the metric existed, but user wanted names visible.

**Fix**
- Event overview now queries approved `event_applications` joined to `profiles` and renders a compact “Approved coaches” panel.

**Where**
- `src/app/dashboard/events/[id]/page.tsx`

**Why**
- A list is more useful than a count; names enable verification and reduce admin friction.

---

## 8) Coach event UI: removed tabs; merged overview/entries/register into one page

**Symptom**
- Tabs (“Overview / Entries / Register Athletes”) felt heavy and forced extra clicks.

**Fix**
- Refactored coach event view into a single-page layout:
  - Overview metrics always visible
  - Entries list always visible
  - Quick filter buttons (All/Drafts/Submitted/Approved)
  - “Register athletes” moved into a Dialog modal (faster flow)

**Where**
- `src/components/coach/coach-dashboard.tsx`
- `src/components/coach/coach-overview.tsx`
- `src/components/coach/coach-entries-list.tsx`

**Why**
- Fewer navigation affordances = fewer ways for users to get lost.
- Modal register flow keeps context (event) while completing the task.

---

## 9) Events list: make the entire event card clickable (not only “Manage”)

**Symptom**
- On organizer events list, only the “Manage” button navigated.

**Fix**
- Made the entire card clickable using a full-card overlay link.
- Kept “Manage” button above the overlay via z-index so it still works.

**Where**
- `src/app/dashboard/events/page.tsx`

**Why**
- More forgiving click target, faster navigation, and matches modern dashboard UX.

---

## 10) Back button behavior: must go one step back (history) everywhere

**Symptom**
- Back arrow on organizer event pages jumped directly to `/dashboard/events` instead of going back one step (e.g., Approved Coaches → Event dashboard).

**Root cause**
- Back controls were implemented as normal links to fixed routes, not history navigation.

**Fix (reusable component)**
- Added a reusable client component that uses `router.back()` with a fallback when there’s no history (opened in a new tab):
  - `src/components/app/history-back.tsx`

**Fix (made it consistent everywhere)**
- Added a single global back button to the dashboard shell so it appears on every dashboard page (organizer + coach).
- Removed page-specific back controls that could conflict or jump to fixed routes.
- Also updated login to use a one-step back with fallback to home.

**Where**
- Global dashboard back: `src/app/dashboard/layout.tsx`
- Removed per-event back (duplicate): `src/app/dashboard/events/[id]/layout.tsx`
- Removed coach local back (duplicate): `src/components/coach/coach-dashboard.tsx`
- Login back uses history: `src/app/login/page.tsx`

**Why**
- This matches user expectation for a “Back” affordance.
- It prevents accidental jumps to list pages when the user wanted to go back one screen.

---

## 11) Notes / Known state

- `npm run build` succeeds.
- If `npm run dev` still exits with code 1, the next step is to capture the full terminal output (stack trace / error message) so we can address the root cause. Build passing usually means the issue is dev-only (often environment, runtime fetch, or a route that only executes in dev).

---

# Session 4 — Dashboard UX / Navigation Parity (Desktop + Mobile) & Light-Mode Separation

This session focused on reducing dashboard clutter, making coach “event browsing” feel first-class, ensuring mobile navigation parity with the desktop sidebar, and making light mode visually readable (clear separation without harsh borders).

## 0) Goal / UX direction for Session 4

**Primary UX goals**
- Remove redundant navigation items and make the dashboard home more useful.
- Ensure mobile has a real “side panel” experience.
- Keep the back navigation available everywhere, but without consuming valuable content/header space.
- Improve light-mode depth/separation consistently across dashboard pages.

---

## 1) Coach event browsing: move “Browse Events” into dashboard home

**Symptom**
- “Browse Events” existed as a separate dashboard section/page/link, but the user wanted it inside the dashboard home.

**Fix**
- Added a “Browse Events” section to the coach dashboard home rendering public events.
- Removed the separate “Browse Events” nav entry so users don’t have two places for the same thing.

**Where**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/layout.tsx`

**Why**
- Home becomes the default “start here” surface for coaches.
- Fewer duplicate navigation targets reduces confusion.

---

## 2) Coach application UI: Approved/Pending/Rejected still showed “Request to Participate”

**Symptom**
- Even when an application was already approved, the UI still showed the action as if it wasn’t applied.

**Root cause**
- The caller was not providing the application `status` into the `ApplyButton`, so it rendered its default “apply” state.

**Fix**
- Build an `event_id -> status` map from `event_applications` and pass `status={status}` into `ApplyButton`.

**Where**
- `src/app/dashboard/page.tsx`

**Why**
- `ApplyButton` already supports status-driven rendering; the issue was the wrong prop/inputs at the call site.

---

## 3) Back button “takes too much space”: reduce clutter by moving it into the sidebar

**Symptom**
- The back button was taking too much vertical/header space and competing with page content.

**Fix**
- Kept the global history back behavior, but relocated the back control into the dashboard sidebar (desktop).
- Used a small gating/wrapper component so it renders consistently from the dashboard shell.

**Where**
- `src/app/dashboard/layout.tsx`
- `src/components/dashboard/dashboard-back-gate.tsx`
- `src/components/app/history-back.tsx`

**Why**
- The back action stays available “at any cost,” but does not inflate each page layout.

---

## 4) Settings removed from both organizer + coach navigation

**Symptom**
- Dashboard nav included Settings, but it wasn’t needed.

**Fix**
- Removed Settings UI from the dashboard sidebar/nav.

**Where**
- `src/app/dashboard/layout.tsx`

**Why**
- Reduces noise and keeps nav focused on core tasks.

---

## 5) Mobile dashboard had no side panel: add hamburger + slide-out nav (Sheet)

**Symptom**
- On mobile there was no functional equivalent to the desktop sidebar.

**Fix**
- Added a mobile top bar with a hamburger trigger.
- Implemented a slide-out left “Sheet” drawer and rendered the dashboard navigation inside it.

**Where**
- `src/app/dashboard/layout.tsx`
- `src/components/dashboard/mobile-nav.tsx`
- `src/components/ui/sheet.tsx`

**Why**
- Mobile users get the same navigation affordances as desktop, without compressing the UI into an always-visible sidebar.

---

## 6) Build error: “Parsing ecmascript source code failed” (malformed JSX)

**Symptom**
- Next.js dev/build failed with: `Parsing ecmascript source code failed`.

**Root cause**
- Malformed JSX (missing closing tags / incorrect nesting) introduced during iterative UI changes.

**Fix**
- Corrected JSX structure (balanced tags, fixed nesting) in the affected components/pages.

**Where**
- `src/app/dashboard/page.tsx`
- `src/app/login/page.tsx`
- `src/components/dashboard/mobile-nav.tsx`
- `src/components/dashboard/dashboard-back-gate.tsx`

**Why**
- These failures are parse-time errors; the only real fix is restoring valid JSX.

---

## 7) Light mode lacked separation/depth: apply consistent borders + shadows across dashboard

**Symptom**
- Dark mode looked fine, but in light mode cards and containers blended together.

**Root cause**
- Some components relied on theme tokens that were too subtle in light mode.

**Fix**
- Switched key dashboard wrappers/cards to explicit light/dark border utilities (e.g. `border-black/10` + `dark:border-white/10`).
- Added soft gradients + shadows to make card boundaries readable in light mode.

**Where**
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/events/page.tsx`
- `src/app/dashboard/students/page.tsx`
- `src/app/dashboard/approvals/page.tsx`
- `src/app/dashboard/entries/page.tsx`
- `src/app/dashboard/events-browser/page.tsx`
- `src/app/dashboard/dojos/page.tsx`

**Why**
- Improves readability and perceived quality without adding heavy/harsh borders.

---

# Session 5 — Global Loading Overlay “Everywhere”

This session focused specifically on ensuring the app shows an immediate loading overlay whenever a click results in navigation, including cases that were previously missed (non-sidebar links and programmatic `router.push/replace/back`).

## 0) Goal / UX direction for Session 5

**Primary UX goals**
- If a click causes a route change and the next screen is slow, show a loader instantly.
- Do not rely on every individual button/link remembering to manually trigger a loader.
- Avoid duplicate/stacked loaders (one from dashboard, one global).

---

## 1) Some links still felt “dead”: loader wasn’t guaranteed outside the dashboard sidebar

**Symptom**
- Many buttons/links across the app could navigate, but the loader didn’t always appear immediately.
- The delay felt like the click “didn’t register” for ~2–3 seconds.

**Root cause**
- Loader triggering was not guaranteed globally for all link clicks (it depended on specific components calling `beginNavigation`).

**Fix**
- Added a global click-capture handler inside the app navigation provider that:
  - detects same-origin `<a href>` clicks
  - ignores modified clicks (new tab, ctrl/cmd click), downloads, hash links, external links
  - starts the loader immediately before navigation begins
  - does nothing for same-route clicks
- Added an escape hatch: `data-no-global-loader` on links to opt out.

**Where**
- `src/components/app/navigation-provider.tsx`

**Why**
- This provides a single “at any cost” guarantee for link-driven navigation without needing to touch every page/component.

---

## 2) Non-Link buttons (router.push/replace) didn’t show a loader

**Symptom**
- Filters/pagination/select controls that use `router.push()` / `router.replace()` could still feel slow with no immediate feedback.

**Root cause**
- These navigations are not `<a>` clicks, so the global link-capture handler won’t fire.

**Fix**
- Updated key components that do programmatic navigation to call `beginNavigation()` right before route changes.

**Where**
- `src/components/ui/pagination-controls.tsx`
- `src/components/events/entry-filters.tsx`
- `src/components/entries/event-filter.tsx`
- `src/components/app/history-back.tsx`

**Why**
- Ensures route transitions initiated by controls (not links) still show the same immediate loading feedback.

---

## 3) Avoid duplicate overlays: dashboard-specific loader vs app-wide loader

**Symptom**
- With both a dashboard navigation provider and an app navigation provider, it’s easy to end up with two loaders competing or inconsistent behavior.

**Fix**
- Standardized on the app-wide navigation provider for loader behavior.
- Dashboard navigation links were aligned to use the same global provider.

**Where**
- `src/app/layout.tsx` (App-wide provider host)
- `src/app/dashboard/layout.tsx` (removed the dashboard-only loader wrapper)
- `src/components/dashboard/nav-link.tsx`

**Why**
- One source of truth for “loader while navigating” keeps UX consistent and avoids stacked overlays.

---

## Notes / Limitations

- This guarantees loaders for route changes (navigation).
- For slow server actions that do **not** change the URL (e.g. submit → `router.refresh()` on the same route), the correct pattern is still:
  - `PendingButton` / `useFormStatus` for form submissions
  - `NavigationOnPending` to trigger the global overlay during pending server actions

---

# Session 6 — Role-Based Access Control (RBAC) Hardening

This session focuses on fixing “coach sees organizer UI” access leaks and tightening data-layer enforcement so UI and DB permissions match.

## 1) Coach users could access organizer pages and actions

**Symptom**
- Coach accounts could open organizer routes (events, approvals, organizer event entries).
- Coach UI sometimes showed “Organiser” label, causing confusion.

**Root cause**
- Pages and server actions relied on auth presence, not role checks.
- The dashboard layout hardcoded the sidebar label.

**Fix**
- Added a centralized role guard helper (`requireRole`) used by server components and server actions.
- Enforced role checks on organizer-only pages/actions and coach-only pages/actions.
- Updated the sidebar role label to reflect the actual profile role.

**Why this is correct**
- Role gating in the server layer prevents accidental access regardless of client UI state.
- A single guard avoids duplicated role logic across routes.

## 2) RLS policies allowed cross-role access and role escalation

**Symptom**
- Users could potentially interact with tables based on `auth.uid()` only, without role verification.
- `profiles` updates could be abused to change roles if not constrained.

**Root cause**
- Several policies used only ownership checks without role constraints.
- `profiles` update policy did not lock down role changes.

**Fix**
- Added role checks to dojos, students, entries, event_applications, categories, event_days, and events policies.
- Locked `profiles` inserts to `role = 'coach'` and prevented self-role changes on updates.
- Hardened `organizer_entries_view` to require organizer/admin roles.

**Why this is correct**
- It blocks privilege escalation and ensures the DB enforces the same rules as the UI.
- The organizer view now mirrors organizer-only access expectations.

## 3) Update-only Supabase migration workflow

**Symptom**
- Re-running the full schema migration caused “already exists” errors.

**Root cause**
- The initial schema file is not idempotent; it cannot be re-run on an existing DB.

**Fix**
- Added an update-only migration (`supabase/migrations/migration.sql`) that drops/recreates policies and replaces the view.

**Why this is correct**
- Incremental migrations avoid destructive schema resets and are safe to re-run on existing databases.

**Where**
- `src/lib/auth/require-role.ts`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/events/page.tsx`
- `src/app/dashboard/approvals/page.tsx`
- `src/app/dashboard/events/[id]/layout.tsx`
- `src/app/dashboard/events/[id]/approvals/page.tsx`
- `src/app/dashboard/events/[id]/categories/page.tsx`
- `src/app/dashboard/events/[id]/entries/page.tsx`
- `src/app/dashboard/events/actions/index.ts`
- `src/app/dashboard/approvals/actions/index.ts`
- `src/app/dashboard/events/[id]/categories/actions/index.ts`
- `src/app/dashboard/events/[id]/entries/actions.ts`
- `src/app/dashboard/dojos/page.tsx`
- `src/app/dashboard/students/page.tsx`
- `src/app/dashboard/entries/page.tsx`
- `src/app/dashboard/entries/[eventId]/page.tsx`
- `src/app/dashboard/events-browser/page.tsx`
- `src/app/dashboard/entries/actions/index.ts`
- `src/app/dashboard/dojos/actions.ts`
- `src/app/dashboard/students/actions/index.ts`
- `src/app/dashboard/events-browser/actions/index.ts`
- `supabase/migrations/migration.sql`

---

# Session 7 — Dashboard Loader Unification (Single Loader)

This session focuses on fixing the “two different loading pages” that showed up when switching between dashboard pages in production.

## 1) Dashboard navigation showed two different loaders (prod only / much more visible in prod)

**Symptom**
- When switching between dashboard pages, the user would see the global overlay loader ("Changing stances...") and then a second full-page loader like "Loading dojos..." / "Loading students...".
- This was much more noticeable in production because navigation/data fetching takes longer, so suspense fallbacks render long enough to see.

**Root cause**
- Two loader systems were active inside `/dashboard`:
  - A client-side overlay loader ("Changing stances...") triggered on dashboard navigation.
  - Multiple route-level `loading.tsx` files under `src/app/dashboard/**/loading.tsx` that render page-specific loaders (different titles).
- When a dashboard route suspended during navigation, Next.js rendered the route-level `loading.tsx`, producing a second loader screen with different text.

**Fix**
- Standardized dashboard UX to a single loader during navigation:
  - Keep the "Changing stances..." overlay as the one loader the user sees during dashboard switches.
  - Disable the dashboard route-level loading screens by making dashboard `loading.tsx` files return `null`.

**Why this is correct**
- It guarantees one consistent loader design and message during dashboard-to-dashboard transitions.
- It avoids the perception of multiple "pages" loading in sequence.
- It keeps login/landing/non-dashboard behavior unchanged.

**Where**
- `src/app/dashboard/loading.tsx`
- `src/app/dashboard/approvals/loading.tsx`
- `src/app/dashboard/dojos/loading.tsx`
- `src/app/dashboard/entries/loading.tsx`
- `src/app/dashboard/entries/[eventId]/loading.tsx`
- `src/app/dashboard/events/loading.tsx`
- `src/app/dashboard/events/[id]/loading.tsx`
- `src/app/dashboard/events/[id]/approvals/loading.tsx`
- `src/app/dashboard/events/[id]/categories/loading.tsx`
- `src/app/dashboard/events/[id]/entries/loading.tsx`
- `src/app/dashboard/events-browser/loading.tsx`
- `src/app/dashboard/items/loading.tsx`
- `src/app/dashboard/students/loading.tsx`