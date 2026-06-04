# Install + Run (Localhost)

pnpm workspace at repo root; the Vite + React app lives in `src/frontend`.

## Production (Company server)

Goal: serve the built site + `/api/*` from the same domain.

1) Install deps and build the frontend:

```bash
pnpm install
pnpm optimize:assets   # once after adding/changing images in public/ (generates WebP + manifest)
pnpm --filter @caffeine/template-frontend build
```

2) Create a `.env` on the server (do not commit it). Start from `.env.example` and set the SMTP password.

3) Start the Node server (serves `src/frontend/dist` and the mail API on `PORT`, default `8788`):

```bash
pnpm start
```

4) Put Nginx (or your web server) in front of it for HTTPS and your domain. Minimal Nginx example:

```nginx
server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:8788;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

Health check: `GET /api/health` should return `{ "ok": true, "platform": "node", "smtpConfigured": true }`.
If `smtpConfigured` is `false`, the contact and careers forms will fail until you set `SMTP_PASS` in `.env` and restart.

### Troubleshooting `Missing SMTP_PASS`

1. **See which backend serves your site** — open `https://your-domain.com/api/health` in a browser:
   - `"platform":"vercel"` → traffic goes to **Vercel**, not your Linux server. Either add SMTP variables in the [Vercel dashboard](https://vercel.com) (Project → Settings → Environment Variables → Production → **Redeploy**), or point DNS/nginx to your Node server (step 2).
   - `"platform":"node"` → your **GHD server** is serving the API. Create `/path/to/ghd-hotels-magson/.env` from `.env.example`, set `SMTP_PASS="your-password"` (quotes if the password contains `#`), run `pnpm start` from the repo root, and ensure nginx proxies **all** paths including `/api/*` to port `8788`.

2. **`.env` location** — must live next to `package.json` (repo root), not only in `src/frontend`. The app does not commit `.env`; copy it manually on each server.

3. **PM2 / systemd** — if the process manager does not load `.env`, export variables in the unit file or use `EnvironmentFile=/path/to/.env`.

## Deploy on Vercel

The repo includes `vercel.json` for the Vite frontend plus serverless handlers in
`api/` (contact form, careers applications, booking rates, health check).

1. Push this repository to GitHub (`magsonfernandes/ghd_hotels_website`).
2. In [Vercel](https://vercel.com), **Add New Project** → import the repo.
3. Leave the detected settings (install: `pnpm install`, build:
   `pnpm --filter @caffeine/template-frontend build`, output: `src/frontend/dist`).
4. Add **Environment Variables** (Production), then redeploy:

| Variable | Required for | Notes |
|----------|----------------|-------|
| `SMTP_HOST` | Contact & careers mail | e.g. `mail.ghdhotels.in` |
| `SMTP_PORT` | Contact & careers mail | e.g. `465` |
| `SMTP_SECURE` | Contact & careers mail | `true` for port 465 |
| `SMTP_USER` | Contact & careers mail | `test@ghdhotels.in` |
| `SMTP_PASS` | Contact & careers mail | Mailbox password (quote if it contains `#`) |
| `MAILBOX` | Contact & careers mail | Inbox that receives submissions |

5. Deploy. Your site will be at `https://<project>.vercel.app`.

**CLI (optional):**

```bash
npx vercel login
npx vercel link
npx vercel --prod
```

Contact and careers forms use same-origin `/api/contact` and `/api/careers` on
Vercel (no `VITE_MAIL_API_URL` needed). Booking rates load from `/api/rates`.

**Note:** Admin rate edits (`/api/admin/rates`) and persistent `data/rates.json`
are for the long-running Node server (`pnpm start`), not Vercel’s read-only
serverless filesystem. On Vercel, booking uses the seeded rates in `api/rates.ts`.

## Windows (PowerShell)

1) Install Node.js (LTS), then:

```powershell
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm -C src/frontend dev -- --port 5173
```

2) Open:

- `http://localhost:5173`

## macOS / Linux (Terminal)

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm optimize:assets   # after adding images/videos under src/frontend/public
pnpm -C src/frontend dev -- --port 5173
```

Open:

- `http://localhost:5173`

**Images:** `pnpm optimize:assets` writes WebP `srcset` variants and
`src/frontend/src/generated/media-manifest.json`. The site serves those via
`ResponsiveImage` / `MediaBackground` (same layout; smaller downloads). Re-run when
you change source files in `public/`.

## If install warns about ignored build scripts

```bash
pnpm approve-builds
pnpm install
```

## Admin pricing portal

Room rates, meal add-ons, and the tax rate are no longer hard-coded — the
public booking page reads them at runtime from this server. Edits happen in a
separate dashboard that lives in the `admin-portal` repo (see
`/Users/krupashrikoli/Documents/admin-portal` locally).

How it connects:

- The server exposes:
  - `GET /api/rates` — public payload consumed by the booking page.
  - `GET /api/admin/rates` and `PUT /api/admin/rates` — protected by an admin
    bearer token; used by the portal.
- Persistence is a single JSON file at `data/rates.json`. The file is seeded
  with the day-one defaults on first boot. The `data/` folder is gitignored.

Required env vars (set in `.env` or `.env.local`):

- `ADMIN_TOKEN` — shared secret the portal must send as `Authorization: Bearer
  <token>`. If unset, `/api/admin/*` responds with `503` and writes are
  refused; the public page keeps serving the last saved rates.
- `CORS_ORIGIN` — if the portal is deployed on a different origin, add it to
  this comma-separated allowlist (e.g.
  `https://your-domain.com,https://admin.your-domain.com`). Leave empty in
  development for permissive CORS.

To run the portal locally against this server, see the README in
`admin-portal/`.

