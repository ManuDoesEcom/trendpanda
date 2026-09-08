import { MOCK_PRODUCTS } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/server"
import { getTikTokVideoId } from "@/lib/api/tiktok-video-lookup"
import { scoreFromProduct } from "@/lib/utils/scoring"
import type {
  AdFilters,
  DailyMetricPoint,
  MetaAd,
  Product,
  ProductFilters,
  TikTokMetrics,
} from "@/lib/types"

/**
 * Data Abstraction Layer.
 *
 * Products and TikTok metrics are read live from Supabase (`products` +
 * `tiktok_metrics`, joined on `tiktok_metrics.product_id`). Meta ads have no
 * live source yet, so `getAllAds` still reads from `lib/mock-data` until the
 * Meta Ad Library integration exists — every function's return shape is
 * identical either way, so pages don't need to know which source backs them.
 */

interface TikTokMetricsRow {
  total_views: number | null
  total_likes: number | null
  total_shares: number | null
  total_comments: number | null
  engagement_rate: number | null
  growth_rate_30d: number | null
  video_count: number | null
  top_hashtags: string[] | null
  daily_history: DailyMetricPoint[] | null
}

interface ProductRow {
  id: string
  title: string
  description: string | null
  category: string
  image_url: string | null
  est_retail_price: number | string | null
  est_sourcing_cost: number | string | null
  created_at: string
  tiktok_metrics: TikTokMetricsRow | null
}

const PRODUCT_SELECT = `
  id, title, description, category, image_url, est_retail_price, est_sourcing_cost, created_at,
  tiktok_metrics ( total_views, total_likes, total_shares, total_comments, engagement_rate, growth_rate_30d, video_count, top_hashtags, daily_history )
`

function mapTikTokMetrics(row: TikTokMetricsRow | null): TikTokMetrics {
  return {
    totalViews: row?.total_views ?? 0,
    totalLikes: row?.total_likes ?? 0,
    totalShares: row?.total_shares ?? 0,
    totalComments: row?.total_comments ?? 0,
    engagementRate: row?.engagement_rate ?? 0,
    growthRate30d: row?.growth_rate_30d ?? 0,
    videoCount: row?.video_count ?? 0,
    topHashtags: row?.top_hashtags ?? [],
    history: row?.daily_history ?? [],
  }
}

async function mapProduct(row: ProductRow): Promise<Product> {
  const tiktok = mapTikTokMetrics(row.tiktok_metrics)
  const metaAds: MetaAd[] = []
  const sellingPrice = Number(row.est_retail_price) || 0
  const sourcingCost = Number(row.est_sourcing_cost) || 0
  const tiktokVideoId = await getTikTokVideoId(row.title)

  const { score, badge } = scoreFromProduct({
    sellingPrice,
    sourcingCost,
    tiktok,
    metaAds,
    competitorCount: 0,
  })

  return {
    id: row.id,
    title: row.title,
    slug: row.id,
    description: row.description ?? "",
    category: row.category,
    imageUrls: row.image_url ? [row.image_url] : [],
    tiktokVideoId,
    // No real downloadable video file exists anywhere in this pipeline yet:
    // not in `tiktok_metrics` (only view/like/share counters and hashtags —
    // no video/play URL column), not in the current Apify dataset schema
    // (checked: only a cover-image URL, no playAddr/downloadAddr/mp4 field),
    // and not on TikTok's own public embed page (checked its HTML directly:
    // no og:video, no .mp4 reference anywhere). scripts/import-apify.ts is
    // already pre-wired to pick up and store a real one the moment a
    // TikTok *downloader* Apify actor is used instead (see its module doc
    // comment) — once `products.download_url` exists, add it to
    // PRODUCT_SELECT/ProductRow above and read it here. Until then this
    // stays null; the UI falls back to offering the cover image download.
    downloadableVideoUrl: null,
    sellingPrice,
    sourcingCost,
    tiktok,
    metaAds,
    supplierUrl: null,
    createdAt: row.created_at,
    opportunityScore: score,
    opportunityBadge: badge,
  }
}

function applyFiltersAndSort(products: Product[], filters: ProductFilters): Product[] {
  let results = products

  if (filters.category) {
    results = results.filter((product) => product.category === filters.category)
  }

  if (filters.badge) {
    results = results.filter((product) => product.opportunityBadge === filters.badge)
  }

  if (typeof filters.minScore === "number") {
    results = results.filter((product) => product.opportunityScore >= filters.minScore!)
  }

  if (typeof filters.maxScore === "number") {
    results = results.filter((product) => product.opportunityScore <= filters.maxScore!)
  }

  if (filters.search) {
    const query = filters.search.toLowerCase()
    results = results.filter(
      (product) =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    )
  }

  results = [...results]

  switch (filters.sortBy) {
    case "growth":
      results.sort((a, b) => b.tiktok.growthRate30d - a.tiktok.growthRate30d)
      break
    case "newest":
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case "price":
      results.sort((a, b) => b.sellingPrice - a.sellingPrice)
      break
    case "score":
    default:
      results.sort((a, b) => b.opportunityScore - a.opportunityScore)
      break
  }

  return results
}

async function fetchAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to load products from Supabase: ${error.message}`)
  }

  return Promise.all((data as unknown as ProductRow[]).map(mapProduct))
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const products = await fetchAllProducts()
  return applyFiltersAndSort(products, filters)
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load product ${id} from Supabase: ${error.message}`)
  }

  return data ? await mapProduct(data as unknown as ProductRow) : null
}

export async function getProductCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from("products").select("category")

  if (error) {
    throw new Error(`Failed to load product categories from Supabase: ${error.message}`)
  }

  const categories = new Set((data as { category: string }[]).map((row) => row.category))
  return [...categories].sort((a, b) => a.localeCompare(b))
}

export async function getTikTokTrending(filters: ProductFilters = {}): Promise<Product[]> {
  const products = await getProducts({ ...filters, sortBy: "growth" })
  return products.filter((product) => product.tiktok.growthRate30d > 0)
}

export interface AdWithProduct extends MetaAd {
  productId: string
  productTitle: string
  productCategory: string
  productImageUrl: string
}

export async function getAllAds(filters: AdFilters = {}): Promise<AdWithProduct[]> {
  let ads: AdWithProduct[] = MOCK_PRODUCTS.flatMap((product) =>
    product.metaAds.map((ad) => ({
      ...ad,
      productId: product.id,
      productTitle: product.title,
      productCategory: product.category,
      productImageUrl: product.imageUrls[0],
    }))
  )

  if (filters.category) {
    ads = ads.filter((ad) => ad.productCategory === filters.category)
  }

  if (filters.platform) {
    ads = ads.filter((ad) => ad.platforms.includes(filters.platform!))
  }

  if (filters.status && filters.status !== "all") {
    ads = ads.filter((ad) => (filters.status === "active" ? ad.isActive : !ad.isActive))
  }

  if (typeof filters.runtimeMin === "number") {
    ads = ads.filter((ad) => ad.activeSinceDays >= filters.runtimeMin!)
  }

  if (typeof filters.runtimeMax === "number") {
    ads = ads.filter((ad) => ad.activeSinceDays <= filters.runtimeMax!)
  }

  if (filters.search) {
    const query = filters.search.toLowerCase()
    ads = ads.filter(
      (ad) =>
        ad.advertiserName.toLowerCase().includes(query) ||
        ad.adCopy.toLowerCase().includes(query) ||
        ad.productTitle.toLowerCase().includes(query)
    )
  }

  ads.sort((a, b) => b.activeSinceDays - a.activeSinceDays)

  return ads
}

export interface DashboardStats {
  totalProducts: number
  winnerCount: number
  potentialCount: number
  totalActiveAds: number
  avgOpportunityScore: number
  topProducts: Product[]
  risingProducts: Product[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const products = await getProducts({ sortBy: "score" })
  const totalActiveAds = products.reduce(
    (sum, product) => sum + product.metaAds.filter((ad) => ad.isActive).length,
    0
  )
  const avgOpportunityScore = products.length
    ? Math.round(products.reduce((sum, product) => sum + product.opportunityScore, 0) / products.length)
    : 0

  return {
    totalProducts: products.length,
    winnerCount: products.filter((p) => p.opportunityBadge === "WINNER").length,
    potentialCount: products.filter((p) => p.opportunityBadge === "POTENTIAL").length,
    totalActiveAds,
    avgOpportunityScore,
    topProducts: products.slice(0, 5),
    risingProducts: [...products]
      .sort((a, b) => b.tiktok.growthRate30d - a.tiktok.growthRate30d)
      .slice(0, 5),
  }
}
