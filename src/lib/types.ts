export type ProductCategory =
  | "Home & Kitchen"
  | "Beauty & Personal Care"
  | "Pet Supplies"
  | "Fitness & Sports"
  | "Fashion & Accessories"
  | "Electronics & Gadgets"
  | "Baby & Kids"
  | "Outdoor & Garden"

export type OpportunityBadge = "WINNER" | "POTENTIAL" | "SATURATED"

export type AdPlatform = "Facebook" | "Instagram" | "Messenger" | "Audience Network"

export type AdCallToAction =
  | "Shop Now"
  | "Learn More"
  | "Get Offer"
  | "Sign Up"
  | "Buy Now"

export interface TikTokMetrics {
  totalViews: number
  totalLikes: number
  totalShares: number
  totalComments: number
  engagementRate: number
  growthRate30d: number
  videoCount: number
  topHashtags: string[]
  history: DailyMetricPoint[]
}

export interface DailyMetricPoint {
  date: string
  tiktokViews: number
  metaActiveAds: number
}

export interface MetaAd {
  id: string
  advertiserName: string
  advertiserAvatarUrl: string
  adCopy: string
  headline: string
  mediaUrl: string
  mediaType: "image" | "video"
  cta: AdCallToAction
  platforms: AdPlatform[]
  activeSinceDays: number
  isActive: boolean
  estimatedSpend: "Low" | "Medium" | "High"
  landingPageUrl: string
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  category: string
  imageUrls: string[]
  // A directly downloadable TikTok CDN video file, when the importing
  // Apify actor provided one (see scripts/import-apify.ts) — null
  // otherwise, in which case the UI falls back to the cover image.
  downloadableVideoUrl: string | null
  sellingPrice: number
  sourcingCost: number
  tiktok: TikTokMetrics
  metaAds: MetaAd[]
  supplierUrl: string | null
  createdAt: string
  opportunityScore: number
  opportunityBadge: OpportunityBadge
}

export interface ScoringInput {
  tiktokGrowthRate30d: number
  metaActiveAdsCount: number
  avgAdLongevityDays: number
  profitMarginPercent: number
  competitorCount: number
}

export interface ScoringResult {
  score: number
  badge: OpportunityBadge
  breakdown: {
    tiktokGrowthScore: number
    metaActiveAdsScore: number
    adLongevityScore: number
    profitMarginScore: number
    competitionPenalty: number
  }
}

export interface FinancialCalculation {
  sellingPrice: number
  sourcingCost: number
  grossProfit: number
  profitMargin: number
  breakEvenRoas: number
}

export interface Profile {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  planTier: "free" | "pro" | "agency"
  createdAt: string
}

export interface SavedProduct {
  id: string
  userId: string
  productId: string
  collectionName: string
  notes: string | null
  createdAt: string
}

export interface ProductFilters {
  category?: string
  minScore?: number
  maxScore?: number
  badge?: OpportunityBadge
  search?: string
  sortBy?: "score" | "growth" | "newest" | "price"
}

export interface AdFilters {
  runtimeMin?: number
  runtimeMax?: number
  category?: string
  status?: "active" | "inactive" | "all"
  platform?: AdPlatform
  search?: string
}
