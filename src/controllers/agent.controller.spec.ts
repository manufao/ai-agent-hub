/**
 * Test suite for Agent Controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

vi.mock('../content/agents.js', () => ({
  getAgent: vi.fn(),
  listAgents: vi.fn(),
}))

vi.mock('../content/markdown.js', () => ({
  renderMarkdown: vi.fn(),
}))

vi.mock('../content/pages.js', () => ({
  agentHero: vi.fn(),
  agentRelated: vi.fn(),
}))

vi.mock('../view.js', () => ({
  renderPage: vi.fn(),
}))

// Keep the real escapeXML so the escaping is exercised
vi.mock('ejs', async () => {
  const actual = await vi.importActual<typeof import('ejs')>('ejs')
  return {
    default: {
      escapeXML: actual.escapeXML,
    },
  }
})

describe('agentController', () => {
  let agentController: typeof import('./agent.controller.js').agentController
  let mockGetAgent: Mock
  let mockRenderPage: Mock
  let mockListAgents: Mock
  let mockRenderMarkdown: Mock
  let mockAgentHero: Mock
  let mockAgentRelated: Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    vi.clearAllMocks()

    const { getAgent, listAgents } = await import('../content/agents.js')
    const { renderMarkdown } = await import('../content/markdown.js')
    const { agentHero, agentRelated } = await import('../content/pages.js')
    const { renderPage } = await import('../view.js')

    mockGetAgent = getAgent as Mock
    mockRenderPage = renderPage as Mock
    mockListAgents = listAgents as Mock
    mockRenderMarkdown = renderMarkdown as Mock
    mockAgentHero = agentHero as Mock
    mockAgentRelated = agentRelated as Mock

    mockReq = { url: '/agents/architect', method: 'GET' }
    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./agent.controller.js')
    agentController = module.agentController
  })

  it('renders the agent when it exists', () => {
    const agent = { slug: 'architect', title: 'Architect', description: 'Plans', content: '# Architect' }
    const agents = [{ slug: 'vitest', title: 'Vitest', description: 'Tests' }]
    const headings = [{ id: 'scope', text: 'Scope' }]
    const hero = { eyebrow: 'Agent' }
    const related = [{ title: 'Vitest' }]
    mockGetAgent.mockReturnValue(agent)
    mockListAgents.mockReturnValue(agents)
    mockRenderMarkdown.mockReturnValue({
      html: '<p>Body</p><a href="../examples/demo/references/guide.md">g</a>',
      headings,
    })
    mockAgentHero.mockReturnValue(hero)
    mockAgentRelated.mockReturnValue(related)

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetAgent).toHaveBeenCalledWith('architect')
    expect(mockRenderMarkdown).toHaveBeenCalledWith('# Architect', { stripTitle: true })
    expect(mockAgentRelated).toHaveBeenCalledWith('architect', agents)
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, {
      statusCode: 200,
      bodyHtml: '<p>Body</p><a href="/examples/demo/references/guide">g</a>',
      active: { type: 'agent', slug: 'architect' },
      hero,
      toc: headings,
      related,
    })
  })

  it('returns 404 when the agent does not exist', () => {
    mockGetAgent.mockReturnValue(undefined)

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, {
      statusCode: 404,
      bodyHtml: expect.stringContaining('Agent introuvable'),
      active: { type: 'agent', slug: 'architect' },
    })
  })

  it('escapes the agent slug taken from the URL', () => {
    mockReq.url = '/agents/%3Cscript%3Ealert(1)%3C%2Fscript%3E'
    mockGetAgent.mockReturnValue(undefined)

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    const call = mockRenderPage.mock.calls[0][1] as { bodyHtml: string }
    expect(call.bodyHtml).not.toContain('<script>')
    expect(call.bodyHtml).toContain('&lt;script&gt;')
  })

  it('renders the agents index for /agents and /agents/', () => {
    mockListAgents.mockReturnValue([{ slug: 'architect', title: 'Architect', description: 'Plans <work>' }])

    for (const url of ['/agents', '/agents/']) {
      mockRenderPage.mockClear()
      mockReq.url = url

      agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

      const call = mockRenderPage.mock.calls[0][1] as { statusCode: number; bodyHtml: string }
      expect(call.statusCode).toBe(200)
      expect(call.bodyHtml).toContain('href="/agents/architect"')
      expect(call.bodyHtml).toContain('Plans &lt;work&gt;')
      expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ active: { type: 'agents' } }))
    }
  })

  it('finds the agent even when the URL carries a query string', () => {
    mockReq.url = '/agents/architect?ref=x'
    mockGetAgent.mockReturnValue(undefined)

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetAgent).toHaveBeenCalledWith('architect')
  })

  it('returns 404, not 500, for a malformed percent-encoded slug', () => {
    mockReq.url = '/agents/%E0%A4%A'

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetAgent).not.toHaveBeenCalled()
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ statusCode: 404 }))
  })

  it('returns 404 for a URL with more than one segment after /agents', () => {
    mockReq.url = '/agents/a/b'

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetAgent).not.toHaveBeenCalled()
    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'agent', slug: '' } }),
    )
  })

  it('returns 404 when the URL is missing entirely', () => {
    mockReq.url = undefined

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetAgent).not.toHaveBeenCalled()
    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'agent', slug: '' } }),
    )
  })

  it('returns 500 when an error occurs', () => {
    mockGetAgent.mockImplementation(() => {
      throw new Error('boom')
    })

    agentController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
    expect(mockRes.writeHead).toHaveBeenCalledWith(500)
    expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
  })
})
