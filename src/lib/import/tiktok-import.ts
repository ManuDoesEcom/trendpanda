import { createClient } from "@supabase/supabase-js"

/**
 * Shared TikTok → Supabase import logic, used by both the manual CLI
 * (scripts/import-apify.ts) and the automatic webhook
 * (src/app/api/webhooks/apify/route.ts) so the two never drift apart.
 *
 * Supports two Apify dataset shapes, auto-detected per item:
 *  - "scraper" shape (the original actor): flat fields like `id`, `text`,
 *    `videoMeta.coverUrl`, `playCount`, `diggCount`, `hashtags[]`. No real
 *    downloadable video file — only a cover image.
 *  - "raw aweme" shape (a TikTok *downloader* actor's raw API dump):
 *    `aweme_id`, `desc`, `statistics.*`, `video.play_addr` /
 *    `video.download_addr` / `video.download_no_watermark_addr`
 *    (`url_list[0]` — a real, directly playable/downloadable TikTok CDN
 *    video URL), `video.cover`. This is what makes `download_url` real.
 *
 * Each item is mapped into a `products` row (title, thumbnail, download
 * URL, category placeholder) plus a matching `tiktok_metrics` row (views,
 * likes, shares, comments, hashtags).
 *
 * The live `products` table in this project has its own shape — title,
 * description, category, image_url (singular), download_url,
 * est_retail_price, est_sourcing_cost, opportunity_score — and no unique
 * business key, so re-runs are made idempotent by matching on `title`
 * (skip if a product with that title already exists, insert otherwise)
 * rather than a DB-level upsert.
 *
 * Note on `download_url`: it's a signed, time-limited TikTok CDN URL —
 * valid for a period after the scrape, not permanently.
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL   — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY  — service role key (bypasses RLS for writes)
 *   APIFY_API_TOKEN            — Apify API token, either the raw token or a
 *                                 full dataset URL containing `?token=...`
 */

export const DEFAULT_DATASET_ID = "olci8VJM6aYHAzx7U"

interface NormalizedItem {
  id: string
  text: string
  createdAtISO: string | null
  thumbnailUrl: string | null
  downloadUrl: string | null
  views: number
  likes: number
  shares: number
  comments: number
  hashtags: string[]
}

// ---- "scraper" shape (original actor) --------------------------------

interface ScraperItem {
  id: string
  text?: string
  videoMeta?: { coverUrl?: string; originalCoverUrl?: string }
  diggCount?: number
  shareCount?: number
  playCount?: number
  commentCount?: number
  hashtags?: { name?: string }[]
  createTimeISO?: string
}

function normalizeScraperItem(item: ScraperItem): NormalizedItem {
  const hashtags = (item.hashtags ?? [])
    .map((tag) => (tag.name ? `#${tag.name}` : null))
    .filter((tag): tag is string => Boolean(tag))

  return {
    id: item.id,
    text: item.text ?? "",
    createdAtISO: item.createTimeISO ?? null,
    thumbnailUrl: item.videoMeta?.coverUrl ?? item.videoMeta?.originalCoverUrl ?? null,
    downloadUrl: null, // this actor never provides a real video file
    views: item.playCount ?? 0,
    likes: item.diggCount ?? 0,
    shares: item.shareCount ?? 0,
    comments: item.commentCount ?? 0,
    hashtags,
  }
}

// ---- "raw aweme" shape (TikTok downloader actor) ----------------------

interface AwemeAddr {
  url_list?: string[]
}

interface AwemeItem {
  aweme_id: string
  desc?: string
  create_time?: number
  statistics?: {
    play_count?: number
    digg_count?: number
    share_count?: number
    comment_count?: number
  }
  video?: {
    cover?: AwemeAddr
    origin_cover?: AwemeAddr
    dynamic_cover?: AwemeAddr
    download_no_watermark_addr?: AwemeAddr
    download_addr?: AwemeAddr
    play_addr?: AwemeAddr
  }
}

function normalizeAwemeItem(item: AwemeItem): NormalizedItem {
  const video = item.video ?? {}
  const stats = item.statistics ?? {}
  const text = item.desc ?? ""
  const hashtags = [...text.matchAll(/#(\w+)/g)].map((match) => `#${match[1]}`)
  const downloadUrl =
    video.download_no_watermark_addr?.url_list?.[0] ??
    video.download_addr?.url_list?.[0] ??
    video.play_addr?.url_list?.[0] ??
    null
  const thumbnailUrl =
    video.cover?.url_list?.[0] ??
    video.origin_cover?.url_list?.[0] ??
    video.dynamic_cover?.url_list?.[0] ??
    null

  return {
    id: item.aweme_id,
    text,
    createdAtISO: item.create_time ? new Date(item.create_time * 1000).toISOString() : null,
    thumbnailUrl,
    downloadUrl,
    views: stats.play_count ?? 0,
    likes: stats.digg_count ?? 0,
    shares: stats.share_count ?? 0,
    comments: stats.comment_count ?? 0,
    hashtags,
  }
}

function normalizeItem(raw: unknown): NormalizedItem | null {
  const item = raw as Record<string, unknown>
  if (typeof item.aweme_id === "string" && item.video) {
    return normalizeAwemeItem(item as unknown as AwemeItem)
  }
  if (typeof item.id === "string") {
    return normalizeScraperItem(item as unknown as ScraperItem)
  }
  return null
}

// ---- shared helpers -----------------------------------------------------

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

function deriveTitle(item: NormalizedItem): string {
  const withoutHashtags = item.text.replace(/#[^\s#]+/g, "").trim()
  const cleaned = withoutHashtags.replace(/\s+/g, " ")
  if (cleaned.length > 0) {
    return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned
  }
  return `TikTok video ${item.id}`
}

async function fetchDatasetItems(datasetId: string, token: string): Promise<unknown[]> {
  const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&clean=true&format=json`
  const response = await fetch(url)

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Apify request failed (${response.status}): ${body}`)
  }

  return (await response.json()) as unknown[]
}

export interface ImportItemEvent {
  title: string
  status: "imported" | "skipped" | "failed" | "unrecognized"
  hasVideo?: boolean
  error?: string
}

export interface ImportResult {
  datasetId: string
  fetched: number
  imported: number
  skipped: number
  failed: number
  unrecognized: number
  errors: string[]
}

export async function runTikTokImport(
  datasetId: string = DEFAULT_DATASET_ID,
  options: { onItem?: (event: ImportItemEvent) => void } = {}
): Promise<ImportResult> {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  const apifyToken = resolveApifyToken(requireEnv("APIFY_API_TOKEN"))

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const rawItems = await fetchDatasetItems(datasetId, apifyToken)

  let imported = 0
  let skipped = 0
  let failed = 0
  let unrecognized = 0
  const errors: string[] = []

  for (const raw of rawItems) {
    const item = normalizeItem(raw)
    if (!item) {
      unrecognized += 1
      options.onItem?.({ title: "(unrecognized item)", status: "unrecognized" })
      continue
    }

    const title = deriveTitle(item)
    const engagementRate =
      item.views > 0
        ? Number((((item.likes + item.shares + item.comments) / item.views) * 100).toFixed(2))
        : 0

    try {
      const productRow = {
        title,
        description: "",
        category: "TikTok Import",
        image_url: item.thumbnailUrl,
        est_retail_price: 0,
        est_sourcing_cost: 0,
        download_url: item.downloadUrl,
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
        options.onItem?.({ title, status: "skipped" })
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
          total_views: item.views,
          total_likes: item.likes,
          total_shares: item.shares,
          total_comments: item.comments,
          engagement_rate: engagementRate,
          growth_rate_30d: 0,
          video_count: 1,
          top_hashtags: item.hashtags,
          daily_history: item.createdAtISO
            ? [{ date: item.createdAtISO.slice(0, 10), tiktokViews: item.views, metaActiveAds: 0 }]
            : [],
        },
        { onConflict: "product_id" }
      )

      if (metricsError) {
        throw metricsError
      }

      imported += 1
      options.onItem?.({ title, status: "imported", hasVideo: Boolean(item.downloadUrl) })
    } catch (error) {
      failed += 1
      const message = describeError(error)
      errors.push(`${title.slice(0, 60)}: ${message}`)
      options.onItem?.({ title, status: "failed", error: message })
    }
  }

  return {
    datasetId,
    fetched: rawItems.length,
    imported,
    skipped,
    failed,
    unrecognized,
    errors,
  }
}
