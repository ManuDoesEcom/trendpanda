function triggerAnchorDownload(href: string, filename: string) {
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

/**
 * Downloads `url` as `filename`. Tries a direct browser fetch → blob first
 * (works when the source sends permissive CORS headers); if that fetch is
 * blocked (CORS) or fails outright, falls back to `/api/download-video`,
 * which fetches the file server-side (no CORS involved) and streams it
 * back with a `Content-Disposition: attachment` header.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Fetch failed with status ${response.status}`)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    triggerAnchorDownload(objectUrl, filename)
    URL.revokeObjectURL(objectUrl)
    return
  } catch {
    // Direct fetch blocked (CORS) or failed — fall back to the server proxy.
  }

  const proxyUrl = `/api/download-video?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
  triggerAnchorDownload(proxyUrl, filename)
}
