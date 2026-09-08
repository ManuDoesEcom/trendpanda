import { cn } from "cn"

/**
 * Embeds the real TikTok video via TikTok's own embed player
 * (`https://www.tiktok.com/embed/v2/{videoId}` — the same document
 * TikTok's official `embed.js` blockquote widget ultimately loads into an
 * iframe). No placeholder/sample video is ever used here.
 *
 * Note on 16:9: TikTok's embed is an interactive widget with its own
 * internal (portrait) layout that TikTok controls, not a bare <video> — it
 * cannot be cropped with `object-fit` the way a plain video file can. The
 * outer container below is still strictly `aspect-video` as required
 * everywhere in the app; the iframe fills that box and TikTok's player
 * scales itself within it.
 */
export function TikTokEmbed({
  videoId,
  title,
  className,
  lazy = true,
}: {
  videoId: string
  title: string
  className?: string
  lazy?: boolean
}) {
  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-lg bg-black", className)}>
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        title={title}
        allow="autoplay; encrypted-media; fullscreen"
        allowFullScreen
        loading={lazy ? "lazy" : undefined}
        className="absolute inset-0 size-full border-0 object-cover"
      />
    </div>
  )
}
