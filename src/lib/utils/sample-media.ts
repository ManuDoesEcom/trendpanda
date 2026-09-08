/**
 * Verified, reliably-reachable sample video files used as playback sources
 * for the mock Meta ad creatives in `lib/mock-data.ts` (`buildAds`), which
 * have no live source (see the module comment in `lib/api/data-service.ts`).
 *
 * This is NOT used for TikTok product videos — those use the real TikTok
 * embed via `lib/api/tiktok-video-lookup.ts` and
 * `components/products/tiktok-embed.tsx` instead of any placeholder.
 */
export const SAMPLE_VIDEO_URLS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://download.samplelib.com/mp4/sample-5s.mp4",
  "https://download.samplelib.com/mp4/sample-10s.mp4",
]
