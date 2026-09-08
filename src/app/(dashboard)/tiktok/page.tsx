import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Music2, TrendingDown, TrendingUp } from "lucide-react"
import { getProductCategories, getProducts } from "@/lib/api/data-service"
import type { OpportunityBadge, ProductFilters } from "@/lib/types"
import { ProductFilterBar } from "@/components/filters/product-filter-bar"
import { OpportunityBadgePill } from "@/components/products/opportunity-badge"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCompactNumber, formatPercent } from "@/lib/utils/financial"
import { cn } from "cn"

export const metadata: Metadata = {
  title: "TikTok Explorer — TrendPanda",
}

interface SearchParams {
  category?: string
  badge?: string
  search?: string
  sortBy?: string
}

export default async function TikTokExplorerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const filters: ProductFilters = {
    category: params.category,
    badge: params.badge as OpportunityBadge | undefined,
    search: params.search,
    sortBy: (params.sortBy as ProductFilters["sortBy"]) ?? "growth",
  }

  const [products, categories] = await Promise.all([getProducts(filters), getProductCategories()])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <Music2 className="size-5 text-primary" />
          TikTok Trend Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Products ranked by 30-day TikTok view growth and engagement.
        </p>
      </div>

      <ProductFilterBar categories={categories} />

      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-64">Product</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Engagement</TableHead>
              <TableHead>30d Growth</TableHead>
              <TableHead>Top hashtags</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const positive = product.tiktok.growthRate30d >= 0
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link href={`/products/${product.id}`} className="flex items-center gap-3">
                      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.tiktokVideoId ? (
                          <iframe
                            src={`https://www.tiktok.com/embed/v2/${product.tiktokVideoId}`}
                            title={product.title}
                            allow="autoplay; encrypted-media; fullscreen"
                            allowFullScreen
                            loading="lazy"
                            className="absolute inset-0 size-full border-0 object-cover"
                          />
                        ) : (
                          product.imageUrls[0] && (
                            <Image src={product.imageUrls[0]} alt={product.title} fill sizes="160px" className="object-cover" />
                          )
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium hover:underline">{product.title}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>{formatCompactNumber(product.tiktok.totalViews)}</TableCell>
                  <TableCell>{formatPercent(product.tiktok.engagementRate)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "flex items-center gap-1 font-medium",
                        positive ? "text-emerald-500" : "text-destructive"
                      )}
                    >
                      {positive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                      {formatPercent(Math.abs(product.tiktok.growthRate30d), 0)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.tiktok.topHashtags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] text-muted-foreground">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <OpportunityBadgePill badge={product.opportunityBadge} score={product.opportunityScore} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
