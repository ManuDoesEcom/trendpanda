/**
 * Resolves the real TikTok video id for a Supabase `products` row.
 *
 * The `products` and `tiktok_metrics` tables have no video-reference column
 * at all — only a thumbnail `image_url` was persisted by
 * scripts/import-apify.ts. The numeric TikTok video id (needed to build a
 * real `https://www.tiktok.com/embed/v2/{id}` embed) only exists in the
 * original Apify dataset, so it's re-fetched here and matched back to each
 * product by title — the same matching key scripts/import-apify.ts used to
 * write the row in the first place. The lookup is cached in-memory per
 * server instance so this costs one Apify request, not one per product.
 */

const DATASET_ID = "olci8VJM6aYHAzx7U"
const CACHE_TTL_MS = 10 * 60 * 1000

interface ApifyTikTokItem {
  id?: string
  text?: string
}

let cachedMap: Map<string, string> | null = null
let cachedAt = 0

function resolveApifyToken(): string | null {
  const raw = process.env.APIFY_API_TOKEN
  if (!raw) return null
  if (raw.startsWith("http")) {
    try {
      return new URL(raw).searchParams.get("token")
    } catch {
      return null
    }
  }
  return raw
}

// Mirrors scripts/import-apify.ts's deriveTitle() exactly so titles match.
function deriveTitle(item: ApifyTikTokItem): string {
  const withoutHashtags = (item.text ?? "").replace(/#[^\s#]+/g, "").trim()
  const cleaned = withoutHashtags.replace(/\s+/g, " ")
  if (cleaned.length > 0) {
    return cleaned.length > 120 ? `${cleaned.slice(0, 117)}...` : cleaned
  }
  return `TikTok video ${item.id ?? "unknown"}`
}

async function loadVideoIdMap(): Promise<Map<string, string>> {
  const now = Date.now()
  if (cachedMap && now - cachedAt < CACHE_TTL_MS) {
    return cachedMap
  }

  const token = resolveApifyToken()
  if (!token) {
    cachedMap = new Map()
    cachedAt = now
    return cachedMap
  }

  try {
    const url = `https://api.apify.com/v2/datasets/${DATASET_ID}/items?token=${token}&clean=true&format=json`
    const response = await fetch(url, { next: { revalidate: 600 } })
    if (!response.ok) {
      throw new Error(`Apify request failed (${response.status})`)
    }

    const items = (await response.json()) as ApifyTikTokItem[]
    const map = new Map<string, string>()
    for (const item of items) {
      if (!item.id) continue
      const title = deriveTitle(item)
      if (!map.has(title)) {
        map.set(title, item.id)
      }
    }

    cachedMap = map
    cachedAt = now
    return map
  } catch {
    // Fail closed: products just render without a video rather than
    // breaking the page. `cachedAt` is intentionally left stale so the
    // next call retries instead of caching the failure.
    return cachedMap ?? new Map()
  }
}

export async function getTikTokVideoId(productTitle: string): Promise<string | null> {
  const map = await loadVideoIdMap()
  return map.get(productTitle) ?? null
}
