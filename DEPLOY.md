# Going live

One-off setup. After this, pushing to `main` redeploys automatically.
Do it in order — later steps need earlier values.

## 1. Supabase — new project

- [ ] New project `polisite-prod`, region Stockholm or Frankfurt
- [ ] Save the database password when shown (only shown once)

## 2. Supabase — copy 5 values

Settings → Database → Connection string, and Settings → API Keys.

- [ ] `DATABASE_URL` — Transaction pooler, port **6543**
- [ ] `DIRECT_URL` — Session pooler, port **5432**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — `sb_publishable_…`
- [ ] `SUPABASE_SECRET_KEY` — `sb_secret_…`

⚠️ Both connection strings must use the **pooler**. The direct host is IPv6-only and won't connect.

## 3. Supabase — Google login

- [ ] Auth → Providers → Google → enable
- [ ] Paste client ID + secret (same as dev is fine)
- [ ] Copy the callback URL it shows

## 4. Google Cloud Console

Credentials → your OAuth client.

- [ ] Redirect URIs: add the callback URL from step 3
- [ ] JavaScript origins: add `https://<your-app>.vercel.app`

⚠️ Must match exactly — no trailing slash. Otherwise `redirect_uri_mismatch`.

## 5. Vercel

- [ ] Import the repo, preset Next.js, accept defaults
- [ ] Add the 5 values from step 2 (scope: Production)
- [ ] Add the 4 Discord values from your `.env.local`
- [ ] New `CRON_SECRET`: `openssl rand -hex 32` (fresh one, not dev's)
- [ ] Skip `NEXT_PUBLIC_SITE_URL` for now
- [ ] Deploy

## 6. Set up the prod database

Swap the 5 prod values into `.env.local` temporarily, then:

- [ ] `pnpm db:migrate` — creates tables, enables RLS
- [ ] `pnpm storage:setup` — creates the image buckets
- [ ] Swap your dev values back

## 7. Make yourself a member

- [ ] Sign in with Google on the live site first
- [ ] Then (with prod values): `pnpm member <email> --status active --role admin`

Signing in only makes you a Google user. Until this runs you'll see the guest view — that's correct, not a bug.

## 8. Check before sharing

- [ ] Sign in works
- [ ] `/sv` and `/en` both load
- [ ] Create an event **without** the Discord tick — it appears
- [ ] Create one **with** it — message + link arrive
- [ ] Upload a profile picture — it renders
- [ ] Open it on your phone
- [ ] Supabase → Security Advisor → no `rls_disabled_in_public`
- [ ] Database is not public — the check below must return `[]`

```bash
curl "https://<prod-ref>.supabase.co/rest/v1/members?select=*" -H "apikey: <publishable key>"
```

Rows coming back = RLS is off. Stop and fix before anyone signs in.

## 9. After

- [ ] Confirm the GitHub repo is Private
- [ ] Custom domain → then set `NEXT_PUBLIC_SITE_URL` and redeploy
- [ ] Fill in `ASSOCIATION_CONTACT_EMAIL` in `src/lib/association.ts` (still `TODO@example.com`, shows on the privacy page)

---

## If it breaks

| Symptom                             | Cause                                         |
| ----------------------------------- | --------------------------------------------- |
| `redirect_uri_mismatch`             | Step 4 — URI doesn't match exactly            |
| Connection times out                | Used the direct host, not the pooler          |
| `prepared statement already exists` | `prepare: false` missing in `src/db/index.ts` |
| Migrations fail, app runs           | `DIRECT_URL` wrong — needs port 5432          |
| No Discord messages                 | Webhook set in `.env.local` but not in Vercel |
