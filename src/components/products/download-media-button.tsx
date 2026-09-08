"use client"

import { useState, type MouseEvent } from "react"
import { Download, ImageDown, Loader2 } from "lucide-react"
import { downloadFile } from "@/lib/utils/download-file"
import { Button } from "@/components/ui/button"

/**
 * Downloads either a real video file (`kind: "video"`) or, when no real
 * video exists for a product, its cover/thumbnail image (`kind: "image"`)
 * as an honest fallback — the button and its label always reflect what's
 * actually being downloaded, never claims a video when it's an image.
 */
export function DownloadMediaButton({
  url,
  filename,
  kind,
  variant = "outline",
  size = "sm",
}: {
  url: string
  filename: string
  kind: "video" | "image"
  variant?: "outline" | "secondary" | "ghost"
  size?: "sm" | "default" | "icon"
}) {
  const [isDownloading, setIsDownloading] = useState(false)
  const label = kind === "video" ? "Download Video" : "Download Thumbnail"

  async function handleClick(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    setIsDownloading(true)
    try {
      await downloadFile(url, filename)
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
      aria-label={label}
      className={size === "icon" ? undefined : "gap-1.5"}
    >
      {isDownloading ? (
        <Loader2 className="animate-spin" />
      ) : kind === "video" ? (
        <Download />
      ) : (
        <ImageDown />
      )}
      {size !== "icon" && label}
    </Button>
  )
}
