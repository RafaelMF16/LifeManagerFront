// The auth e-mails link to `/auth/set-password?token=…` and `/auth/reset-password?token=…`.
const TOKEN_PARAM = 'token'

export function readEmailLinkToken(search: string): string | null {
  return new URLSearchParams(search).get(TOKEN_PARAM) || null
}

/**
 * The current address without the token (path, other parameters and hash kept), for `history.replaceState`: the token
 * is a credential, so it must not stay in the history or leak in a Referer.
 */
export function withoutEmailLinkToken(href: string): string {
  const url = new URL(href)
  url.searchParams.delete(TOKEN_PARAM)
  return `${url.pathname}${url.search}${url.hash}`
}
