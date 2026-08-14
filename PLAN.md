# Implementation Plan

Ordered build steps. Each step is small enough to finish in one sitting and ends in
something deployed and working. Don't start a step before the one above it is live.

Stack and conventions: see `CLAUDE.md`.

---

## Phase 0 — Foundations

Goal: an empty but _deployed_ app with a database and a working pipeline. Do this before
writing any feature. A broken deploy discovered in month three is expensive; discovered on
day one it's nothing.

**0.1 Create the project** — ✅ done
`create-next-app` with TypeScript, Tailwind, App Router, ESLint. Add Prettier.
_Done when:_ `pnpm dev` serves a page locally.
Result: Next 16.3, React 19.2, Tailwind 4.3, TypeScript 5.9.

**0.2 Git + GitHub** — ⏳ local only
Init repo, push to a private GitHub repo.
Local repo is committed on `main`. GitHub push deferred by choice — needs `gh`
(`brew install gh`) or an empty repo created in the browser, then `git remote add origin`.

**0.3 Deploy to Vercel** — ⬜ blocked on 0.2
Import the GitHub repo. Accept defaults.
_Done when:_ the placeholder page is live on a `*.vercel.app` URL and a push to `main`
redeploys it automatically.

**0.4 Create two Supabase projects**
`polisite-dev` and `polisite-prod`. The free tier allows exactly two.
Put connection strings in `.env.local` (dev) and Vercel env vars (prod).
_Done when:_ `.env.example` is committed listing every variable, with no secrets.

**0.5 Wire up Drizzle**
Install Drizzle + `drizzle-kit`. Create `src/db/schema.ts` with one throwaway table,
`src/db/index.ts` with the client. Add the `db:generate` / `db:migrate` scripts.
_Done when:_ a migration file exists in git and applies cleanly to both databases.

**0.6 Add shadcn/ui and a layout** — ✅ done
Init shadcn. Build the app shell: header, nav, footer, dark mode.
_Done when:_ the deployed site looks intentional, even though it's empty.
Also delivered: Swedish/English switching (next-intl), since retrofitting it after
20 pages would have been far more expensive than doing it at 4.

**0.7 Add Vitest**
One trivial passing test, running in CI on push.

---

## Phase 1 — Auth and membership

The most security-sensitive phase. Get it right before building on it.

**1.1 Google OAuth via Supabase Auth**
Configure a Google OAuth client, set the redirect URLs, wire `@supabase/ssr`.
Sign-in and sign-out buttons.
_Done when:_ you can sign in with Google on the deployed site and the session survives a refresh.

**1.2 Members schema**
Tables: `members`, `roles`, `member_roles`. `members.status` is `active | pending | inactive`.
Link to the Supabase auth user id.
_Done when:_ migrations applied, your own member row exists as `active` with role `admin`.

**1.3 Session helpers**
`src/lib/auth.ts`: `getViewer()` returning the signed-in user _and_ their member row (or null).
_Done when:_ any server component can ask "who is this, and are they a member?"

**1.4 Permissions module**
`src/lib/permissions.ts` with the rules that exist so far. Route groups: `(public)` open,
`(member)` requires `status = 'active'`.
_Done when:_ a signed-in non-member is redirected away from `(member)` routes, and there's
a test proving it.

**1.5 Whitelist / invitation**
Admin adds an email to the whitelist; on first Google sign-in a matching email becomes an
active member. Everyone else lands as `pending`.
_Done when:_ a second person can sign in and get the right status without you touching the database.

---

## Phase 2 — Member profiles

**2.1 Profile fields**
Name, photo, bio, birthday, name day, member-since, title. Privacy defaults: birthdays and
name days are member-only; email is never displayed.

**2.2 Profile photo upload**
Supabase Storage. Resize on upload — the free tier gives 1 GB, and full-size phone photos
will eat it.

**2.3 Member directory + profile pages**
List of members, individual profile pages, respecting visibility rules.

_Phase done when:_ every member has filled in their own profile.

---

## Phase 3 — Events

The core of the app.

**3.1 Events schema**
`events` (title, description, starts/ends, location, category, visibility, creator) and
`event_attendees`. All timestamps `timestamptz`.

**3.2 Event CRUD**
Create, edit, delete. Zod validation at the server boundary. Any member may create.
Only the creator, a moderator or an admin may edit.

**3.3 Visibility filtering**
`public` / `members` / `private`, filtered in the query.
_Done when:_ a signed-out visitor sees public events only, and a test proves it.

**3.4 Event pages**
Detail page with description, location, attendees, and an optional Discord thread link.

**3.5 RSVP**
Interested / Going / Not going. Counts plus attendee names.
_Done when:_ members have RSVP'd to a real event.

**3.6 Backfill the event backlog**
Enter the real events from the spec so the site isn't empty when members arrive.

---

## Phase 4 — Calendar

**4.1 FullCalendar month view** reading from the events API.
**4.2 List/agenda view** for mobile.
**4.3 Category and visibility filters.**

The database stays the source of truth; FullCalendar only renders.

---

## Phase 5 — Public pages

**5.1 Home** — upcoming events and highlights.
**5.2 About** — what the association is and how membership works.
**5.3 Custom domain** — see the hosting notes below.

---

## Phase 6 — Wishlist _(last MVP step — drop it if you want to ship sooner)_

**6.1 `gift_items` schema** with an owner, visibility and `claimed_by`.
**6.2 Own wishlist** — add, edit, remove items.
**6.3 Viewing others' wishlists** per visibility settings.
**6.4 Claiming** — the owner sees _that_ an item is claimed, never _who_. The claimer's
identity is omitted at the query level.
_Done when:_ a test proves the owner's query cannot return `claimed_by`.

---

## MVP complete

Members, login, profiles, events, calendar, RSVP, wishlist, deployed on a real domain.
**Stop here and let people use it for a season** before building anything below.

---

## Later — only if the group asks for it

Ordered by likely value, not by effort:

- **Discord webhook** — new event posts to Discord. An afternoon's work.
- **Email reminders** (Resend + scheduled job) — needs per-member preferences.
- **Event photos** — start with a Google Photos album URL per event, not an importer.
- **Admin panel** — until then, use Supabase Studio to _view and nudge_ data (never to change schema).
- **Badges and titles** — data-driven, so new badges need no schema change.
- **History / archive pages.**
- **Community goals and fund progress.**
- **iCal/ICS export.**
- **Secret gift ideas** — the target must never receive the data. Build it only once the
  wishlist is genuinely used.

Explicitly not now: native mobile app, forum/chat, financial integrations, gamification.

---

## Open decisions

Resolve these when they start to matter, not before:

1. ~~**UI language**~~ — ✅ decided: both. next-intl with `/sv` and `/en` prefixes,
   Swedish as the default. Interface copy lives in `messages/*.json`.
   **User-created content (event titles, descriptions, bios) is not translated** — members
   write in whichever language they choose and everyone reads it as written. Dates and
   numbers still render per the reader's locale automatically. Anyone who genuinely needs a
   translation has Chrome's built-in one. No translation service, no duplicate columns.
2. **Domain name** — needed at step 5.3.
3. **Supabase free vs Pro ($25/mo)** — free projects pause after a week of inactivity, and
   have no automatic backups. Decide before handing the link to members. Either accept a
   daily keep-alive cron plus a `pg_dump` backup job, or pay.
4. **Do photos live in Supabase Storage or as Google Photos links?** Storage is 1 GB free.
5. **Official association events vs informal member activities** — one `events` table with a
   flag, or genuinely different things?
