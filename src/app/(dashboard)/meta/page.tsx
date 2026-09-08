import type { Metadata } from "next"
import { Megaphone } from "lucide-react"
import { getAllAds } from "@/lib/api/data-service"
import type { AdFilters, AdPlatform } from "@/lib/types"
import { MetaFilterBar } from "@/components/filters/meta-filter-bar"
import { AdCard } from "@/components/ads/ad-card"

export const metadata: Metadata = {
  title: "Meta Ad Library Explorer — TrendPanda",
}

interface SearchParams {
  category?: string
  status?: string
  platform?: string
  search?: string
  runtimeMin?: string
  runtimeMax?: string
}

export default async function MetaExplorerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const filters: AdFilters = {
    category: params.category,
    status: (params.status as AdFilters["status"]) ?? "all",
    platform: params.platform as AdPlatform | undefined,
    search: params.search,
    runtimeMin: params.runtimeMin ? Number(params.runtimeMin) : undefined,
    runtimeMax: params.runtimeMax ? Number(params.runtimeMax) : undefined,
  }

  const ads = await getAllAds(filters)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <Megaphone className="size-5 text-primary" />
          Meta Ad Library Explorer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filter live ad creatives by niche, runtime, and status to spot durable offers.
        </p>
      </div>

      <MetaFilterBar />

      <p className="text-xs text-muted-foreground">{ads.length} ads found</p>

      {ads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Megaphone className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No ads match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      )}
    </div>
  )
}
