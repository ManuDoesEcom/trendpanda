"use client"

import { useCallback, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"
import type { OpportunityBadge } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const BADGES: OpportunityBadge[] = ["WINNER", "POTENTIAL", "SATURATED"]

export function ProductFilterBar({ categories }: { categories: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

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

  const hasFilters = Boolean(
    searchParams.get("category") || searchParams.get("badge") || searchParams.get("search")
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setParam("search", search || null)
        }}
        className="relative flex-1 min-w-48"
      >
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onBlur={() => setParam("search", search || null)}
          placeholder="Search products..."
          className="pl-8"
        />
      </form>

      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(value) => setParam("category", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("badge") ?? "all"}
        onValueChange={(value) => setParam("badge", value === "all" ? null : value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Score" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All scores</SelectItem>
          {BADGES.map((badge) => (
            <SelectItem key={badge} value={badge}>
              {badge}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sortBy") ?? "score"}
        onValueChange={(value) => setParam("sortBy", value === "score" ? null : value)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score">Opportunity score</SelectItem>
          <SelectItem value="growth">TikTok growth</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price">Price</SelectItem>
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
  )
}
