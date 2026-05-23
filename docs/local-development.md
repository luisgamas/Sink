# Local Development

This guide walks you through setting up Sink for local development. The local environment is **fully isolated** from any production Cloudflare instance — nothing you do locally can affect your deployed site.

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| [Node.js](https://nodejs.org/) | >= 22 | `node -v` |
| [pnpm](https://pnpm.io/) | >= 10 | `pnpm -v` |
| [Git](https://git-scm.com/) | any | `git --version` |

> **Note:** [Wrangler](https://developers.cloudflare.com/workers/wrangler/) is included as a project dependency — you do not need to install it globally.

## Quick Start

```bash
# 1. Clone and enter the project
git clone https://github.com/LuisGamas/Sink.git
cd Sink

# 2. Install dependencies
pnpm install

# 3. Create your environment file
cp .env.example .env

# 4. Start the dev server — migrations are auto-applied
pnpm dev
```

The server starts at **http://localhost:7465**. Navigate to `/dashboard` and log in with the `NUXT_SITE_TOKEN` value from your `.env`.

## Environment Configuration

Create a `.env` file in the project root (it is gitignored). Here is a recommended local configuration:

```env
# Dashboard access token (min 8 characters, not pure numbers)
NUXT_SITE_TOKEN=mysinktoken123

# Leave empty to prevent any connection to production Cloudflare
NUXT_CF_ACCOUNT_ID=
NUXT_CF_API_TOKEN=

# Optional: customize these as needed
NUXT_PUBLIC_PREVIEW_MODE=false
NUXT_PUBLIC_SLUG_DEFAULT_LENGTH=5
NUXT_REDIRECT_STATUS_CODE=308
NUXT_LINK_CACHE_TTL=60
NUXT_REDIRECT_WITH_QUERY=false
NUXT_HOME_URL=
NUXT_DATASET=sink
NUXT_AI_MODEL="@cf/meta/llama-3-8b-instruct"
NUXT_AI_PROMPT="You are a URL shortening assistant......"
NUXT_DISABLE_AUTO_BACKUP=false
```

### Key Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_SITE_TOKEN` | Yes | Password to access the dashboard. Min 8 characters. |
| `NUXT_CF_ACCOUNT_ID` | No | Leave empty for local dev. Only needed for analytics. |
| `NUXT_CF_API_TOKEN` | No | Leave empty for local dev. Only needed for analytics. |
| `NUXT_HOME_URL` | No | Redirect the root URL (`/`) to a custom page. Leave empty to show the default Sink homepage. |

See [configuration.md](./configuration.md) for a full reference of all available variables.

## How It Works

Sink runs on Cloudflare Workers in production, using KV (key-value store), D1 (SQLite database), R2 (object storage), and Analytics Engine. For local development, these services are emulated by [Miniflare](https://miniflare.dev/) — the local Cloudflare simulator bundled with Wrangler.

The project includes two Wrangler configuration files:

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | **Production**: contains real Cloudflare resource IDs and remote AI binding |
| `wrangler.dev.jsonc` | **Local dev**: uses fictitious IDs (`local-dev-db`, `local-dev-kv`) and no remote bindings |

Nuxt is configured (in `nuxt.config.ts`) to automatically use `wrangler.dev.jsonc` during development. This means:

- **KV** is emulated as a local file-based store
- **D1** is emulated as a local SQLite database
- **No Cloudflare authentication** is required
- **No production data** is accessible or affected

All local data is stored in `.wrangler/state/v3/` (gitignored).

## Database Migrations

Migrations are **auto-applied** on the first startup — the app detects pending migrations and runs them automatically. No manual step is needed.

If you need to force a fresh migration (e.g., after pulling new migration files), you can still run them manually:

```bash
npx wrangler d1 migrations apply sink-db-dev --local --config wrangler.dev.jsonc
```

This creates the tables (`links`, `folders_metadata`, `tags_metadata`) in a local SQLite file. You should see output like:

```
Migrations to be applied:
┌──────────────────────────┐
│ name                     │
├──────────────────────────┤
│ 0001_init_d1.sql         │
├──────────────────────────┤
│ 0002_add_url_index.sql   │
├──────────────────────────┤
│ 0003_metadata_tables.sql │
└──────────────────────────┘
```

## Running the Dev Server

```bash
pnpm dev
```

This starts Nuxt in development mode with the `cloudflare-dev` emulation preset. You should see:

```
Nuxt 4.x.x (with Nitro 2.x.x, Vite 7.x.x and Vue 3.x.x)

  ➜ Local:    http://localhost:7465/
  ➜ DevTools: press Shift + Alt + D in the browser

ℹ Using cloudflare-dev emulation in development mode.
✔ Vite client built in XXms
✔ Vite server built in XXms
✔ Nuxt Nitro server built in XXXXms
Using vars defined in .env
```

### Accessing the Dashboard

1. Open **http://localhost:7465/dashboard**
2. Enter your `NUXT_SITE_TOKEN` (e.g., `mysinktoken123`)
3. You're in

### Using the Dashboard

Once logged in, you can:

- **Create links** — stored locally in KV and D1
- **Edit and delete links** — changes persist for the session
- **Import/export links** — test backup functionality
- **Manage folders and tags** — stored in local D1
- **Switch themes** — test dark/light mode

## What Works and What Doesn't

| Feature | Local | Notes |
|---------|-------|-------|
| Login / Auth | Yes | Uses `NUXT_SITE_TOKEN` from `.env` |
| Create / Edit / Delete links | Yes | Stored in local KV + D1 |
| List / Search links | Yes | Queries local KV + D1 |
| Link redirects | Yes | `http://localhost:7465/<slug>` |
| Folders & Tags | Yes | Stored in local D1 |
| Import / Export | Yes | Reads/writes local KV |
| Dark / Light theme | Yes | Full CSS variable theming |
| Analytics & Charts | No | Requires Cloudflare Analytics Engine |
| AI slug generation | No | Requires Cloudflare AI (remote) |
| R2 backups | No | R2 not configured in dev |
| Real-time globe | No | No analytics data to visualize |
| OpenGraph image upload | No | R2 not configured in dev |

## Reset Local Environment

To completely wipe local data and start fresh:

```bash
# Stop the dev server (Ctrl+C), then:

# Remove all local state
rm -rf .wrangler/state

# Start again — migrations auto-apply
pnpm dev
```

On Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force .wrangler\state -ErrorAction SilentlyContinue
pnpm dev
```

### Full Clean Reinstall

If you need to completely reset the project (dependencies + build cache + local data):

```bash
rm -rf node_modules .nuxt .output .wrangler
pnpm install
pnpm dev
```

## Troubleshooting

### `401 Unauthorized` on login

Your token doesn't match. Check that `NUXT_SITE_TOKEN` in `.env` matches exactly what you type in the login form. The token must be at least 8 characters.

### `Cannot read properties of undefined (reading 'env')`

The Cloudflare bindings are not available. This happens when:

- **You used `$env:CI = "true"`** — don't set this variable. The project is configured to use `wrangler.dev.jsonc` automatically.

### `Failed to start the remote proxy session`

The production `wrangler.jsonc` is being used instead of `wrangler.dev.jsonc`. Verify that `nuxt.config.ts` has the `cloudflare.dev.configPath` setting pointing to `wrangler.dev.jsonc`.

### `table links has no column named X` or similar D1 errors

New migrations may have been added. The app should auto-apply them on next startup, but you can also re-run manually:

```bash
npx wrangler d1 migrations apply sink-db-dev --local --config wrangler.dev.jsonc
```

### Port 7465 already in use

Another process is using the port. Either stop it or Nuxt will automatically pick an alternative port (usually 3000).

## Production Safety

The local development environment is completely isolated from production:

1. **`wrangler.dev.jsonc`** uses fictitious resource IDs (`local-dev-db`, `local-dev-kv`) that don't correspond to any real Cloudflare resource
2. **Empty Cloudflare credentials** (`NUXT_CF_ACCOUNT_ID=`, `NUXT_CF_API_TOKEN=`) prevent any API calls to Cloudflare
3. **Miniflare** stores all data locally in `.wrangler/state/v3/` — a gitignored directory
4. **No remote connections** are made to Cloudflare services

You cannot accidentally modify, read, or delete production data from a local development session.
