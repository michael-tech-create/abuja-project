# Deploy AbujaRentals on Vercel (production checklist)

## 1. Push code to GitHub

```bash
git add .
git commit -m "Prepare production deploy"
git push origin main
```

## 2. Vercel project settings

1. Go to [vercel.com](https://vercel.com) → your project (or **Add New** → import `abuja-project`).
2. Framework: **Next.js** (auto-detected).
3. Root directory: project root (default).

## 3. Environment variables (Vercel → Settings → Environment Variables)

Add these for **Production** (and Preview if you want):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_REF.supabase.co` (no `/rest/v1/`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable/`sb_pub…` or legacy `eyJ…` anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | secret/`sb_sec…` or legacy service_role key |
| `NEXT_PUBLIC_SITE_URL` | `https://YOUR-APP.vercel.app` (your real Vercel URL, https, no trailing slash) |

Then **Redeploy** (Deployments → … → Redeploy) so env vars apply.

## 4. Supabase Auth URLs (required for login/signup on Vercel)

Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `https://YOUR-APP.vercel.app`
- **Redirect URLs** (add all):
  - `https://YOUR-APP.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (keep for local)

## 5. Email confirmation (recommended for launch testing)

If you hit `email rate limit exceeded`:

- Auth → Providers → Email → turn **off** “Confirm email” while testing  
  **or** configure custom SMTP under Project Settings → Auth.

## 6. Database

Schema must already be applied (you ran `scripts/INSTALL.sql`).  
If a new environment uses a fresh Supabase project, run `INSTALL.sql` again there.

## 7. Smoke test on production

1. Open `https://YOUR-APP.vercel.app`
2. Sign up / sign in
3. Complete onboarding
4. Landlord: `/dashboard/kyc` → upload docs
5. Admin: `/admin/kyc` → approve
6. Publish listing → appears on `/browse`
7. Tenant: message landlord from a listing

## 8. Extra SQL (likes already exist; reviews + NIN columns)

Run in SQL Editor if not applied yet:

`scripts/STEP6-reviews-nin.sql`

## 9. Dojah NIN auto-KYC (Vercel env)

| Name | Value |
|------|--------|
| `DOJAH_APP_ID` | from dojah.io |
| `DOJAH_SECRET_KEY` | from dojah.io |

Without these keys, valid 11-digit NINs auto-verify in **mock mode**.

## 10. Promote an admin (SQL Editor)

```sql
update public.profiles
set role = 'admin'
where email = 'your@email.com';
```

Log out and log back in on the Vercel site.
