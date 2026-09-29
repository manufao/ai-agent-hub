/**
 * Test suite for Examples Controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

vi.mock('../content/examples.js', () => ({
  getExample: vi.fn(),
  getReference: vi.fn(),
  listExamples: vi.fn(),
}))

vi.mock('../content/markdown.js', () => ({
  renderMarkdown: vi.fn(),
}))

vi.mock('../content/pages.js', () => ({
  exampleHero: vi.fn(),
  exampleRelated: vi.fn(),
  referenceHero: vi.fn(),
}))

vi.mock('../view.js', () => ({
  renderPage: vi.fn(),
}))

describe('examplesController', () => {
  let examplesController: typeof import('./examples.controller.js').examplesController
  let mockGetExample: Mock
  let mockGetReference: Mock
  let mockListExamples: Mock
  let mockRenderMarkdown: Mock
  let mockExampleHero: Mock
  let mockExampleRelated: Mock
  let mockReferenceHero: Mock
  let mockRenderPage: Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: Mocked<Partial<ServerResponse>>

  const example = { slug: 'demo', name: 'demo', description: 'A demo', content: '# Demo', references: [] }
  const headings = [{ id: 'usage', text: 'Usage' }]

  beforeEach(async () => {
    vi.clearAllMocks()

    const { getExample, getReference, listExamples } = await import('../content/examples.js')
    const { renderMarkdown } = await import('../content/markdown.js')
    const { exampleHero, exampleRelated, referenceHero } = await import('../content/pages.js')
    const { renderPage } = await import('../view.js')

    mockGetExample = getExample as Mock
    mockGetReference = getReference as Mock
    mockListExamples = listExamples as Mock
    mockRenderMarkdown = renderMarkdown as Mock
    mockExampleHero = exampleHero as Mock
    mockExampleRelated = exampleRelated as Mock
    mockReferenceHero = referenceHero as Mock
    mockRenderPage = renderPage as Mock

    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./examples.controller.js')
    examplesController = module.examplesController
  })

  it('renders the examples index', () => {
    mockReq = { url: '/examples' }
    mockListExamples.mockReturnValue([{ slug: 'demo', name: 'demo', description: 'A <demo>' }])

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    const call = mockRenderPage.mock.calls[0][1] as { statusCode: number; bodyHtml: string }
    expect(call.statusCode).toBe(200)
    expect(call.bodyHtml).toContain('href="/examples/demo"')
    expect(call.bodyHtml).toContain('A &lt;demo&gt;')
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ active: { type: 'examples' } }))
  })

  it('renders an example and rewrites its relative links for the site', () => {
    mockReq = { url: '/examples/demo' }
    const hero = { eyebrow: 'Exemple' }
    const related = [{ title: 'Ref' }]
    mockGetExample.mockReturnValue(example)
    mockRenderMarkdown.mockReturnValue({
      html: '<a href="references/guide.md">g</a><a href="../../.agents/architect.md">a</a>',
      headings,
    })
    mockExampleHero.mockReturnValue(hero)
    mockExampleRelated.mockReturnValue(related)

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderMarkdown).toHaveBeenCalledWith('# Demo', { stripTitle: true })
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, {
      statusCode: 200,
      bodyHtml: '<a href="/examples/demo/references/guide">g</a><a href="/agents/architect">a</a>',
      active: { type: 'example', slug: 'demo' },
      hero,
      toc: headings,
      related,
    })
  })

  it('returns 404 when the example does not exist', () => {
    mockReq = { url: '/examples/unknown' }
    mockGetExample.mockReturnValue(undefined)

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'example', slug: 'unknown' } }),
    )
  })

  it('renders a reference of an example', () => {
    mockReq = { url: '/examples/demo/references/guide' }
    const hero = { eyebrow: 'Exemple · demo' }
    const related = [{ title: 'demo' }]
    const reference = { slug: 'guide', title: 'Guide', content: '# Guide' }
    mockGetExample.mockReturnValue(example)
    mockGetReference.mockReturnValue(reference)
    mockRenderMarkdown.mockReturnValue({ html: '<p>Body</p>', headings })
    mockReferenceHero.mockReturnValue(hero)
    mockExampleRelated.mockReturnValue(related)

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetReference).toHaveBeenCalledWith('demo', 'guide')
    expect(mockExampleRelated).toHaveBeenCalledWith(example, 'guide')
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, {
      statusCode: 200,
      bodyHtml: '<p>Body</p>',
      active: { type: 'example', slug: 'demo', reference: 'guide' },
      hero,
      toc: headings,
      related,
    })
  })

  it('returns 404 when the reference does not exist', () => {
    mockReq = { url: '/examples/demo/references/unknown' }
    mockGetExample.mockReturnValue(example)
    mockGetReference.mockReturnValue(undefined)

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({
        statusCode: 404,
        active: { type: 'example', slug: 'demo', reference: 'unknown' },
      }),
    )
  })

  it('returns 404 for a URL that does not match the examples pattern', () => {
    mockReq = { url: '/examples/a/b/c' }

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetExample).not.toHaveBeenCalled()
    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'examples' } }),
    )
  })

  it('finds the example even when the URL carries a query string', () => {
    mockReq = { url: '/examples/demo?ref=x' }
    mockGetExample.mockReturnValue(undefined)

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetExample).toHaveBeenCalledWith('demo')
  })

  it('returns 404, not 500, for a malformed percent-encoded example or reference', () => {
    for (const url of ['/examples/%zz', '/examples/demo/references/%E0%A4%A']) {
      mockRenderPage.mockClear()
      mockReq = { url }

      examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ statusCode: 404 }))
    }
    expect(mockGetExample).not.toHaveBeenCalled()
  })

  it('returns 404 when the URL is missing entirely', () => {
    mockReq = { url: undefined }

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ statusCode: 404 }))
  })

  it('returns 500 when an error occurs', () => {
    mockReq = { url: '/examples' }
    mockListExamples.mockImplementation(() => {
      throw new Error('boom')
    })

    examplesController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
    expect(mockRes.writeHead).toHaveBeenCalledWith(500)
    expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
  })
})
