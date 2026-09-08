import type { Metadata } from "next"
import { getProductCategories, getProducts } from "@/lib/api/data-service"
import { getSavedProductRows } from "@/lib/actions/saved-products"
import type { OpportunityBadge, ProductFilters } from "@/lib/types"
import { ProductFilterBar } from "@/components/filters/product-filter-bar"
import { ProductCard } from "@/components/products/product-card"
import { Radar } from "lucide-react"

export const metadata: Metadata = {
  title: "All-in-One Research — TrendPanda",
}

interface SearchParams {
  category?: string
  badge?: string
  search?: string
  sortBy?: string
}

export default async function AllInOnePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const filters: ProductFilters = {
    category: params.category,
    badge: params.badge as OpportunityBadge | undefined,
    search: params.search,
    sortBy: (params.sortBy as ProductFilters["sortBy"]) ?? "score",
  }

  const [products, categories, savedRows] = await Promise.all([
    getProducts(filters),
    getProductCategories(),
    getSavedProductRows(),
  ])
  const savedIds = new Set(savedRows.map((row) => row.product_id))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">All-in-One Research</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every product, scored across TikTok trend data and Meta ad activity.
        </p>
      </div>

      <ProductFilterBar categories={categories} />

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Radar className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No products match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isSaved={savedIds.has(product.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
