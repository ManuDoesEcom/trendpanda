import type { Metadata } from "next"
import { Archive } from "lucide-react"
import { getAllAds } from "@/lib/api/data-service"
import type { AdFilters } from "@/lib/types"
import { AdsVaultFilters } from "@/components/ads/ads-vault-filters"
import { AdCard } from "@/components/ads/ad-card"

export const metadata: Metadata = {
  title: "Ads Vault — TrendPanda",
}

interface SearchParams {
  status?: string
  search?: string
}

export default async function AdsVaultPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  const filters: AdFilters = {
    status: (params.status as AdFilters["status"]) ?? "all",
    search: params.search,
  }

  const ads = await getAllAds(filters)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold">
          <Archive className="size-5 text-primary" />
          Ads Vault
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every ad creative TrendPanda has indexed, in one browsable place.
        </p>
      </div>

      <AdsVaultFilters />

      <p className="text-xs text-muted-foreground">{ads.length} ads</p>

      {ads.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <Archive className="size-6 text-muted-foreground" />
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
