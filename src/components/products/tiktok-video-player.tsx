"use client"

import { useRef, useState } from "react"
import { Play } from "lucide-react"
import { cn } from "cn"

/**
 * Real HTML5 <video> playback of a downloaded TikTok CDN file
 * (`product.downloadableVideoUrl`). Only ever rendered when that URL
 * exists — no iframe embed, no placeholder clip. `object-contain` on a
 * dark background shows the full frame, uncropped, inside the strict
 * 16:9 container instead of TikTok's native vertical crop.
 */
export function TikTokVideoPlayer({
  videoUrl,
  posterUrl,
  title,
  className,
}: {
  videoUrl: string
  posterUrl?: string | null
  title: string
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  function handlePlayClick() {
    videoRef.current?.play()
  }

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg bg-black", className)}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl ?? undefined}
        playsInline
        loop
        controls
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="absolute inset-0 size-full bg-black object-contain"
      >
        Your browser does not support embedded video.
      </video>

      {!isPlaying && (
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={`Play ${title}`}
          className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/35"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105">
            <Play className="size-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  )
}
