/**
 * The export's name when the response doesn't say (no readable `Content-Disposition`): the backend's own pattern,
 * `lifemanager-yyyy-MM-dd.json`, with the browser's local date.
 */
export function exportFallbackFileName(now: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `lifemanager-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`
}
