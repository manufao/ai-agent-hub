import { isSafeSegment } from '../content/paths.js'
import { pathnameOf } from '../routing/url.js'

const MAX_LOGGED_PATH_LENGTH = 200

const ROUTE_FAMILIES: Array<[RegExp, string]> = [
  [/^\/agents(\/|$)/, 'agents'],
  [/^\/skills(\/|$)/, 'skills'],
  [/^\/examples(\/|$)/, 'examples'],
  [/^\/(css|js|images)\//, 'static'],
  [/^\/LICENSE$/, 'license'],
]

/** The route family of a request URL (`agents`, `skills`, ...), so a 404 is logged without the value the visitor typed. */
export function routeFamily(url: string | undefined): string {
  const pathname = pathnameOf(url || '/')
  return ROUTE_FAMILIES.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'unmatched'
}

/**
 * The path of a request URL for a log line: no query string, and `[redacted]`
 * unless every segment is a plain, short filesystem-safe name.
 */
export function loggableUrl(url: string | undefined): string {
  const pathname = pathnameOf(url || '/')
  const isPlain =
    pathname.length <= MAX_LOGGED_PATH_LENGTH &&
    pathname.split('/').every(segment => segment === '' || isSafeSegment(segment))
  return isPlain ? pathname : '[redacted]'
}
