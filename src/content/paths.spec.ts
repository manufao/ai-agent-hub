/**
 * Test suite for path helpers
 */

import { describe, expect, it } from 'vitest'
import { isSafeSegment } from './paths.js'

describe('isSafeSegment', () => {
  it('accepts a simple kebab-case name', () => {
    expect(isSafeSegment('my-skill')).toBe(true)
  })

  it('accepts a name with dots (e.g. a slug ending in an extension-like suffix)', () => {
    expect(isSafeSegment('vitest-unit-test.reference')).toBe(true)
  })

  it('rejects a path separator', () => {
    expect(isSafeSegment('foo/bar')).toBe(false)
  })

  it('rejects a lone dot', () => {
    expect(isSafeSegment('.')).toBe(false)
  })

  it('rejects a parent directory reference', () => {
    expect(isSafeSegment('..')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isSafeSegment('')).toBe(false)
  })
})
