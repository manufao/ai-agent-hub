/**
 * Test suite for Home Controller
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

describe('homeController', () => {
  let homeController: typeof import('./home.controller.js').homeController
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
      url: '/',
      method: 'GET',
    }

    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./home.controller.js')
    homeController = module.homeController
  })

  describe('successful rendering', () => {
    it('should render AGENTS.md when file exists', () => {
      const markdownContent = '# Agents\n\nList of agents'
      const htmlContent = '<h1>Agents</h1><p>List of agents</p>'
      const templateContent = '<html><%= content %></html>'
      const renderedHtml = '<html><h1>Agents</h1><p>List of agents</p></html>'

      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation((path: unknown) => {
        if (String(path).includes('AGENTS.md')) {
          return markdownContent
        }
        return templateContent
      })
      mockMarkedParse.mockReturnValue(htmlContent)
      mockEjsRender.mockReturnValue(renderedHtml)

      homeController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockExistsSync).toHaveBeenCalled()
      expect(mockMarkedParse).toHaveBeenCalledWith(markdownContent)
      expect(mockEjsRender).toHaveBeenCalledWith(templateContent, { content: htmlContent, isHome: true })
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html;charset=utf-8')
      expect(mockRes.writeHead).toHaveBeenCalledWith(200)
      expect(mockRes.end).toHaveBeenCalledWith(renderedHtml)
    })

    it('should render error message when AGENTS.md does not exist', () => {
      const templateContent = '<html><%= content %></html>'
      const renderedHtml = '<html>error content</html>'

      mockExistsSync.mockReturnValue(false)
      mockReadFileSync.mockReturnValue(templateContent)
      mockEjsRender.mockReturnValue(renderedHtml)

      homeController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockExistsSync).toHaveBeenCalled()
      expect(mockMarkedParse).not.toHaveBeenCalled()
      expect(mockEjsRender).toHaveBeenCalledWith(
        templateContent,
        expect.objectContaining({
          content: expect.stringContaining('AGENTS.md not found'),
          isHome: true,
        }),
      )
      expect(mockRes.writeHead).toHaveBeenCalledWith(200)
    })
  })

  describe('error handling', () => {
    it('should return 500 when an error occurs', () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('File system error')
      })

      homeController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
      expect(mockRes.writeHead).toHaveBeenCalledWith(500)
      expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
    })
  })
})
