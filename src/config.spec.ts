/**
 * Test suite for the configuration
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Config', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses sensible defaults when nothing is configured', async () => {
    vi.stubEnv('PORT', '')
    vi.stubEnv('LOG_LEVEL', '')

    const { Config } = await import('./config.js')

    expect(Config).toEqual({ port: 3000, logLevel: 'info' })
  })

  it('reads the port and the log level from the environment', async () => {
    vi.stubEnv('PORT', '8080')
    vi.stubEnv('LOG_LEVEL', 'debug')

    const { Config } = await import('./config.js')

    expect(Config).toEqual({ port: 8080, logLevel: 'debug' })
  })
})
