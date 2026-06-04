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

2) Create a `.env` on the server (do not commit it). Start from `.env.example` and set the variables below.

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

**Environment variables** (repo root `.env`):

| Variable | Required for | Notes |
|----------|----------------|-------|
| `SMTP_HOST` | Contact & careers mail | e.g. `mail.ghdhotels.in` |
| `SMTP_PORT` | Contact & careers mail | e.g. `465` |
| `SMTP_SECURE` | Contact & careers mail | `true` for port 465 |
| `SMTP_USER` | Contact & careers mail | `website@ghdhotels.in` |
| `SMTP_PASS` | Contact & careers mail | Mailbox password (quote if it contains `#`) |
| `MAILBOX` | Contact mail | From/to for contact form |
| `CAREERS_TO` | Careers mail | HR inbox (`hr@ghdhotels.in`) |
| `CAPTCHA_SECRET` | Contact CAPTCHA | Optional; defaults to `SMTP_PASS` in dev |
| `ADMIN_TOKEN` | Admin rates portal | Optional; see Admin pricing portal |

The site and API are served only by the Node app (`server/index.ts`): static files from `src/frontend/dist`, plus `/api/contact`, `/api/careers`, `/api/captcha`, `/api/rates`, and admin routes. No separate serverless host.

### Troubleshooting `Missing SMTP_PASS`

1. Open `https://your-domain.com/api/health` — expect `"platform":"node"` and `"smtpConfigured":true`.
2. **`.env` location** — must live next to `package.json` (repo root), not only in `src/frontend`.
3. Ensure nginx (or your proxy) forwards **all** paths, including `/api/*`, to port `8788`.
4. **PM2 / systemd** — if the process manager does not load `.env`, use `EnvironmentFile=/path/to/.env` or export `SMTP_PASS` in the unit file.

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

