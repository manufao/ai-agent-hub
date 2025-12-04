/**
 * Test suite for Static Controller
 */

import { jest } from '@jest/globals'
import { IncomingMessage, ServerResponse } from 'http'

// Mock fs module
jest.unstable_mockModule('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}))

describe('Static Controllers', () => {
  let staticController: typeof import('./static.controller.js').staticController
  let licenseController: typeof import('./static.controller.js').licenseController
  let mockExistsSync: jest.Mock
  let mockReadFileSync: jest.Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: jest.Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    jest.clearAllMocks()

    const fs = await import('fs')
    mockExistsSync = fs.existsSync as jest.Mock
    mockReadFileSync = fs.readFileSync as jest.Mock

    mockReq = {
      url: '/css/output.css',
      method: 'GET',
    }

    mockRes = {
      writeHead: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    } as jest.Mocked<Partial<ServerResponse>>

    const module = await import('./static.controller.js')
    staticController = module.staticController
    licenseController = module.licenseController
  })

  describe('staticController', () => {
    describe('serving static files', () => {
      it('should serve CSS files with correct MIME type', () => {
        const cssContent = Buffer.from('body { color: red; }')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(cssContent)
        mockReq.url = '/css/output.css'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/css')
        expect(mockRes.writeHead).toHaveBeenCalledWith(200)
        expect(mockRes.end).toHaveBeenCalledWith(cssContent)
      })

      it('should serve JS files with correct MIME type', () => {
        const jsContent = Buffer.from('console.log("hello")')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(jsContent)
        mockReq.url = '/js/app.js'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/javascript')
        expect(mockRes.writeHead).toHaveBeenCalledWith(200)
      })

      it('should serve JSON files with correct MIME type', () => {
        const jsonContent = Buffer.from('{"key": "value"}')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(jsonContent)
        mockReq.url = '/data/config.json'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json')
      })

      it('should serve PNG images with correct MIME type', () => {
        const imageContent = Buffer.from('fake png data')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(imageContent)
        mockReq.url = '/images/logo.png'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png')
      })

      it('should serve JPG images with correct MIME type', () => {
        const imageContent = Buffer.from('fake jpg data')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(imageContent)
        mockReq.url = '/images/photo.jpg'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg')
      })

      it('should serve GIF images with correct MIME type', () => {
        const imageContent = Buffer.from('fake gif data')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(imageContent)
        mockReq.url = '/images/animation.gif'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/gif')
      })

      it('should serve SVG images with correct MIME type', () => {
        const svgContent = Buffer.from('<svg></svg>')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(svgContent)
        mockReq.url = '/images/icon.svg'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'image/svg+xml')
      })

      it('should use octet-stream for unknown file types', () => {
        const binaryContent = Buffer.from('binary data')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(binaryContent)
        mockReq.url = '/files/data.bin'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/octet-stream')
      })

      it('should handle undefined URL by using default path', () => {
        const content = Buffer.from('content')

        mockExistsSync.mockReturnValue(true)
        mockReadFileSync.mockReturnValue(content)
        mockReq.url = undefined

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockExistsSync).toHaveBeenCalled()
      })
    })

    describe('file not found', () => {
      it('should return 404 when file does not exist', () => {
        mockExistsSync.mockReturnValue(false)
        mockReq.url = '/css/nonexistent.css'

        staticController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.writeHead).toHaveBeenCalledWith(404)
        expect(mockRes.end).toHaveBeenCalledWith('File not found')
      })
    })
  })

  describe('licenseController', () => {
    describe('serving LICENSE file', () => {
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

      it('should return 404 when LICENSE file does not exist', () => {
        mockExistsSync.mockReturnValue(false)
        mockReq.url = '/LICENSE'

        licenseController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.writeHead).toHaveBeenCalledWith(404)
        expect(mockRes.end).toHaveBeenCalledWith('LICENSE file not found')
      })
    })

    describe('error handling', () => {
      it('should return 500 when an error occurs', () => {
        mockExistsSync.mockImplementation(() => {
          throw new Error('File system error')
        })
        mockReq.url = '/LICENSE'

        licenseController(mockReq as IncomingMessage, mockRes as ServerResponse)

        expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
        expect(mockRes.writeHead).toHaveBeenCalledWith(500)
        expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
      })
    })
  })
})
