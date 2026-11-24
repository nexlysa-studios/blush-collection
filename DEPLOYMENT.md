# Deploying Jules For Her to Netlify

Netlify hosts the React frontend only. The FastAPI backend + MongoDB must run on a server host (e.g. Render, Railway) — or keep using the current Emergent backend URL.

## Netlify settings
- Config is in `/netlify.toml` (base `frontend`, command `yarn build`, publish `build`, SPA redirect).
- **Required environment variable** (Site configuration → Environment variables):
  - `REACT_APP_BACKEND_URL` = your backend URL, no trailing slash (e.g. `https://blush-collection-1.preview.emergentagent.com`)
- After adding/changing it: Deploys → Trigger deploy → **Clear cache and deploy site** (CRA bakes env vars in at build time).

## Backend on Render (optional)
- Root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Env vars: `MONGO_URL` (MongoDB Atlas), `DB_NAME`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `WHATSAPP_NUMBER`, `CORS_ORIGINS=*`
