import type { Metadata } from "next"
import Link from "next/link"
import { Bookmark } from "lucide-react"
import { getProductById } from "@/lib/api/data-service"
import { getSavedProductRows } from "@/lib/actions/saved-products"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"

export const metadata: Metadata = {
  title: "Saved Products — TrendPanda",
}

export default async function SavedPage() {
  const rows = await getSavedProductRows()
  const products = (
    await Promise.all(rows.map((row) => getProductById(row.product_id)))
  ).filter((product): product is Product => product !== null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <Bookmark className="size-5 text-primary" />
          Saved Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Products you&apos;ve bookmarked for a closer look.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-20 text-center">
          <Bookmark className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You haven&apos;t saved any products yet.</p>
          <Button size="sm" nativeButton={false} render={<Link href="/all-in-one" />}>
            Browse products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isSaved />
          ))}
        </div>
      )}
    </div>
  )
}
