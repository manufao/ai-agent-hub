/**
 * Test suite for main.ts
 */

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import SuperTest from 'supertest'
import type { Server } from 'http'
import type { IncomingMessage, ServerResponse } from 'http'
import { logger } from './logging/logger.js'

// Mock the router
vi.mock('./routing/routes.js', () => ({
  default: {
    handle: vi.fn(),
  },
}))

describe('main', () => {
  let main: typeof import('./main.js').default
  let mockRouter: { handle: Mock }
  let server: Server

  beforeEach(async () => {
    vi.clearAllMocks()

    const routerModule = await import('./routing/routes.js')
    mockRouter = routerModule.default as unknown as { handle: Mock }

    const module = await import('./main.js')
    main = module.default
  })

  afterEach(() => {
    if (server) {
      server.close()
    }
  })

  describe('server creation', () => {
    it('should create a server that delegates to router', () => {
      mockRouter.handle.mockImplementation((_req: unknown, res: unknown) => {
        const response = res as ServerResponse
        response.writeHead(200)
        response.end('OK')
      })

      server = main(0)

      return SuperTest(server).get('/').expect(200).expect('OK')
    })

    it('should pass request and response to router.handle', () => {
      mockRouter.handle.mockImplementation((_req: unknown, res: unknown) => {
        const response = res as ServerResponse
        response.writeHead(200)
        response.end('handled')
      })

      server = main(0)

      return SuperTest(server)
        .get('/test')
        .expect(200)
        .expect(() => {
          expect(mockRouter.handle).toHaveBeenCalled()
          const [req] = mockRouter.handle.mock.calls[0] as [IncomingMessage, ServerResponse]
          expect(req.url).toBe('/test')
        })
    })
  })

  describe('404 logging', () => {
    it('logs every 404 once with its route family, never with what the visitor typed', async () => {
      const logInfo = vi.spyOn(logger, 'info')
      mockRouter.handle.mockImplementation((_req: unknown, res: unknown) => {
        const response = res as ServerResponse
        response.writeHead(404)
        response.end('missing')
      })

      server = main(0)
      await SuperTest(server).get('/agents/<script>?token=secret').expect(404)

      await vi.waitFor(() => {
        expect(logInfo).toHaveBeenCalledTimes(1)
      })
      expect(logInfo).toHaveBeenCalledWith({ method: 'GET', route: 'agents' }, 'http.not_found')
    })

    it('does not log a response that is not a 404', async () => {
      const logInfo = vi.spyOn(logger, 'info')
      mockRouter.handle.mockImplementation((_req: unknown, res: unknown) => {
        const response = res as ServerResponse
        response.writeHead(200)
        response.end('OK')
      })

      server = main(0)
      await SuperTest(server).get('/').expect(200)
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(logInfo).not.toHaveBeenCalled()
    })
  })
})
