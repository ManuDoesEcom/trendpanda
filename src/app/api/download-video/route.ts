import { NextResponse, type NextRequest } from "next/server"

/**
 * Streams a remote file back to the browser as a forced download
 * (`Content-Disposition: attachment`), for sources that block direct
 * cross-origin fetch() from the browser (CORS) or hotlinking (Referer
 * checks) — exactly what TikTok's and Meta's CDNs do.
 *
 * Only a fixed allowlist of hosts may be fetched here. Without this,
 * `url` would make this route an open server-side proxy an attacker could
 * use to reach internal/otherwise-unreachable addresses (SSRF).
 */
const ALLOWED_HOSTS = new Set([
  "interactive-examples.mdn.mozilla.net",
  "www.w3schools.com",
  "download.samplelib.com",
])

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url")
  const filenameParam = request.nextUrl.searchParams.get("filename") ?? "download.mp4"
  const safeFilename = filenameParam.replace(/[^\w.\-]+/g, "_") || "download.mp4"

  if (!sourceUrl) {
    return NextResponse.json({ error: "Missing 'url' query parameter." }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(sourceUrl)
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 })
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ error: "URL host is not allowed." }, { status: 403 })
  }

  let upstream: Response
  try {
    upstream = await fetch(parsed.toString())
  } catch {
    return NextResponse.json({ error: "Failed to reach the upstream host." }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `Upstream fetch failed (${upstream.status}).` },
      { status: 502 }
    )
  }

  const headers = new Headers()
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "video/mp4")
  headers.set("Content-Disposition", `attachment; filename="${safeFilename}"`)
  const contentLength = upstream.headers.get("content-length")
  if (contentLength) {
    headers.set("Content-Length", contentLength)
  }

  return new NextResponse(upstream.body, { status: 200, headers })
}
