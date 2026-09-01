# Polisite

Community site for Poli, featuring events and soon much more!

## Stack

|           |                                                           |
| --------- | --------------------------------------------------------- |
| Framework | Next.js (App Router, React Server Components), TypeScript |
| Database  | PostgreSQL on Supabase, via Drizzle ORM                   |
| Auth      | Supabase Auth — Google sign-in only                       |
| Files     | Supabase Storage, resized with sharp on upload            |
| Styling   | Tailwind CSS + shadcn/ui, Bootstrap Icons                 |
| Languages | Swedish and English (next-intl)                           |
| Tests     | Vitest                                                    |
| Hosting   | Vercel                                                    |

## Running it

```bash
git clone <repo-url> && cd polisite
pnpm install
cp .env.example .env.local     # then fill in the values / ask @VictorPersson
pnpm db:migrate                # apply migrations to the database
pnpm dev                       # http://localhost:3210
```

To use the site as a member, sign in with Google once, then:

```bash
pnpm member you@example.com --status active --role admin
```

## Commands

### General

```bash
pnpm dev            # dev server on :3210
pnpm build          # production build — run before pushing
pnpm lint           # ESLint + tsc
pnpm test           # Vitest
pnpm format         # Prettier
```

### DB

```bash
pnpm db:generate    # create a migration after editing src/db/schema.ts
pnpm db:migrate     # apply migrations
pnpm db:studio      # browse the data
```

### Admin

```bash
pnpm member <email> --status active --role admin   # promote someone
pnpm member:reset <email>                          # wipe someone, for testing sign-up
pnpm events:seed                                   # two example events, no Discord post
pnpm discord:test                                  # check the webhook works
pnpm storage:setup                                 # create the storage buckets
pnpm images:optimize                               # resize anything in public/images
```

## Before release

Things that must not ship as they are:

- **`About.membershipBody` is still placeholder text**, in both languages. The history
  above it is written; how to join is not.
- **The timeline still needs its real entries.** The six `About.timeline` steps read as
  prose but none of them names an actual year or event.
- **The English About page is a translation of Swedish in-jokes**, nicknames included. If
  it should be Swedish only, like the founder's letter, that is a decision to make rather
  than a wording to fix.
- **`ALWAYS_SHOW_WELCOME_LETTER` in `src/components/MembershipPrompt.tsx` is `true`**, so
  the founder's letter reopens on every page load while it is being written. Set it back to
  `false` and it returns to appearing once, to a signed-in guest who has not answered.

## Where things are

- `CLAUDE.md` — conventions, domain rules, and what to use instead of what. Read this first.
- `/design` — every UI component in every state, for judging visual changes.
