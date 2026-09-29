/**
 * Test suite for Home Controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

vi.mock('../content/overview.js', () => ({
  getOverview: vi.fn(),
}))

vi.mock('../view.js', () => ({
  renderPage: vi.fn(),
}))

vi.mock('../content/markdown.js', () => ({
  renderMarkdown: vi.fn(),
}))

describe('homeController', () => {
  let homeController: typeof import('./home.controller.js').homeController
  let mockGetOverview: Mock
  let mockRenderPage: Mock
  let mockRenderMarkdown: Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    vi.clearAllMocks()

    const { getOverview } = await import('../content/overview.js')
    const { renderPage } = await import('../view.js')
    const { renderMarkdown } = await import('../content/markdown.js')

    mockGetOverview = getOverview as Mock
    mockRenderPage = renderPage as Mock
    mockRenderMarkdown = renderMarkdown as Mock

    mockReq = { url: '/', method: 'GET' }
    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./home.controller.js')
    homeController = module.homeController
  })

  it('renders the overview content when .agents/README.md exists', () => {
    mockGetOverview.mockReturnValue('# Overview')
    const headings = [{ id: 'intro', text: 'Intro' }]
    mockRenderMarkdown.mockReturnValue({ html: '<h1>Overview</h1>', headings })

    homeController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderMarkdown).toHaveBeenCalledWith('# Overview')
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, {
      statusCode: 200,
      bodyHtml: '<h1>Overview</h1>',
      active: { type: 'overview' },
      toc: headings,
    })
  })

  it('renders a fallback message when .agents/README.md is missing', () => {
    mockGetOverview.mockReturnValue(undefined)

    homeController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderMarkdown).not.toHaveBeenCalled()
    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({
        statusCode: 200,
        bodyHtml: expect.stringContaining('.agents/README.md introuvable'),
        active: { type: 'overview' },
      }),
    )
  })

  it('returns 500 when an error occurs', () => {
    mockGetOverview.mockImplementation(() => {
      throw new Error('boom')
    })

    homeController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
    expect(mockRes.writeHead).toHaveBeenCalledWith(500)
    expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
  })
})
