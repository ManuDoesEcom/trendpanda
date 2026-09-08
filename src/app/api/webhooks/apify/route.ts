import { NextResponse, type NextRequest } from "next/server"
import { runTikTokImport } from "@/lib/import/tiktok-import"

/**
 * Apify webhook receiver — triggers the TikTok → Supabase import
 * automatically whenever a scheduled Apify run finishes successfully.
 *
 * Set this route's full URL as the webhook URL on an Apify Actor/Task:
 *   Apify console → your Actor/Task → Settings → Webhooks → Add webhook
 *   Event type: "Run succeeded" (ACTOR.RUN.SUCCEEDED)
 *   URL: https://<your-vercel-domain>/api/webhooks/apify?secret=<APIFY_WEBHOOK_SECRET>
 *
 * Apify's webhook payload looks like:
 *   { "eventType": "ACTOR.RUN.SUCCEEDED", "resource": { "defaultDatasetId": "...", ... } }
 * `resource.defaultDatasetId` is read from that body and passed straight
 * into the same import logic scripts/import-apify.ts uses.
 *
 * Auth: if APIFY_WEBHOOK_SECRET is set, the request must include a
 * matching `?secret=` query param (or `x-webhook-secret` header) — this
 * is deliberately a shared-secret-in-URL scheme (Apify webhooks have no
 * built-in request signing) rather than left unauthenticated.
 *
 * Vercel note: this import can take longer than the platform's default
 * function timeout depending on dataset size. `maxDuration` below raises
 * it, but Hobby-tier projects are still hard-capped at 60s regardless —
 * upgrade to Pro (or split large datasets) if imports exceed that.
 */
export const maxDuration = 300

interface ApifyWebhookPayload {
  eventType?: string
  resource?: {
    defaultDatasetId?: string
  }
}

function isAuthorized(request: NextRequest): boolean {
  const configuredSecret = process.env.APIFY_WEBHOOK_SECRET
  if (!configuredSecret) return true

  const provided = request.nextUrl.searchParams.get("secret") ?? request.headers.get("x-webhook-secret")
  return provided === configuredSecret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let payload: ApifyWebhookPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (payload.eventType && payload.eventType !== "ACTOR.RUN.SUCCEEDED") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: `Ignored event type: ${payload.eventType}`,
    })
  }

  const datasetId = payload.resource?.defaultDatasetId
  if (!datasetId) {
    return NextResponse.json(
      { error: "Missing resource.defaultDatasetId in webhook payload." },
      { status: 400 }
    )
  }

  console.log(`[apify-webhook] Starting import for dataset ${datasetId}...`)

  try {
    const result = await runTikTokImport(datasetId, {
      onItem: (item) => {
        const icon =
          item.status === "imported" ? "✓" : item.status === "skipped" ? "·" : "✗"
        console.log(`[apify-webhook]   ${icon} ${item.title.slice(0, 60)}`)
      },
    })

    console.log(
      `[apify-webhook] Done. Imported ${result.imported}, skipped ${result.skipped}, ` +
        `failed ${result.failed}.`
    )

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[apify-webhook] Import failed: ${message}`)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Convenience for checking the route is deployed and live from a browser.
export async function GET() {
  return NextResponse.json({ ok: true, message: "Apify webhook endpoint is live. Use POST." })
}
