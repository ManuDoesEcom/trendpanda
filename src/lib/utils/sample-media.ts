/**
 * Verified, reliably-reachable sample video files used as playback sources
 * wherever a real TikTok/Meta CDN video URL would otherwise be needed.
 *
 * Those CDN URLs are signed, expire within days, and are blocked from
 * direct cross-origin <video> playback via Referer/CORS checks — hotlinking
 * them from this app fails even though the URL "looks" valid. Every URL
 * below was verified reachable with a real `video/mp4` content type before
 * being added here.
 */
export const SAMPLE_VIDEO_URLS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://download.samplelib.com/mp4/sample-5s.mp4",
  "https://download.samplelib.com/mp4/sample-10s.mp4",
]

/**
 * Deterministically picks a sample video for a given seed (e.g. a product
 * or ad id) so the same entity always renders the same clip across
 * requests/renders.
 */
export function pickSampleVideo(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return SAMPLE_VIDEO_URLS[hash % SAMPLE_VIDEO_URLS.length]
}
