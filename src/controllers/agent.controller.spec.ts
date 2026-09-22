/**
 * Test suite for Agent Controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

// Mock ejs module
vi.mock('ejs', () => ({
  default: {
    render: vi.fn(),
  },
}))

// Mock marked module
vi.mock('marked', () => ({
  marked: {
    parse: vi.fn(),
  },
}))

describe('agentController', () => {
  let agentController: typeof import('./agent.controller.js').agentController
  let mockExistsSync: Mock
  let mockReadFileSync: Mock
  let mockEjsRender: Mock
  let mockMarkedParse: Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    const ejs = await import('ejs')
    const { marked } = await import('marked')

    mockExistsSync = fs.existsSync as Mock
    mockReadFileSync = fs.readFileSync as Mock
    mockEjsRender = ejs.default.render as Mock
    mockMarkedParse = marked.parse as unknown as Mock

    mockReq = {
      url: '/.agents/architect/system-prompt.md',
      method: 'GET',
    }

    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./agent.controller.js')
    agentController = module.agentController
  })

  describe('successful rendering', () => {
    it('should render agent README.md when file exists', () => {
      const markdownContent = '# Architect Agent\n\nDescription'
      const htmlContent = '<h1>Architect Agent</h1><p>Description</p>'
      const templateContent = '<html><%= content %></html>'
      const renderedHtml = '<html><h1>Architect Agent</h1></html>'

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: unknown) => {
        if (String(path).includes('README.md')) {
          return markdownContent
        }
        return templateContent
      })
      mockMarkedParse.mockReturnValue(htmlContent)
      mockEjsRender.mockReturnValue(renderedHtml)

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockExistsSync).toHaveBeenCalled()
      expect(mockMarkedParse).toHaveBeenCalledWith(markdownContent)
      expect(mockEjsRender).toHaveBeenCalledWith(templateContent, { content: htmlContent, isHome: false })
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html;charset=utf-8')
      expect(mockRes.writeHead).toHaveBeenCalledWith(200)
      expect(mockRes.end).toHaveBeenCalledWith(renderedHtml)
    })

    it('should render error message when README.md does not exist', () => {
      const templateContent = '<html><%= content %></html>'
      const renderedHtml = '<html>error content</html>'

      mockExistsSync.mockReturnValue(false)
      mockReadFileSync.mockReturnValue(templateContent)
      mockEjsRender.mockReturnValue(renderedHtml)

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockExistsSync).toHaveBeenCalled()
      expect(mockMarkedParse).not.toHaveBeenCalled()
      expect(mockEjsRender).toHaveBeenCalledWith(
        templateContent,
        expect.objectContaining({
          content: expect.stringContaining('Agent README not found'),
          isHome: false,
        }),
      )
      expect(mockRes.writeHead).toHaveBeenCalledWith(200)
    })
  })

  describe('invalid URL handling', () => {
    it('should return 404 for invalid agent URL format (less than 3 parts)', () => {
      mockReq.url = '/.agents/invalid'

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
      expect(mockRes.end).toHaveBeenCalledWith('Invalid Agent URL format')
    })

    it('should handle empty URL', () => {
      mockReq.url = ''

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
      expect(mockRes.end).toHaveBeenCalledWith('Invalid Agent URL format')
    })

    it('should handle undefined URL', () => {
      mockReq.url = undefined

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
      expect(mockRes.end).toHaveBeenCalledWith('Invalid Agent URL format')
    })
  })

  describe('error handling', () => {
    it('should return 500 when an error occurs', () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
      expect(mockRes.writeHead).toHaveBeenCalledWith(500)
      expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
    })
  })
})
