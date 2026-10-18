import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const configPath = process.argv[2] ?? "wrangler.jsonc";
let config;
if (configPath.endsWith(".json")) {
  config = JSON.parse(readFileSync(configPath, "utf-8"));
} else {
  const wrangler = await import("wrangler");
  config = wrangler.unstable_readConfig(
    { config: configPath },
    { hideWarnings: true }
  );
}
assert.match(config.compatibility_date, /^\d{4}-\d{2}-\d{2}$/);
if (!config.pages_build_output_dir) {
  assert.equal(
    config.preview_urls,
    false,
    "Version previews must not bypass access protection"
  );
  if (config.workers_dev !== false) {
    assert.equal(
      process.argv.includes("--access-protected"),
      true,
      "Public workers.dev requires an explicit Access-reviewed exception"
    );
    assert.ok(
      config.vars.ACCESS_AUD,
      "Protected workers require an Access audience"
    );
  }
  assert.equal(config.observability.enabled, true, "Enable observability");
  assert.equal(
    config.observability.redact_query_string,
    true,
    "Redact query strings"
  );
  assert.equal(
    config.observability.issues?.enabled,
    true,
    "Enable Issues and preserve it across deploys"
  );
  assert.equal(config.observability.logs?.enabled, true, "Enable logs");
  assert.equal(
    config.observability.logs?.invocation_logs,
    true,
    "Enable invocation logs"
  );
  assert.equal(config.observability.logs?.persist, true, "Persist logs");
}
for (const key of Object.keys(config.vars ?? {})) {
  if (key === "CF_WEB_ANALYTICS_TOKEN") {
    continue;
  }
  assert.equal(
    /(?:SECRET|PASSWORD|PRIVATE_KEY|API_KEY|ACCESS_TOKEN|REFRESH_TOKEN|SERVICE_ROLE_KEY)$/.test(
      key
    ),
    false,
    `Use a secret binding for ${key}`
  );
}
console.log(`Cloudflare baseline passed: ${config.name}`);
