import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  ImageOff,
  MessageCircle,
  Share2,
  Video,
} from "lucide-react"
import { getProductById, getProducts } from "@/lib/api/data-service"
import { isProductSaved } from "@/lib/actions/saved-products"
import { scoreFromProduct } from "@/lib/utils/scoring"
import { OpportunityBadgePill } from "@/components/products/opportunity-badge"
import { SaveButton } from "@/components/products/save-button"
import { FinancialCalculator } from "@/components/products/financial-calculator"
import { TrendChart } from "@/components/products/trend-chart"
import { TikTokEmbed } from "@/components/products/tiktok-embed"
import { DownloadMediaButton } from "@/components/products/download-media-button"
import { AdCard } from "@/components/ads/ad-card"
import { ProductCard } from "@/components/products/product-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { calculateFinancials, formatCompactNumber, formatCurrency, formatPercent } from "@/lib/utils/financial"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  return { title: product ? `${product.title} — TrendPanda` : "Product not found — TrendPanda" }
}

const SCORE_BREAKDOWN_LABELS: Record<string, string> = {
  tiktokGrowthScore: "TikTok Growth (25%)",
  metaActiveAdsScore: "Meta Active Ads (25%)",
  adLongevityScore: "Ad Longevity (20%)",
  profitMarginScore: "Profit Margin (15%)",
  competitionPenalty: "Competition Penalty (15%)",
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  const [saved, related] = await Promise.all([
    isProductSaved(product.id),
    getProducts({ category: product.category, sortBy: "score" }),
  ])

  const competitorCount = Math.max(2, Math.round((100 - product.opportunityScore) / 6))
  const { breakdown } = scoreFromProduct({
    sellingPrice: product.sellingPrice,
    sourcingCost: product.sourcingCost,
    tiktok: product.tiktok,
    metaAds: product.metaAds,
    competitorCount,
  })
  const activeAds = product.metaAds.filter((ad) => ad.isActive)
  const relatedProducts = related.filter((item) => item.id !== product.id).slice(0, 4)
  const financials = calculateFinancials(product.sellingPrice, product.sourcingCost)

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" nativeButton={false} render={<Link href="/all-in-one" />}>
        <ArrowLeft />
        Back to research
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          {product.tiktokVideoId ? (
            <TikTokEmbed videoId={product.tiktokVideoId} title={product.title} lazy={false} />
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {product.imageUrls.length > 0 ? (
                product.imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className={`relative aspect-video overflow-hidden rounded-lg bg-muted ${index === 0 ? "col-span-3" : ""}`}
                  >
                    <Image
                      src={url}
                      alt={`${product.title} image ${index + 1}`}
                      fill
                      sizes={index === 0 ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 240px, 45vw"}
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <ImageOff className="size-8 text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          {product.downloadableVideoUrl ? (
            <div className="flex justify-end">
              <DownloadMediaButton
                url={product.downloadableVideoUrl}
                filename={`${product.slug}.mp4`}
                kind="video"
              />
            </div>
          ) : (
            product.imageUrls[0] && (
              <div className="flex justify-end">
                <DownloadMediaButton
                  url={product.imageUrls[0]}
                  filename={`${product.slug}.jpg`}
                  kind="image"
                />
              </div>
            )
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{product.category}</Badge>
              <OpportunityBadgePill badge={product.opportunityBadge} score={product.opportunityScore} />
            </div>
            <h1 className="mt-2 font-heading text-2xl font-semibold">{product.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Eye} label="Views" value={formatCompactNumber(product.tiktok.totalViews)} />
            <StatTile icon={Heart} label="Likes" value={formatCompactNumber(product.tiktok.totalLikes)} />
            <StatTile icon={Share2} label="Shares" value={formatCompactNumber(product.tiktok.totalShares)} />
            <StatTile icon={MessageCircle} label="Comments" value={formatCompactNumber(product.tiktok.totalComments)} />
          </div>

          <TrendChart history={product.tiktok.history} />

          <Card>
            <CardContent className="flex flex-col gap-4">
              <h2 className="font-heading text-base font-medium">Opportunity score breakdown</h2>
              {Object.entries(breakdown).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{SCORE_BREAKDOWN_LABELS[key]}</span>
                    <span className="font-medium">{value}/100</span>
                  </div>
                  <Progress value={value} />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">
                Meta ads ({activeAds.length} active of {product.metaAds.length})
              </h2>
              <Video className="size-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {product.metaAds.map((ad) => (
                <AdCard key={ad.id} ad={{ ...ad, productId: product.id, productTitle: product.title }} />
              ))}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold">More in {product.category}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-heading text-2xl font-semibold">{formatCurrency(product.sellingPrice)}</span>
                <SaveButton productId={product.id} initialSaved={saved} />
              </div>
              <p className="text-xs text-muted-foreground">
                Sourcing cost {formatCurrency(product.sourcingCost)} · Margin{" "}
                {formatPercent(financials.profitMargin)}
              </p>
              {product.supplierUrl && (
                <Button variant="outline" className="w-full" nativeButton={false} render={<a href={product.supplierUrl} target="_blank" rel="noopener noreferrer" />}>
                  View supplier listing
                  <ExternalLink />
                </Button>
              )}
            </CardContent>
          </Card>

          <FinancialCalculator initialSellingPrice={product.sellingPrice} initialSourcingCost={product.sourcingCost} />
        </div>
      </div>
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye
  label: string
  value: string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-2.5">
        <Icon className="size-4 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{value}</span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}
