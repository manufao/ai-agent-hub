/**
 * Test suite for the server startup
 */

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { logger } from './logging/logger.js'

vi.mock('fs', () => ({
  statSync: vi.fn(),
}))

vi.mock('./main.js', () => ({
  default: vi.fn(),
}))

const directory = { isDirectory: () => true }

describe('startServer', () => {
  let startServer: typeof import('./start.js').startServer
  let mockStatSync: Mock
  let mockMain: Mock
  let server: { on: Mock; listen: Mock }

  beforeEach(async () => {
    vi.clearAllMocks()

    mockStatSync = (await import('fs')).statSync as Mock
    mockMain = (await import('./main.js')).default as unknown as Mock
    server = { on: vi.fn(), listen: vi.fn() }
    mockMain.mockReturnValue(server)
    mockStatSync.mockReturnValue(directory)

    startServer = (await import('./start.js')).startServer
  })

  afterEach(() => {
    process.exitCode = undefined
  })

  it.each([Number.NaN, -1, 70000, 1.5])('refuses the invalid port %s', port => {
    const logError = vi.spyOn(logger, 'error')

    expect(startServer(port)).toBeUndefined()

    expect(logError).toHaveBeenCalledWith({ port: String(port) }, 'startup.invalid_port')
    expect(process.exitCode).toBe(1)
    expect(mockMain).not.toHaveBeenCalled()
  })

  it('refuses to start when a content directory is missing', () => {
    const logError = vi.spyOn(logger, 'error')
    mockStatSync.mockImplementation((path: string) => (path.endsWith('examples') ? undefined : directory))

    expect(startServer(3000)).toBeUndefined()

    expect(logError).toHaveBeenCalledWith({ missing: ['examples'] }, 'startup.content_dir_missing')
    expect(process.exitCode).toBe(1)
    expect(mockMain).not.toHaveBeenCalled()
  })

  it('listens on the given port and logs it', () => {
    const logInfo = vi.spyOn(logger, 'info')

    expect(startServer(4000)).toBe(server)

    expect(server.listen).toHaveBeenCalledWith(4000, expect.any(Function))
    server.listen.mock.calls[0][1]()
    expect(logInfo).toHaveBeenCalledWith({ port: 4000 }, 'startup.listening')
    expect(process.exitCode).toBeUndefined()
  })

  it('uses the configured port by default', async () => {
    const { Config } = await import('./config.js')

    startServer()

    expect(server.listen).toHaveBeenCalledWith(Config.port, expect.any(Function))
  })

  it('logs a clear message and exits with 1 when the port is already in use', () => {
    const logError = vi.spyOn(logger, 'error')
    startServer(3000)

    server.on.mock.calls[0][1]({ code: 'EADDRINUSE' })

    expect(server.on.mock.calls[0][0]).toBe('error')
    expect(logError).toHaveBeenCalledWith({ port: 3000, code: 'EADDRINUSE' }, 'startup.port_in_use')
    expect(process.exitCode).toBe(1)
  })

  it('logs any other listen error with its code', () => {
    const logError = vi.spyOn(logger, 'error')
    startServer(3000)

    server.on.mock.calls[0][1]({ code: 'EACCES' })

    expect(logError).toHaveBeenCalledWith({ port: 3000, code: 'EACCES' }, 'startup.listen_failed')
    expect(process.exitCode).toBe(1)
  })
})
