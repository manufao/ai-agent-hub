/**
 * Test suite for the health controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

vi.mock('fs', () => ({
  statSync: vi.fn(),
}))

describe('healthController', () => {
  let healthController: typeof import('./health.controller.js').healthController
  let mockStatSync: Mock
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    vi.clearAllMocks()

    mockStatSync = (await import('fs')).statSync as Mock
    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    healthController = (await import('./health.controller.js')).healthController
  })

  it('answers 200 when the content directory is readable', () => {
    mockStatSync.mockReturnValue({ isDirectory: () => true })

    healthController({} as IncomingMessage, mockRes as ServerResponse)

    expect(mockRes.writeHead).toHaveBeenCalledWith(200)
    expect(mockRes.end).toHaveBeenCalledWith('ok')
  })

  it.each([undefined, { isDirectory: () => false }])('answers 503 when the content directory is %o', stat => {
    mockStatSync.mockReturnValue(stat)

    healthController({} as IncomingMessage, mockRes as ServerResponse)

    expect(mockRes.writeHead).toHaveBeenCalledWith(503)
    expect(mockRes.end).toHaveBeenCalledWith('unavailable')
  })
})
