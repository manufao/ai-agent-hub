/**
 * Test suite for the shared page renderer
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { ServerResponse } from 'http'

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  statSync: vi.fn(),
}))

vi.mock('ejs', () => ({
  default: {
    compile: vi.fn(),
  },
}))

vi.mock('./content/agents.js', () => ({
  listAgents: vi.fn(),
}))

vi.mock('./content/skills.js', () => ({
  listCategories: vi.fn(),
}))

vi.mock('./content/examples.js', () => ({
  listExamples: vi.fn(),
}))

describe('renderPage', () => {
  let renderPage: typeof import('./view.js').renderPage
  let mockReadFileSync: Mock
  let mockStatSync: Mock
  let mockEjsCompile: Mock
  let mockEjsRender: Mock
  let mockListAgents: Mock
  let mockListCategories: Mock
  let mockListExamples: Mock
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    const fs = await import('fs')
    const ejs = await import('ejs')
    const { listAgents } = await import('./content/agents.js')
    const { listCategories } = await import('./content/skills.js')
    const { listExamples } = await import('./content/examples.js')

    mockReadFileSync = fs.readFileSync as Mock
    mockStatSync = fs.statSync as Mock
    mockEjsCompile = ejs.default.compile as Mock
    mockEjsRender = vi.fn()
    mockEjsCompile.mockReturnValue(mockEjsRender)
    mockStatSync.mockReturnValue({ mtimeMs: 1 })
    mockListAgents = listAgents as Mock
    mockListCategories = listCategories as Mock
    mockListExamples = listExamples as Mock
    mockListExamples.mockReturnValue([])

    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./view.js')
    renderPage = module.renderPage
  })

  it('builds the nav from the content modules and renders the layout', () => {
    const agents = [{ slug: 'architect', title: 'Architect' }]
    const categories = [{ slug: 'ingenierie', title: 'Ingénierie', skills: [] }]
    mockListAgents.mockReturnValue(agents)
    mockListCategories.mockReturnValue(categories)
    const examples = [{ slug: 'demo', name: 'demo', description: 'A demo' }]
    mockListExamples.mockReturnValue(examples)
    mockReadFileSync.mockReturnValue('<html><%= content %></html>')
    mockEjsRender.mockReturnValue('<html>rendered</html>')

    renderPage(mockRes as ServerResponse, {
      statusCode: 200,
      bodyHtml: '<p>Hello</p>',
      active: { type: 'overview' },
    })

    expect(mockEjsCompile).toHaveBeenCalledWith('<html><%= content %></html>', {
      filename: expect.stringContaining('index.ejs'),
    })
    expect(mockEjsRender).toHaveBeenCalledWith({
      content: '<p>Hello</p>',
      nav: { agents, categories, examples },
      active: { type: 'overview' },
      hero: null,
      toc: [],
      related: [],
    })
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html;charset=utf-8')
    expect(mockRes.writeHead).toHaveBeenCalledWith(200)
    expect(mockRes.end).toHaveBeenCalledWith('<html>rendered</html>')
  })

  it('passes the hero, table of contents and related items through to the layout', () => {
    mockListAgents.mockReturnValue([])
    mockListCategories.mockReturnValue([])
    mockReadFileSync.mockReturnValue('<html></html>')
    mockEjsRender.mockReturnValue('<html>rendered</html>')
    const hero = { eyebrow: 'Agent', title: 'Architect', description: 'Plans', usageTitle: 'Use', usage: [] }
    const toc = [{ id: 'scope', text: 'Scope' }]
    const related = [{ title: 'Vitest', href: '/agents/vitest', description: 'Tests' }]

    renderPage(mockRes as ServerResponse, {
      statusCode: 200,
      bodyHtml: '<p>Hello</p>',
      active: { type: 'agent', slug: 'architect' },
      hero,
      toc,
      related,
    })

    expect(mockEjsRender).toHaveBeenCalledWith(expect.objectContaining({ hero, toc, related }))
  })

  describe('template cache', () => {
    const render = () =>
      renderPage(mockRes as ServerResponse, { statusCode: 200, bodyHtml: '', active: { type: 'overview' } })

    beforeEach(() => {
      mockListAgents.mockReturnValue([])
      mockListCategories.mockReturnValue([])
      mockReadFileSync.mockReturnValue('<html></html>')
      mockEjsRender.mockReturnValue('<html></html>')
    })

    it('compiles the template only once while the file is unchanged', () => {
      render()
      render()

      expect(mockEjsCompile).toHaveBeenCalledTimes(1)
      expect(mockEjsRender).toHaveBeenCalledTimes(2)
    })

    it('compiles the template again when the file changes on disk', () => {
      render()
      mockStatSync.mockReturnValue({ mtimeMs: 2 })
      render()

      expect(mockEjsCompile).toHaveBeenCalledTimes(2)
    })
  })

  it('propagates the given status code (e.g. for a 404 page)', () => {
    mockListAgents.mockReturnValue([])
    mockListCategories.mockReturnValue([])
    mockReadFileSync.mockReturnValue('<html></html>')
    mockEjsRender.mockReturnValue('<html>not found</html>')

    renderPage(mockRes as ServerResponse, {
      statusCode: 404,
      bodyHtml: '<p>Not found</p>',
      active: { type: 'agent', slug: 'unknown' },
    })

    expect(mockRes.writeHead).toHaveBeenCalledWith(404)
  })
})
