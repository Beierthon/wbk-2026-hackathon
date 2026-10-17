# Cloudflare Workers hosting

Production repository: `Beierthon/wbk-2026-hackathon`, branch `main`.
Domain: `wbk.2026.hackathon.kevinbeier.com`.
Worker: `com-kevinbeier-hackathon-2026-wbk`.

From the repository root, install with `corepack pnpm install --frozen-lockfile`,
then `pnpm --filter web build:cloudflare`. OpenNext uses the existing Next.js
application, with a separate Webpack build for Worker compatibility. Test with
`pnpm --filter web preview:cloudflare`; deploy the built output using
`pnpm --filter web deploy:cloudflare`.

The KV namespace `kevinbeier-hackathon-2026-cache` provides the incremental
cache through `NEXT_INC_CACHE_KV`. Cache Components and existing `use cache`
data use this backend; R2 is not used. The D1 tag cache and Durable Object
revalidation queue remain enabled.

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

KV is eventually consistent across Cloudflare locations; cache writes can take up to about a minute to become visible elsewhere. This differs from R2. The application database remains authoritative, and Hackathon 2026 retains D1-based tag invalidation. Do not use the cache as an authoritative store for inventory or mutations. KV Free quotas apply; no paid plan is enabled automatically.

## Cloudflare protection and logging baseline

The active kevinbeier.com zone uses Full (strict) TLS, minimum TLS 1.2 and HTTPS
redirects. Browser cache TTL is set to respect origin headers. Keep the free
Managed WAF enabled and public custom domains accessible without a login gate.
Browser Integrity Check is disabled only for the existing /api/, /assets/,
/static/, /_next/, /_nuxt/ and /webhooks/ path prefixes; keep Managed WAF active
on these paths. Do not enable blanket Bot Fight Mode. These are shared zone
settings, not Wrangler application settings; deployments must not reset them.
Keep nameservers and iCloud MX, DKIM and TXT records unchanged. Do not enable
R2, paid plans or a registrar transfer, or delete Vercel projects.

Worker observability is declared in wrangler.jsonc: persisted invocation logs
and query-string redaction are enabled, and the existing disabled traces setting
is preserved. Do not log request URLs with queries, tokens or request bodies in
application console messages. No Logpush destination is needed. Existing private
Cloudflare Access policies for Planner and Plutos must remain in place.

Before proxying wbk.2026.hackathon.kevinbeier.com, verify active certificate
coverage for that exact deeply nested hostname; the usual zone wildcard alone
does not cover it. Do not enable paid certificate products.

## Public production entry points

Keep `main` as the production branch. The additional production `pages.dev` hostname redirects to the official custom domain, preserving path and query. Deployment-specific Pages URLs require Kevin's existing Cloudflare Access login; automatic preview deployments remain disabled. Do not remove the Access protection for the private Planner or Plutos services.

Cloudflare Web Analytics loads after hydration from the root layout, using the public site token registered for `wbk.2026.hackathon.kevinbeier.com`. The token is a public beacon identifier, not an API credential. Use HTTP analytics for file-only assets.
