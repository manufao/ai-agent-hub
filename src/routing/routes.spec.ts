/**
 * Test suite for Routes configuration
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import type { IncomingMessage, ServerResponse } from 'http'

// Mock the controllers before importing routes
vi.mock('../controllers/index.js', () => ({
  homeController: vi.fn(),
  agentController: vi.fn(),
  skillsController: vi.fn(),
  examplesController: vi.fn(),
  staticController: vi.fn(),
  licenseController: vi.fn(),
  healthController: vi.fn(),
}))

// Mock marked
vi.mock('marked', () => ({
  marked: {
    setOptions: vi.fn(),
    parse: vi.fn(),
  },
}))

describe('Routes Configuration', () => {
  let router: typeof import('./routes.js').default
  let mockMarkedSetOptions: Mock

  beforeEach(async () => {
    vi.clearAllMocks()
    // routes.js calls marked.setOptions when it loads, so the module has to be
    // re-executed after the mocks are cleared for that call to be observable.
    vi.resetModules()

    const { marked } = await import('marked')
    mockMarkedSetOptions = marked.setOptions as Mock

    const routesModule = await import('./routes.js')
    router = routesModule.default
  })

  describe('route definitions', () => {
    it('should have router defined', () => {
      expect(router).toBeDefined()
      expect(router.handle).toBeDefined()
    })
  })

  describe('health check', () => {
    it('should route /health to the health controller', async () => {
      const { healthController } = await import('../controllers/index.js')

      router.handle({ url: '/health', method: 'GET' } as IncomingMessage, {} as ServerResponse)

      expect(healthController).toHaveBeenCalled()
    })
  })

  describe('marked configuration', () => {
    it('should configure marked with breaks and gfm options', () => {
      expect(mockMarkedSetOptions).toHaveBeenCalledWith({
        breaks: true,
        gfm: true,
      })
    })
  })
})
