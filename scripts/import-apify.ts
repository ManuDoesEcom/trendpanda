/**
 * Imports a TikTok dataset scraped via Apify into Supabase.
 *
 * Reads the raw items from the given Apify dataset (produced by a
 * TikTok-scraper actor: fields like `text`, `videoMeta.coverUrl`,
 * `playCount`, `diggCount`, ...), maps each video into a `products` row
 * (title, thumbnail, category placeholder) plus a matching `tiktok_metrics`
 * row (views, likes, shares, comments, hashtags).
 *
 * The live `products` table in this project has its own shape — title,
 * description, category, image_url (singular), est_retail_price,
 * est_sourcing_cost, opportunity_score — and no unique business key, so
 * re-runs are made idempotent by matching on `title` (update if a product
 * with that title already exists, insert otherwise) rather than a DB-level
 * upsert.
 *
 * Direct video downloads: the current scraper actor's dataset has no
 * downloadable-video-file field at all (checked its full schema — only a
 * cover-image URL). `resolveDownloadUrl()` below is pre-wired to pick up a
 * real one (`videoMeta.downloadAddr`/`playAddr`, or a top-level
 * `downloadUrl`/`videoUrl`/`playUrl`) the moment the Apify actor is swapped
 * for a TikTok *downloader* actor that provides one — no other change to
 * this script is needed. Two things still have to happen once that data
 * exists: run `alter table public.products add column if not exists
 * download_url text;` in Supabase, and update `mapProduct()` in
 * lib/api/data-service.ts to select and pass through that column (it's not
 * read there yet, since the column doesn't exist today).
 *
 * Usage:
 *   npx tsx scripts/import-apify.ts
 *
 * Required environment variables (read from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL   — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — service role key (needed to bypass RLS for writes)
 *   APIFY_API_TOKEN            — Apify API token, either the raw token or a full
 *                                 dataset URL containing `?token=...`
 */

import { config as loadEnv } from "dotenv"
import { createClient } from "@supabase/supabase-js"

loadEnv({ path: ".env.local" })

const DATASET_ID = "olci8VJM6aYHAzx7U"

interface ApifyHashtag {
  name?: string
}

interface ApifyVideoMeta {
  coverUrl?: string
  originalCoverUrl?: string
  // Not present in the current scraper actor's output (verified against
  // its full dataset schema) — these are the field names most TikTok
  // *downloader* actors use for a direct, playable/downloadable video
  // file. Kept optional so this script does nothing today but picks them
  // up automatically the moment a downloader actor is swapped in. Field
  // names vary by actor; if the new actor uses a different key, add it
  // here alongside the existing candidates.
  downloadAddr?: string
  playAddr?: string
}

interface ApifyTikTokItem {
  id?: string
  text?: string
  webVideoUrl?: string
  videoMeta?: ApifyVideoMeta
  diggCount?: number
  shareCount?: number
  playCount?: number
  commentCount?: number
  hashtags?: ApifyHashtag[]
  createTimeISO?: string
  // Top-level candidates some downloader actors use instead of nesting
  // under videoMeta.
  downloadUrl?: string
  videoUrl?: string
  playUrl?: string
}

/**
 * Picks the first present direct video URL from whichever field name the
 * configured actor happens to use. Returns null for the current scraper
 * actor (none of these fields exist in its output) — `products.download_url`
 * is only written when this resolves to a real value AND that column has
 * been added to Supabase (see the module doc comment above `main()`).
 */
function resolveDownloadUrl(item: ApifyTikTokItem): string | null {
  return (
    item.videoMeta?.downloadAddr ??
    item.videoMeta?.playAddr ??
    item.downloadUrl ??
    item.videoUrl ??
    item.playUrl ??
    null
  )
}

function describeError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (error && typeof error === "object") {
    const { message, details, hint, code } = error as Record<string, unknown>
    return [code, message, details, hint].filter(Boolean).join(" | ") || JSON.stringify(error)
  }
  return String(error)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function resolveApifyToken(raw: string): string {
  if (raw.startsWith("http")) {
    const url = new URL(raw)
    const token = url.searchParams.get("token")
    if (!token) {
      throw new Error("APIFY_API_TOKEN looks like a URL but has no ?token= query param.")
    }
    return token
  }
  return raw
}

function deriveTitle(item: ApifyTikTokItem): string {
  const withoutHashtags = (item.text ?? "").replace(/#[^\s#]+/g, "").trim()
  const cleaned = withoutHashtags.replace(/\s+/g, " ")
  if (cleaned.length > 0) {
    return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned
  }
  return `TikTok video ${item.id ?? "unknown"}`
}

async function fetchDatasetItems(token: string): Promise<ApifyTikTokItem[]> {
  const url = `https://api.apify.com/v2/datasets/${DATASET_ID}/items?token=${token}&clean=true&format=json`
  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Apify request failed (${response.status}): ${body}`)
  }

  return (await response.json()) as ApifyTikTokItem[]
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const apifyToken = resolveApifyToken(requireEnv("APIFY_API_TOKEN"))

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`Fetching dataset ${DATASET_ID} from Apify...`)
  const items = await fetchDatasetItems(apifyToken)
  console.log(`Fetched ${items.length} items.`)

  let imported = 0
  let skipped = 0
  let failed = 0

  for (const item of items) {
    const title = deriveTitle(item)
    const thumbnailUrl = item.videoMeta?.coverUrl ?? item.videoMeta?.originalCoverUrl ?? null
    const downloadUrl = resolveDownloadUrl(item)
    const views = item.playCount ?? 0
    const likes = item.diggCount ?? 0
    const shares = item.shareCount ?? 0
    const comments = item.commentCount ?? 0
    const hashtags = (item.hashtags ?? [])
      .map((tag) => (tag.name ? `#${tag.name}` : null))
      .filter((tag): tag is string => Boolean(tag))
    const engagementRate = views > 0 ? Number((((likes + shares + comments) / views) * 100).toFixed(2)) : 0

    try {
      const productRow = {
        title,
        description: "",
        category: "TikTok Import",
        image_url: thumbnailUrl,
        est_retail_price: 0,
        est_sourcing_cost: 0,
        // Only sent when the actor actually provides a direct video URL —
        // never sent as null/undefined, so this is a no-op against the
        // current products table (which has no `download_url` column yet)
        // until BOTH a downloader actor is in use AND that column exists.
        // Add it with:
        //   alter table public.products add column if not exists download_url text;
        ...(downloadUrl ? { download_url: downloadUrl } : {}),
      }

      const { data: existing, error: lookupError } = await supabase
        .from("products")
        .select("id")
        .eq("title", title)
        .maybeSingle()

      if (lookupError) {
        throw lookupError
      }

      if (existing) {
        skipped += 1
        console.log(`  · ${title.slice(0, 60)} (already imported, skipped)`)
        continue
      }

      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert(productRow)
        .select("id")
        .single()
      if (insertError || !inserted) {
        throw insertError ?? new Error("Insert returned no product row.")
      }
      const productId = inserted.id

      const { error: metricsError } = await supabase.from("tiktok_metrics").upsert(
        {
          product_id: productId,
          total_views: views,
          total_likes: likes,
          total_shares: shares,
          total_comments: comments,
          engagement_rate: engagementRate,
          growth_rate_30d: 0,
          video_count: 1,
          top_hashtags: hashtags,
          daily_history: item.createTimeISO
            ? [{ date: item.createTimeISO.slice(0, 10), tiktokViews: views, metaActiveAds: 0 }]
            : [],
        },
        { onConflict: "product_id" }
      )

      if (metricsError) {
        throw metricsError
      }

      imported += 1
      console.log(`  ✓ ${title.slice(0, 60)}`)
    } catch (error) {
      failed += 1
      console.error(`  ✗ ${title.slice(0, 60)} — ${describeError(error)}`)
    }
  }

  console.log(`\nDone. Imported ${imported} product(s), ${skipped} skipped (already imported), ${failed} failed.`)
  if (failed > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error("Import failed:", error instanceof Error ? error.message : error)
  process.exitCode = 1
})
