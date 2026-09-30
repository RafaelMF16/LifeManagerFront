export type PageItem = number | 'gap'

const MAX_UNWINDOWED_PAGES = 7

/**
 * Page buttons to render: first, last, and the current page's neighbours; the rest collapse into
 * a 'gap' ("…"), e.g. 1 … 4 5 6 … 20. A gap that would hide a single page shows that page instead.
 */
export function getPageItems(current: number, total: number): PageItem[] {
  if (total <= MAX_UNWINDOWED_PAGES) return Array.from({ length: total }, (_, index) => index + 1)

  const visible = [...new Set([1, current - 1, current, current + 1, total])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const items: PageItem[] = []
  visible.forEach((page, index) => {
    const previous = visible[index - 1]
    if (previous !== undefined && page - previous === 2) items.push(previous + 1)
    else if (previous !== undefined && page - previous > 2) items.push('gap')
    items.push(page)
  })
  return items
}
