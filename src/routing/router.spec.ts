/**
 * Test suite for Router
 * Uses Jest mocks to verify handler calls
 */

import { jest } from '@jest/globals'
import { IncomingMessage, ServerResponse } from 'http'
import { Router } from './index.js'

describe('Router', function () {
  let router: Router
  let mockReq: jest.Mocked<Partial<IncomingMessage>>
  let mockRes: jest.Mocked<Partial<ServerResponse>>

  beforeEach(() => {
    router = new Router()

    mockReq = {
      url: '/',
      method: 'GET',
    } as jest.Mocked<Partial<IncomingMessage>>

    mockRes = {
      writeHead: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    } as jest.Mocked<Partial<ServerResponse>>
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Route Matching', function () {
    it('should call handler for exact string path match', function () {
      const handler = jest.fn()

      router.add('/', handler)
      mockReq.url = '/'

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(handler).toHaveBeenCalledWith(mockReq, mockRes)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call handler for RegExp path match', function () {
      const handler = jest.fn()

      router.add(/^\/css\/.*$/, handler)
      mockReq.url = '/css/style.css'

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(handler).toHaveBeenCalledWith(mockReq, mockRes)
    })

    it('should not call any handler when no route matches', function () {
      const handler = jest.fn()

      router.add('/', handler)
      mockReq.url = '/nonexistent'

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(handler).not.toHaveBeenCalled()
      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
    })

    it('should default to "/" when req.url is undefined', function () {
      const handler = jest.fn()

      router.add('/', handler)
      mockReq.url = undefined

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(handler).toHaveBeenCalledWith(mockReq, mockRes)
    })
  })

  describe('Route Priority', function () {
    it('should call only the first matching handler', function () {
      const handler1 = jest.fn()
      const handler2 = jest.fn()

      router.add(/^\/test.*$/, handler1)
      router.add('/test', handler2)
      mockReq.url = '/test'

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(handler1).toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('Multiple Routes', function () {
    it('should call the correct handler for different routes', function () {
      const homeHandler = jest.fn()
      const aboutHandler = jest.fn()

      router.add('/', homeHandler)
      router.add('/about', aboutHandler)

      // Test home route
      mockReq.url = '/'
      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(homeHandler).toHaveBeenCalledWith(mockReq, mockRes)
      expect(aboutHandler).not.toHaveBeenCalled()

      // Reset and test about route
      jest.clearAllMocks()

      mockReq.url = '/about'
      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(aboutHandler).toHaveBeenCalledWith(mockReq, mockRes)
      expect(homeHandler).not.toHaveBeenCalled()
    })
  })

  describe('Complex Patterns', function () {
    it('should match complex regex patterns for static files', function () {
      const staticHandler = jest.fn()

      router.add(/^\/(css|js|images)\/.*$/, staticHandler)

      const testUrls = ['/css/style.css', '/js/app.js', '/images/logo.png']

      testUrls.forEach(url => {
        jest.clearAllMocks()
        mockReq.url = url
        router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(staticHandler).toHaveBeenCalledTimes(1)
      })
    })

    it('should match paths starting with dot (hidden folders)', function () {
      const agentHandler = jest.fn()

      router.add(/^\/\.agents\/.*$/, agentHandler)
      mockReq.url = '/.agents/architect/system-prompt.md'

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(agentHandler).toHaveBeenCalled()
    })
  })

  describe('Handler Execution', function () {
    it('should pass req and res to handler', function () {
      const handler = jest.fn()

      router.add('/test', handler)
      mockReq.url = '/test'

      router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(handler).toHaveBeenCalledWith(mockReq, mockRes)
    })

    it('should allow errors to propagate from handlers', function () {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error')
      })

      router.add('/error', errorHandler)
      mockReq.url = '/error'

      expect(() => {
        router.handle(mockReq as IncomingMessage, mockRes as ServerResponse)
      }).toThrow('Handler error')

      expect(errorHandler).toHaveBeenCalled()
    })
  })
})
