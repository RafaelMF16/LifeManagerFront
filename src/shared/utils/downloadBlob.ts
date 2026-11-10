/**
 * The file name in a `Content-Disposition` header (`filename*=UTF-8''...` preferred, then `filename=...`), or
 * `fallback` when it has none. Only the name is kept: no folder can come from the server.
 */
export function fileNameFromContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback

  const encoded = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header)?.[1]
  let name: string | undefined
  if (encoded) {
    try {
      name = decodeURIComponent(encoded.trim())
    } catch {
      name = undefined
    }
  }

  name ??= /filename\s*=\s*"([^"]*)"/i.exec(header)?.[1] ?? /filename\s*=\s*([^;]+)/i.exec(header)?.[1]?.trim()

  const safe = name?.split(/[/\\]/).pop()?.trim()
  return safe ? safe : fallback
}

/** Saves a blob as a download, through a temporary link (the browser keeps no object URL afterwards). */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  // After the click's task: revoking right away can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
