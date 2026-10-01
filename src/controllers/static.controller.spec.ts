/**
 * Test suite for Static Controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn(),
}))

const file = { isFile: () => true }
const directory = { isFile: () => false }

describe('Static Controllers', () => {
  let staticController: typeof import('./static.controller.js').staticController
  let licenseController: typeof import('./static.controller.js').licenseController
  let mockExistsSync: Mock
  let mockReadFileSync: Mock
  let mockStatSync: Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    mockExistsSync = fs.existsSync as Mock
    mockReadFileSync = fs.readFileSync as Mock
    mockStatSync = fs.statSync as Mock

    mockReq = {
      url: '/css/output.css',
      method: 'GET',
    }

    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./static.controller.js')
    staticController = module.staticController
    licenseController = module.licenseController
  })

  describe('staticController', () => {
    describe('serving static files', () => {
      const cases: Array<[string, string, string]> = [
        ['CSS', '/css/output.css', 'text/css'],
        ['JS', '/js/app.js', 'text/javascript'],
        ['JSON', '/data/config.json', 'application/json'],
        ['PNG', '/images/logo.png', 'image/png'],
        ['JPG', '/images/photo.jpg', 'image/jpeg'],
        ['GIF', '/images/animation.gif', 'image/gif'],
        ['SVG', '/images/icon.svg', 'image/svg+xml'],
        ['unknown', '/files/data.bin', 'application/octet-stream'],
      ]

      it.each(cases)('should serve %s files with the right MIME type', (_label, url, contentType) => {
        const content = Buffer.from('content')
        mockStatSync.mockReturnValue(file)
        mockReadFileSync.mockReturnValue(content)
        mockReq.url = url

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', contentType)
        expect(mockRes.writeHead).toHaveBeenCalledWith(200)
        expect(mockRes.end).toHaveBeenCalledWith(content)
      })

      it('should ignore the query string when looking for the file', () => {
        mockStatSync.mockReturnValue(file)
        mockReadFileSync.mockReturnValue(Buffer.from('css'))
        mockReq.url = '/css/output.css?v=2'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockStatSync.mock.calls[0][0]).toMatch(/public\/css\/output\.css$/)
        expect(mockRes.writeHead).toHaveBeenCalledWith(200)
      })
    })

    describe('file not found', () => {
      it('should return a French 404 when the file does not exist', () => {
        mockStatSync.mockReturnValue(undefined)
        mockReq.url = '/css/nonexistent.css'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.writeHead).toHaveBeenCalledWith(404)
        expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('Page introuvable'))
      })

      it('should return 404 for a directory instead of failing to read it', () => {
        mockStatSync.mockReturnValue(directory)
        mockReq.url = '/css/'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.writeHead).toHaveBeenCalledWith(404)
        expect(mockReadFileSync).not.toHaveBeenCalled()
      })

      it('should return 404 when the URL is undefined', () => {
        mockReq.url = undefined

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.writeHead).toHaveBeenCalledWith(404)
        expect(mockStatSync).not.toHaveBeenCalled()
      })
    })

    describe('path traversal', () => {
      const attacks = [
        '/css/../../package.json',
        '/css/../../../../etc/passwd',
        '/css/..%2f..%2fpackage.json',
        '/css/%2e%2e/%2e%2e/package.json',
        '/css/%zz',
        '/css/output.css%00.png',
      ]

      it.each(attacks)('should answer 404 without touching the filesystem for %s', url => {
        mockStatSync.mockReturnValue(file)
        mockReq.url = url

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.writeHead).toHaveBeenCalledWith(404)
        expect(mockStatSync).not.toHaveBeenCalled()
        expect(mockReadFileSync).not.toHaveBeenCalled()
      })
    })
  })

  describe('licenseController', () => {
    it('should serve LICENSE file when it exists', () => {
      const licenseContent = 'MIT License\n\nCopyright...'

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(licenseContent)
      mockReq.url = '/LICENSE'

      licenseController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
      expect(mockRes.writeHead).toHaveBeenCalledWith(200)
      expect(mockRes.end).toHaveBeenCalledWith(licenseContent)
    })

    it('should return a French 404 when LICENSE file does not exist', () => {
      mockExistsSync.mockReturnValue(false)
      mockReq.url = '/LICENSE'

      licenseController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('Page introuvable'))
    })

    it('should let a read error reach the router, which answers 500', () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      expect(() => licenseController(mockReq as IncomingMessage, mockRes as ServerResponse)).toThrow(
        'File system error',
      )
    })
  })
})
