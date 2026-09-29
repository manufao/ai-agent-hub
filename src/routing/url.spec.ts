/**
 * Test suite for URL helpers
 */

import { describe, expect, it } from 'vitest'
import { decodeSegment, pathnameOf } from './url.js'

describe('pathnameOf', () => {
  it('returns the path unchanged when there is no query or fragment', () => {
    expect(pathnameOf('/agents/architect')).toBe('/agents/architect')
  })

  it('drops the query string and the fragment', () => {
    expect(pathnameOf('/agents/architect?ref=x')).toBe('/agents/architect')
    expect(pathnameOf('/skills#top')).toBe('/skills')
  })
})

describe('decodeSegment', () => {
  it('decodes a percent-encoded segment', () => {
    expect(decodeSegment('c%23-tips')).toBe('c#-tips')
  })

  it('returns undefined for a malformed percent-encoding', () => {
    expect(decodeSegment('%E0%A4%A')).toBeUndefined()
  })
})
