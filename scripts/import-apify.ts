/**
 * CLI entry point for the TikTok → Supabase import.
 *
 * The actual import logic lives in src/lib/import/tiktok-import.ts, shared
 * with the automatic webhook at src/app/api/webhooks/apify/route.ts — this
 * file just loads .env.local, wires up console output, and sets the
 * process exit code.
 *
 * Usage:
 *   npx tsx scripts/import-apify.ts [datasetId]
 *   (datasetId defaults to DEFAULT_DATASET_ID in tiktok-import.ts when omitted)
 */

import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })

// Imported after loadEnv() so tiktok-import.ts's requireEnv() calls see the
// loaded variables regardless of module-evaluation order.
import { runTikTokImport } from "../src/lib/import/tiktok-import"

async function main() {
  const datasetId = process.argv[2]

  console.log(`Fetching dataset ${datasetId ?? "(default)"} from Apify...`)

  const result = await runTikTokImport(datasetId, {
    onItem: (item) => {
      if (item.status === "imported") {
        console.log(`  ✓ ${item.title.slice(0, 60)}${item.hasVideo ? " [+video]" : ""}`)
      } else if (item.status === "skipped") {
        console.log(`  · ${item.title.slice(0, 60)} (already imported, skipped)`)
      } else if (item.status === "unrecognized") {
        console.error("  ✗ Unrecognized item shape (no id/aweme_id) — skipped.")
      } else {
        console.error(`  ✗ ${item.title.slice(0, 60)} — ${item.error}`)
      }
    },
  })

  console.log(`Fetched ${result.fetched} items.`)
  console.log(
    `\nDone. Imported ${result.imported} product(s), ${result.skipped} skipped (already imported), ` +
      `${result.failed} failed` +
      (result.unrecognized > 0 ? `, ${result.unrecognized} unrecognized item shape` : "") +
      "."
  )

  if (result.failed > 0 || result.unrecognized > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error("Import failed:", error instanceof Error ? error.message : error)
  process.exitCode = 1
})
