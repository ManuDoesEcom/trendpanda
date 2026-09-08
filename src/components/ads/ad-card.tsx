"use client"

import Image from "next/image"
import Link from "next/link"
import { Download, PlayCircle } from "lucide-react"
import type { MetaAd } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export interface AdCardData extends MetaAd {
  productId?: string
  productTitle?: string
}

const SPEND_TONE: Record<MetaAd["estimatedSpend"], string> = {
  Low: "text-muted-foreground",
  Medium: "text-amber-500",
  High: "text-emerald-500",
}

export function AdCard({ ad }: { ad: AdCardData }) {
  function handleDownload() {
    window.open(ad.mediaUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        <Image src={ad.mediaUrl} alt={ad.headline} fill sizes="(min-width: 768px) 320px, 90vw" className="object-cover" />
        {ad.mediaType === "video" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <PlayCircle className="size-10 text-white/90" />
          </div>
        )}
        <Badge
          variant={ad.isActive ? "default" : "outline"}
          className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm"
        >
          {ad.isActive ? `Active ${ad.activeSinceDays} Days` : `Inactive · ran ${ad.activeSinceDays}d`}
        </Badge>
      </div>

      <CardHeader className="gap-2 pt-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarImage src={ad.advertiserAvatarUrl} alt={ad.advertiserName} />
            <AvatarFallback>{ad.advertiserName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{ad.advertiserName}</p>
            {ad.productTitle && ad.productId ? (
              <Link href={`/products/${ad.productId}`} className="truncate text-xs text-muted-foreground hover:underline">
                {ad.productTitle}
              </Link>
            ) : (
              <p className="truncate text-xs text-muted-foreground">{ad.platforms.join(", ")}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <p className="line-clamp-3 text-sm text-muted-foreground">{ad.adCopy}</p>
        <div className="flex flex-wrap gap-1">
          {ad.platforms.map((platform) => (
            <Badge key={platform} variant="outline" className="text-[10px] text-muted-foreground">
              {platform}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <span className={`text-xs font-medium ${SPEND_TONE[ad.estimatedSpend]}`}>{ad.estimatedSpend} spend</span>
        <Button size="sm" variant="outline" onClick={handleDownload}>
          <Download />
          Download Creative
        </Button>
      </CardFooter>
    </Card>
  )
}
