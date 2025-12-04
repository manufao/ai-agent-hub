/**
 * Test suite for Home Controller
 */

import { jest } from '@jest/globals'
import { IncomingMessage, ServerResponse } from 'http'

// Mock fs module
jest.unstable_mockModule('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}))

// Mock ejs module
jest.unstable_mockModule('ejs', () => ({
  default: {
    render: jest.fn(),
  },
}))

// Mock marked module
jest.unstable_mockModule('marked', () => ({
  marked: {
    parse: jest.fn(),
  },
}))

describe('homeController', () => {
  let homeController: typeof import('./home.controller.js').homeController
  let mockExistsSync: jest.Mock
  let mockReadFileSync: jest.Mock
  let mockEjsRender: jest.Mock
  let mockMarkedParse: jest.Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: jest.Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    jest.clearAllMocks()

    const fs = await import('fs')
    const ejs = await import('ejs')
    const { marked } = await import('marked')

    mockExistsSync = fs.existsSync as jest.Mock
    mockReadFileSync = fs.readFileSync as jest.Mock
    mockEjsRender = ejs.default.render as jest.Mock
    mockMarkedParse = marked.parse as unknown as jest.Mock

    mockReq = {
      url: '/',
      method: 'GET',
    }

    mockRes = {
      writeHead: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    } as jest.Mocked<Partial<ServerResponse>>

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
      expect(mockEjsRender).toHaveBeenCalledWith(templateContent, { content: htmlContent })
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
