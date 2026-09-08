import Image from "next/image"
import Link from "next/link"
import { ImageOff, Megaphone, TrendingDown, TrendingUp } from "lucide-react"
import type { Product } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OpportunityBadgePill } from "@/components/products/opportunity-badge"
import { SaveButton } from "@/components/products/save-button"
import { formatCurrency, formatCompactNumber } from "@/lib/utils/financial"
import { cn } from "cn"

export function ProductCard({ product, isSaved = false }: { product: Product; isSaved?: boolean }) {
  const growthPositive = product.tiktok.growthRate30d >= 0
  const activeAds = product.metaAds.filter((ad) => ad.isActive).length

  return (
    <Card className="group/product-card overflow-hidden py-0">
      <Link href={`/products/${product.id}`} className="relative block aspect-video overflow-hidden bg-muted">
        {product.tiktokVideoId ? (
          <iframe
            src={`https://www.tiktok.com/embed/v2/${product.tiktokVideoId}`}
            title={product.title}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 size-full border-0 object-cover"
          />
        ) : product.imageUrls[0] ? (
          <Image
            src={product.imageUrls[0]}
            alt={product.title}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover/product-card:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-6 text-muted-foreground" />
          </div>
        )}
        <OpportunityBadgePill badge={product.opportunityBadge} score={product.opportunityScore} className="absolute top-2 left-2" />
        <div className="absolute top-2 right-2">
          <SaveButton productId={product.id} initialSaved={isSaved} variant="secondary" size="icon" />
        </div>
      </Link>
      <CardContent className="flex flex-col gap-2 pt-3">
        <Badge variant="outline" className="w-fit text-[11px] text-muted-foreground">
          {product.category}
        </Badge>
        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 font-heading text-sm font-medium leading-snug hover:underline">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{formatCurrency(product.sellingPrice)}</span>
          <span className="text-xs text-muted-foreground">
            Cost {formatCurrency(product.sourcingCost)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 border-t bg-muted/40 py-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className={cn("flex items-center gap-0.5 font-medium", growthPositive ? "text-emerald-500" : "text-destructive")}>
            {growthPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {Math.abs(product.tiktok.growthRate30d)}%
          </span>
          <span className="text-muted-foreground">{formatCompactNumber(product.tiktok.totalViews)} views</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
          <Megaphone className="size-3.5" />
          {activeAds} active ads
        </div>
      </CardFooter>
    </Card>
  )
}
