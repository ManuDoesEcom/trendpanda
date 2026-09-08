import type { OpportunityBadge, Product, ScoringInput, ScoringResult } from "@/lib/types"

const WEIGHTS = {
  tiktokGrowth: 0.25,
  metaActiveAds: 0.25,
  adLongevity: 0.2,
  profitMargin: 0.15,
  competitionPenalty: 0.15,
} as const

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value))

/**
 * Normalizes TikTok 30d growth rate (%) onto a 0-100 scale.
 * 100%+ growth maps to a full score.
 */
function scoreTikTokGrowth(growthRate30d: number): number {
  return clamp((growthRate30d / 100) * 100)
}

/**
 * Normalizes active Meta ad count onto a 0-100 scale.
 * 20+ concurrently running ads is treated as saturation-level demand signal.
 */
function scoreMetaActiveAds(activeAdsCount: number): number {
  return clamp((activeAdsCount / 20) * 100)
}

/**
 * Normalizes average ad runtime (days) onto a 0-100 scale.
 * Ads still running past 45 days are strong evidence of a profitable, durable offer.
 */
function scoreAdLongevity(avgAdLongevityDays: number): number {
  return clamp((avgAdLongevityDays / 45) * 100)
}

/**
 * Normalizes profit margin (%) onto a 0-100 scale, capped at a 70% margin.
 */
function scoreProfitMargin(profitMarginPercent: number): number {
  return clamp((profitMarginPercent / 70) * 100)
}

/**
 * Penalizes crowded niches. Beyond 15 known competitors selling the same
 * product, the penalty maxes out.
 */
function scoreCompetitionPenalty(competitorCount: number): number {
  return clamp((competitorCount / 15) * 100)
}

function resolveBadge(score: number): OpportunityBadge {
  if (score >= 70) return "WINNER"
  if (score >= 40) return "POTENTIAL"
  return "SATURATED"
}

export function calculateOpportunityScore(input: ScoringInput): ScoringResult {
  const tiktokGrowthScore = scoreTikTokGrowth(input.tiktokGrowthRate30d)
  const metaActiveAdsScore = scoreMetaActiveAds(input.metaActiveAdsCount)
  const adLongevityScore = scoreAdLongevity(input.avgAdLongevityDays)
  const profitMarginScore = scoreProfitMargin(input.profitMarginPercent)
  const competitionPenalty = scoreCompetitionPenalty(input.competitorCount)

  const weightedScore =
    tiktokGrowthScore * WEIGHTS.tiktokGrowth +
    metaActiveAdsScore * WEIGHTS.metaActiveAds +
    adLongevityScore * WEIGHTS.adLongevity +
    profitMarginScore * WEIGHTS.profitMargin -
    competitionPenalty * WEIGHTS.competitionPenalty

  const score = Math.round(clamp(weightedScore))

  return {
    score,
    badge: resolveBadge(score),
    breakdown: {
      tiktokGrowthScore: Math.round(tiktokGrowthScore),
      metaActiveAdsScore: Math.round(metaActiveAdsScore),
      adLongevityScore: Math.round(adLongevityScore),
      profitMarginScore: Math.round(profitMarginScore),
      competitionPenalty: Math.round(competitionPenalty),
    },
  }
}

export function scoreFromProduct(
  product: Pick<Product, "sellingPrice" | "sourcingCost" | "tiktok" | "metaAds"> & {
    competitorCount: number
  }
): ScoringResult {
  const activeAds = product.metaAds.filter((ad) => ad.isActive)
  const avgAdLongevityDays = product.metaAds.length
    ? product.metaAds.reduce((sum, ad) => sum + ad.activeSinceDays, 0) / product.metaAds.length
    : 0
  const profitMarginPercent =
    product.sellingPrice > 0
      ? ((product.sellingPrice - product.sourcingCost) / product.sellingPrice) * 100
      : 0

  return calculateOpportunityScore({
    tiktokGrowthRate30d: product.tiktok.growthRate30d,
    metaActiveAdsCount: activeAds.length,
    avgAdLongevityDays,
    profitMarginPercent,
    competitorCount: product.competitorCount,
  })
}

export function badgeVariant(badge: OpportunityBadge): "default" | "secondary" | "destructive" {
  switch (badge) {
    case "WINNER":
      return "default"
    case "POTENTIAL":
      return "secondary"
    case "SATURATED":
      return "destructive"
  }
}
