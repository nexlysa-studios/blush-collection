# Hosting Jules For Her: Netlify + Render + Supabase

- **Netlify** shows the website (frontend)
- **Render** runs the small backend server (`/backend`)
- **Supabase** stores the data (products, orders, customers, FAQs, settings)

The backend uses Supabase whenever `DATABASE_URL` is set, and MongoDB otherwise.

## 1. Create the Supabase database
1. Sign up at https://supabase.com → **New project**. Choose a region close to South Africa (e.g. `eu-west` / London) and save the database password.
2. Open your project → **Connect** (top bar) → **Session pooler** → copy the connection string. It looks like
   `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres`
3. Replace `[YOUR-PASSWORD]` with your database password. This is your `DATABASE_URL`.

Tables are created automatically on first start. To copy your current shop data across, run
`DATABASE_URL="<your url>" python scripts/migrate_to_supabase.py` (this replaces whatever is already in Supabase).

## 2. Put the backend on Render
1. Push this repo to GitHub.
2. https://render.com → **New → Blueprint** → choose the repo. Render reads `render.yaml`.
3. When asked, fill in:
   - `DATABASE_URL` → the Supabase string from step 1
   - `ADMIN_PASSWORD` → your admin password
4. Deploy. Check `https://<your-service>.onrender.com/api/health` shows `{"status":"ok"...}`.

The free Render plan sleeps after 15 minutes idle, so the first visit afterwards takes ~30–50 seconds. A paid instance avoids this.

## 3. Point Netlify at Render
1. Netlify → **Site configuration → Environment variables** → set
   `REACT_APP_BACKEND_URL` = `https://<your-service>.onrender.com` (no trailing slash)
2. **Deploys → Trigger deploy → Clear cache and deploy site**.

Netlify build settings come from `netlify.toml` (base `frontend`, command `yarn build`, publish `build`).
