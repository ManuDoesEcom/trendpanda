"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Download, Loader2 } from "lucide-react"
import type { MetaAd } from "@/lib/types"
import { downloadFile } from "@/lib/utils/download-file"
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
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload() {
    setIsDownloading(true)
    try {
      const extension = ad.mediaType === "video" ? "mp4" : "jpg"
      await downloadFile(ad.mediaUrl, `${ad.id}.${extension}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card className="overflow-hidden py-0">
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-muted">
        {ad.mediaType === "video" ? (
          <video
            src={ad.mediaUrl}
            poster={`https://picsum.photos/seed/${ad.id}-poster/720/1280`}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Image src={ad.mediaUrl} alt={ad.headline} fill sizes="(min-width: 768px) 320px, 90vw" className="object-cover" />
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
        <Button size="sm" variant="outline" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
          Download Creative
        </Button>
      </CardFooter>
    </Card>
  )
}
