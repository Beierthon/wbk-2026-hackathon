# Cloudflare Workers hosting

Production repository: `Beierthon/wbk-2026-hackathon`, branch `main`.
Domain: `wbk.2026.hackathon.kevinbeier.com`.
Worker: `kevinbeier-hackathon-2026`.

From the repository root, install with `corepack pnpm install --frozen-lockfile`,
then `pnpm --filter web build:cloudflare`. OpenNext uses the existing Next.js
application, with a separate Webpack build for Worker compatibility. Test with
`pnpm --filter web preview:cloudflare`; deploy the built output using
`pnpm --filter web deploy:cloudflare`.

Create R2 bucket `kevinbeier-hackathon-2026-cache` before deploying. Cache
Components and existing `use cache` data require a persistent cache backend;
R2 provides it through `NEXT_INC_CACHE_R2_BUCKET`.

Copy the existing production configuration directly into Cloudflare, preserving
values without printing or committing credentials:

- Build and runtime: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_LIVEKIT_URL`.
- Runtime secrets: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
- Preserve any explicitly configured `WBK_*` and OpenAI configuration if present.

The current application uses Supabase's HTTP client, not a direct Postgres
connection. Do not copy unrelated legacy database passwords or service-role
keys into the browser or the new runtime. Keep existing Supabase and LiveKit
projects and data unchanged.

Without public Supabase variables, the app falls back to mock data. A successful
mock build is not proof of production parity: verify actual Supabase data,
authentication, cached dashboards, API authorization, LiveKit tokens/video and
vision configuration before cutting over. Avoid creating live records during
smoke checks. Keep Vercel until those checks and custom-domain HTTPS pass.

Disable preview deployments and workers.dev until access protection is configured.
The original Vercel production and preview URLs will disappear when its project
is removed; the custom domain remains unchanged.

Background revalidation uses a SQLite Durable Object queue and self-reference binding. On-demand cache-tag invalidation uses D1 database `kevinbeier-hackathon-2026-tags`. The Cloudflare build generates Slidev before Next.js.

The adapter is pinned to OpenNext Cloudflare 1.20.9 with Next.js 16.3.8, matching
its supported peer range. Local validation: production build, Wrangler dry run
(~2.5 MiB compressed), 107 existing unit tests, and workerd browser checks using
mock data. Local cache seeding is performed by the adapter's preview command.
These checks do not replace production Supabase and LiveKit verification.
