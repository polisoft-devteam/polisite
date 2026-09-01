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

## Deploying

Vercel builds from the repo; the parts it cannot work out on its own:

1. **Set every variable in `.env.example`** in the Vercel project. `CRON_SECRET` is not
   optional: `/api/cron/reminders` refuses to run at all without it rather than running
   unprotected, so reminders would silently never send.
2. **Apply migrations against production**, `pnpm db:migrate` with `DATABASE_URL` pointing
   there. Never through the Supabase dashboard. Read the SQL first if any are unapplied.
3. **Promote yourself**: `pnpm member <your email> --status active --role admin`. First
   sign-in only creates a guest, and a site with no admin has nobody who can let anyone in.
4. **Check the cron is registered** in Vercel after the first deploy. It comes from
   `vercel.json`, one run a day, which is all the Hobby plan allows: reminders go out in a
   single morning sweep rather than at an exact hour before the event. That file takes no
   comments and Vercel rejects any key it does not recognise, so the reasoning lives here.

Creating the events that are already planned, without waking Discord: untick **Announce on
Discord** _and_ leave the reminders unticked. Every Discord post mentions the member role,
reminders included, so an event created quietly but with a reminder set still pings the
role when the daily sweep reaches it.

## Still to do

- **The timeline names no real years.** It is admin only and badged as unfinished, so it
  ships without showing anyone a half-written page. Drop the `isAdmin` check in the About
  page when it is ready.

## Where things are

- `CLAUDE.md` — conventions, domain rules, and what to use instead of what. Read this first.
- `/design` — every UI component in every state, for judging visual changes.
