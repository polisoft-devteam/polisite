# Polisite

@AGENTS.md

Private web app for a small Swedish community association (~10 members, may grow).

It complements Discord rather than replacing it. Discord stays the conversation layer.
This app is the structured layer: members, profiles, events, attendance, history and wishlists.

## Priorities

When a decision is unclear, resolve it in this order:

1. **Maintainable by one person with AI assistance.** The repo must be readable end to end.
2. **Boring and conventional over clever.** Predictable structure beats elegant abstraction.
3. **Working over complete.** Ship the small thing; the group is 10 people.

## Stack

| Concern      | Choice                                                           |
| ------------ | ---------------------------------------------------------------- |
| Language     | TypeScript (strict)                                              |
| Framework    | Next.js, App Router, React Server Components                     |
| Database     | PostgreSQL, hosted on Supabase                                   |
| DB access    | Drizzle ORM                                                      |
| Auth         | Supabase Auth, Google OAuth only                                 |
| File storage | Supabase Storage                                                 |
| Styling      | Tailwind CSS + shadcn/ui                                         |
| Forms        | React Hook Form + Zod                                            |
| Calendar     | FullCalendar (presentation only — the DB is the source of truth) |
| Tests        | Vitest                                                           |
| Hosting      | Vercel                                                           |

Supabase does exactly three jobs: **managed Postgres, Google login, file storage.**
It is not the schema tool and not the permission system.

## Structure

```
messages/                   Interface copy: sv.json, en.json
src/
  app/
    [locale]/               Every route lives under /sv or /en
      (public)/             Guest-visible pages
      (member)/             Requires active membership
    api/
  components/               Our components — PascalCase files
    ui/                     shadcn primitives — kebab-case, do not hand-edit
  i18n/
    routing.ts              Supported languages and the default
    navigation.ts           Language-aware Link / useRouter / usePathname
    request.ts              Loads the right message file per request
  proxy.ts                  Language prefix routing (was "middleware" pre-Next 16)
  db/
    schema.ts               Drizzle schema — the single schema definition
    migrations/             Generated SQL, committed
    index.ts                DB client
  lib/
    auth.ts                 Session + current member helpers
    permissions.ts          ALL access rules live here
  features/
    events/                 queries.ts, actions.ts, schemas.ts
    members/
    wishlist/
```

**The rule that keeps this readable:** only `features/*/queries.ts` may import from `src/db`.
Pages and components call feature functions, never the database.

## Core domain rules

These are the rules that actually matter. Break them and the app leaks private data.

**Membership is not authentication. Google authenticates; we authorize.**
Anyone with a Google account may sign in — there is no invitation step. First sign-in
creates a `members` row with `status = 'guest'`, which sees exactly what a signed-out
visitor sees. Access is granted afterwards by an admin promoting them to `active`
(`pnpm member <email> --status active`). Never gate on "is signed in"; gate on
`status = 'active'`.

**Roles:** `member`, `moderator`, `board`, `treasurer`, `admin`. Stored as rows, not enum
columns on the member — a member can hold several.

**Event visibility:** `public` (guests included), `members` (active members), `private`
(invited only). Visibility is filtered in the query, never by hiding UI.

**Wishlist claiming:** the owner may see _that_ an item is claimed. The owner must never
see _who_ claimed it. The claimer's identity is omitted at the query level when the
viewer is the owner — not filtered in the component.

**Secret gift ideas (later phase):** the target member must never receive the data.
Excluded in the query, not in rendering.

## Conventions

- **Permissions live in `src/lib/permissions.ts`** as plain functions (`canEditEvent(viewer, event)`).
  One place, one language. If you can't answer "who can see this?" by reading that file, it's wrong.
- **Schema changes go through Drizzle migrations**, committed to git, applied by command.
- **Server Components by default.** Add `"use client"` only for genuine interactivity.
- **Validate input with Zod at the server boundary**, including Server Actions. Client
  validation is a convenience, never a control.
- **Timestamps are `timestamptz`, stored UTC, displayed in `Europe/Stockholm`.**
  At least one member is in Denmark — never store naive local time.
- **Test the rules, not the UI.** Cover permissions, visibility filtering and wishlist
  claiming. Skip snapshot tests.
- Prefer self-explanatory code. Comment _why_, not _what_.

### Naming and comments

- **Names are descriptive, even when that makes them long.** `mainNavigationLinks`, not
  `nav`. `translateTheme`, not `t`. `isSwitchingLanguage`, not `pending`. If you have to
  read the surrounding lines to work out what a name refers to, it's too short.
- **Reach for a better name before reaching for a comment.** A name is read everywhere the
  thing is used; a comment is read once, next to the definition, and then goes stale.
- **Comments are one line and to the point.** If something needs a paragraph to explain,
  the code or the name is wrong — fix that instead. The exceptions are a non-obvious
  constraint ("the pooler drops prepared statements"), a rule that would otherwise look
  arbitrary, and a note about why the obvious approach was _not_ taken.
- **Our component files are `PascalCase.tsx`** and match the component inside
  (`SiteHeader.tsx` exports `SiteHeader`). Non-component modules stay lowercase
  (`navigation-links.ts`, `permissions.ts`).
- `src/components/ui/` is the exception — the shadcn CLI writes kebab-case there and
  regenerates those files. Leave them alone.

### Languages

- Two languages, Swedish default: `/sv` and `/en`. Adding one means an entry in
  `i18n/routing.ts` plus a file in `messages/`.
- **All interface copy lives in `messages/*.json`.** Never hardcode a user-visible string
  in a component, including the About page prose.
- **Import `Link`, `useRouter` and `usePathname` from `@/i18n/navigation`**, not from
  `next/link` or `next/navigation` — otherwise links lose the language prefix.
- **User-created content is never translated.** Event titles, descriptions and bios are
  stored and shown exactly as written. Dates and numbers still format per the reader's
  locale automatically. No translation service, no duplicate columns.
- **Every string in `messages/*.json` is shipped to the browser**, because
  `NextIntlClientProvider` serialises them for client components. They are UI copy, so
  that's fine — but never put anything secret in a message file, and don't be surprised
  to find a label in the page source that isn't rendered anywhere.

## Commands

```bash
pnpm dev              # local dev server
pnpm build            # production build (run before pushing)
pnpm db:generate      # generate a migration after editing schema.ts
pnpm db:migrate       # apply migrations
pnpm db:studio        # inspect local data
pnpm member <email> --status active --role admin   # promote a guest
pnpm test             # Vitest
pnpm lint             # ESLint + tsc
pnpm format           # Prettier
```

`.npmrc` sets `resolution-mode=highest`. Without it, pnpm 8.6 installs the _lowest_
version matching each range — which silently pins ancient TypeScript. Don't remove it.

## Never

- **Never define or alter schema in the Supabase dashboard.** Migrations only. Anything
  defined by clicking is invisible to the repo and to whoever maintains this next.
- **Never use Row Level Security.** Permissions belong in `permissions.ts`. Splitting them
  across SQL policies and TypeScript means neither can be read on its own.
- **Never import `src/db` outside `features/*/queries.ts`.**
- **Never put authorization in `proxy.ts`.** It handles the language prefix and nothing
  else. Next's own docs say proxy is not a session or authorization solution — membership
  is checked server-side in layouts and queries.
- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.** Server-side only.
- **Never trust membership status sent from the client.** Always re-read it server-side.
