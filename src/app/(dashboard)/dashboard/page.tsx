import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Flame, Megaphone, Sprout, TrendingUp } from "lucide-react"
import { getDashboardStats } from "@/lib/api/data-service"
import { getSavedProductRows } from "@/lib/actions/saved-products"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Dashboard — TrendPanda",
}

export default async function DashboardPage() {
  const [stats, savedRows] = await Promise.all([getDashboardStats(), getSavedProductRows()])
  const savedIds = new Set(savedRows.map((row) => row.product_id))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of today&apos;s highest-opportunity products.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Tracked products" value={String(stats.totalProducts)} icon={TrendingUp} />
        <StatCard
          label="Winners"
          value={String(stats.winnerCount)}
          icon={Flame}
          tone="positive"
          hint={`${stats.potentialCount} potential`}
        />
        <StatCard label="Active Meta ads" value={String(stats.totalActiveAds)} icon={Megaphone} />
        <StatCard
          label="Avg. opportunity score"
          value={`${stats.avgOpportunityScore}/100`}
          icon={Sprout}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Top opportunities</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/all-in-one" />}>
            View all
            <ArrowRight />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.topProducts.map((product) => (
            <ProductCard key={product.id} product={product} isSaved={savedIds.has(product.id)} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Rising on TikTok</h2>
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/tiktok" />}>
            View all
            <ArrowRight />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.risingProducts.map((product) => (
            <ProductCard key={product.id} product={product} isSaved={savedIds.has(product.id)} />
          ))}
        </div>
      </section>
    </div>
  )
}
