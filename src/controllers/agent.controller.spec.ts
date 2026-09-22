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

// Mock ejs module, keeping the real escapeXML so the escaping is exercised
vi.mock('ejs', async () => {
  const actual = await vi.importActual<typeof import('ejs')>('ejs')
  return {
    default: {
      render: vi.fn(),
      escapeXML: actual.escapeXML,
    },
  }
})

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

    it('should return 404 when the agent does not exist', () => {
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
          content: expect.stringContaining('Agent not found'),
          isHome: false,
        }),
      )
      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
    })

    it('should not disclose the server file path when the agent does not exist', () => {
      mockExistsSync.mockReturnValue(false)
      mockReadFileSync.mockReturnValue('<html><%= content %></html>')
      mockEjsRender.mockReturnValue('<html>error content</html>')

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      const { content } = mockEjsRender.mock.calls[0][1] as { content: string }
      expect(content).not.toContain('.agents')
      expect(content).not.toContain('README.md')
    })

    it('should escape the agent name taken from the URL', () => {
      mockReq.url = '/.agents/<script>alert(1)</script>/system-prompt.md'
      mockExistsSync.mockReturnValue(false)
      mockReadFileSync.mockReturnValue('<html><%= content %></html>')
      mockEjsRender.mockReturnValue('<html>error content</html>')

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      const { content } = mockEjsRender.mock.calls[0][1] as { content: string }
      expect(content).not.toContain('<script>')
      expect(content).toContain('&lt;script&gt;')
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
