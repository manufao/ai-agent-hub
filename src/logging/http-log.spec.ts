/**
 * Test suite for the HTTP log helpers
 */

import { describe, expect, it } from 'vitest'
import { loggableUrl, routeFamily } from './http-log.js'

describe('routeFamily', () => {
  it.each([
    ['/agents', 'agents'],
    ['/agents/atlas-product', 'agents'],
    ['/skills/ingenierie/test-plan', 'skills'],
    ['/examples/create-skill-or-agent/references/x', 'examples'],
    ['/css/output.css', 'static'],
    ['/js/app.js', 'static'],
    ['/images/logo.png', 'static'],
    ['/LICENSE', 'license'],
    ['/agentsx', 'unmatched'],
    ['/nope', 'unmatched'],
  ])('maps %s to %s', (url, family) => {
    expect(routeFamily(url)).toBe(family)
  })

  it('ignores the query string and defaults to the root for an undefined URL', () => {
    expect(routeFamily('/agents/x?secret=1')).toBe('agents')
    expect(routeFamily(undefined)).toBe('unmatched')
  })

  it('never contains what the visitor typed', () => {
    expect(routeFamily('/agents/<script>alert(1)</script>')).toBe('agents')
  })
})

describe('loggableUrl', () => {
  it('keeps a plain path and drops the query string', () => {
    expect(loggableUrl('/skills/ingenierie/test-plan?token=abc')).toBe('/skills/ingenierie/test-plan')
  })

  it('defaults to the root for an undefined URL', () => {
    expect(loggableUrl(undefined)).toBe('/')
  })

  it.each(['/css/../../package.json', '/agents/<script>', '/agents/a%20b', '/agents/é'])(
    'redacts the unsafe path %s',
    url => {
      expect(loggableUrl(url)).toBe('[redacted]')
    },
  )

  it('redacts a path that is too long', () => {
    expect(loggableUrl(`/agents/${'a'.repeat(300)}`)).toBe('[redacted]')
  })
})
