# Install + Run (Localhost)

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
pnpm -C src/frontend dev -- --port 5173
```

Open:

- `http://localhost:5173`

## If install warns about ignored build scripts

```bash
pnpm approve-builds
pnpm install
```

