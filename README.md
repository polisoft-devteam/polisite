# Polisite

Private site for Poli, a small Swedish association. Members, profiles, events, a calendar,
date polls and Discord notifications. Discord stays the chat; this is the structured layer.

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

Needs Node 22+, pnpm, and access to the Supabase project.

```bash
git clone <repo-url> && cd polisite
pnpm install
cp .env.example .env.local     # then fill in the values — see the comments in the file
pnpm db:migrate                # apply migrations to the database
pnpm dev                       # http://localhost:3210
```

To use the site as a member, sign in with Google once, then:

```bash
pnpm member you@example.com --status active --role admin
```

## Commands

```bash
pnpm dev            # dev server on :3210
pnpm build          # production build — run before pushing
pnpm lint           # ESLint + tsc
pnpm test           # Vitest
pnpm format         # Prettier

pnpm db:generate    # create a migration after editing src/db/schema.ts
pnpm db:migrate     # apply migrations
pnpm db:studio      # browse the data

pnpm member <email> --status active --role admin   # promote someone
pnpm member:reset <email>                          # wipe someone, for testing sign-up
pnpm events:seed                                   # two example events, no Discord post
pnpm discord:test                                  # check the webhook works
pnpm storage:setup                                 # create the storage buckets
pnpm images:optimize                               # resize anything in public/images
```

## Where things are

- `CLAUDE.md` — conventions, domain rules, and what to use instead of what. Read this first.
- `PLAN.md` — build order and what's left.
- `/design` — every UI component in every state, for judging visual changes.
