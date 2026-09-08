"use client"

import { useState, type MouseEvent } from "react"
import { Download, Loader2 } from "lucide-react"
import { downloadFile } from "@/lib/utils/download-file"
import { Button } from "@/components/ui/button"

/**
 * Only ever rendered when `videoUrl` is a real, directly downloadable file
 * (see the `downloadableVideoUrl` comment on the Product type) — never
 * shown as a disabled placeholder for products with no real source.
 */
export function DownloadVideoButton({
  videoUrl,
  filename,
  variant = "outline",
  size = "sm",
}: {
  videoUrl: string
  filename: string
  variant?: "outline" | "secondary" | "ghost"
  size?: "sm" | "default" | "icon"
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleClick(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    setIsDownloading(true)
    try {
      await downloadFile(videoUrl, filename)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isDownloading}
      aria-label="Download video"
      className={size === "icon" ? undefined : "gap-1.5"}
    >
      {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
      {size !== "icon" && "Download Video"}
    </Button>
  )
}
