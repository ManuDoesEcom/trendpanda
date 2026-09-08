"use client"

import { useRef, useState } from "react"
import { ExternalLink, Play } from "lucide-react"
import { cn } from "cn"

export function TikTokVideoPlayer({
  videoUrl,
  posterUrl,
  watchUrl,
  title,
  className,
}: {
  videoUrl: string
  posterUrl?: string | null
  watchUrl?: string | null
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
        className="absolute inset-0 size-full object-cover"
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

      {watchUrl && (
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="absolute right-2 bottom-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-black/80"
        >
          <ExternalLink className="size-3" />
          View on TikTok
        </a>
      )}
    </div>
  )
}
