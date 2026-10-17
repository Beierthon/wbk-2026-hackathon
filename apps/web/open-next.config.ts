import d1TagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache"
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue"
import {
  defineCloudflareConfig,
  type OpenNextConfig,
} from "@opennextjs/cloudflare"
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache"

const config: OpenNextConfig = {
  ...defineCloudflareConfig({
    incrementalCache: kvIncrementalCache,
    queue: doQueue,
    tagCache: d1TagCache,
  }),
  buildCommand: "pnpm --filter slides build && pnpm exec next build --webpack",
}

export default config
