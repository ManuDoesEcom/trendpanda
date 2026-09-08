"use client"

import { useCallback, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import { CATEGORIES } from "@/lib/mock-data"
import type { AdPlatform } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PLATFORMS: AdPlatform[] = ["Facebook", "Instagram", "Messenger", "Audience Network"]
const MAX_RUNTIME = 90

export function MetaFilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

  const runtimeMin = Number(searchParams.get("runtimeMin") ?? 0)
  const runtimeMax = Number(searchParams.get("runtimeMax") ?? MAX_RUNTIME)

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  const setRuntime = useCallback(
    (rawValue: number | readonly number[]) => {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue as number, rawValue as number]
      const params = new URLSearchParams(searchParams.toString())
      const [min, max] = values
      if (min > 0) {
        params.set("runtimeMin", String(min))
      } else {
        params.delete("runtimeMin")
      }
      if (max < MAX_RUNTIME) {
        params.set("runtimeMax", String(max))
      } else {
        params.delete("runtimeMax")
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  const hasFilters = Boolean(
    searchParams.get("category") ||
      searchParams.get("status") ||
      searchParams.get("platform") ||
      searchParams.get("search") ||
      searchParams.get("runtimeMin") ||
      searchParams.get("runtimeMax")
  )

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card/50 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setParam("search", search || null)
          }}
          className="relative min-w-48 flex-1"
        >
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onBlur={() => setParam("search", search || null)}
            placeholder="Search advertiser or ad copy..."
            className="pl-8"
          />
        </form>

        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => setParam("category", value === "all" ? null : value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Niche" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All niches</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) => setParam("status", value === "all" ? null : value)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("platform") ?? "all"}
          onValueChange={(value) => setParam("platform", value === "all" ? null : value)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("")
              router.push(pathname, { scroll: false })
            }}
          >
            <X />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2 sm:max-w-sm">
        <div className="flex items-center justify-between">
          <Label>Ad runtime</Label>
          <span className="text-xs text-muted-foreground">
            {runtimeMin}–{runtimeMax === MAX_RUNTIME ? `${MAX_RUNTIME}+` : runtimeMax} days
          </span>
        </div>
        <Slider
          value={[runtimeMin, runtimeMax]}
          min={0}
          max={MAX_RUNTIME}
          step={1}
          onValueChange={setRuntime}
        />
      </div>
    </div>
  )
}
