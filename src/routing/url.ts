/** The path of a request URL, without its query string or fragment. */
export function pathnameOf(url: string): string {
  return url.split(/[?#]/, 1)[0]
}

/** Decodes a percent-encoded URL segment, or returns undefined when it is malformed. */
export function decodeSegment(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment)
  } catch {
    return undefined
  }
}
