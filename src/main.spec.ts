/**
 * Test suite for main.ts
 */

import { jest } from '@jest/globals'
import SuperTest from 'supertest'
import type { Server } from 'http'

// Mock the router
jest.unstable_mockModule('./routing/routes.js', () => ({
  default: {
    handle: jest.fn(),
  },
}))

describe('main', () => {
  let main: typeof import('./main.js').default
  let mockRouter: { handle: jest.Mock }
  let server: Server

  beforeEach(async () => {
    jest.clearAllMocks()

    const routerModule = await import('./routing/routes.js')
    mockRouter = routerModule.default as unknown as { handle: jest.Mock }

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
      mockRouter.handle.mockImplementation((req, res) => {
        res.writeHead(200)
        res.end('OK')
      })

      server = main(0)

      return SuperTest(server).get('/').expect(200).expect('OK')
    })

    it('should pass request and response to router.handle', () => {
      mockRouter.handle.mockImplementation((req, res) => {
        res.writeHead(200)
        res.end('handled')
      })

      server = main(0)

      return SuperTest(server)
        .get('/test')
        .expect(200)
        .expect(() => {
          expect(mockRouter.handle).toHaveBeenCalled()
          const [req, res] = mockRouter.handle.mock.calls[0]
          expect(req.url).toBe('/test')
          expect(res).toBeDefined()
        })
    })
  })
})
