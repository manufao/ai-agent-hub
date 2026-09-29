/**
 * Test suite for Skills Controller
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'

vi.mock('../content/skills.js', () => ({
  listCategories: vi.fn(),
  getCategory: vi.fn(),
  getSkill: vi.fn(),
}))

vi.mock('../view.js', () => ({
  renderPage: vi.fn(),
}))

vi.mock('../content/markdown.js', () => ({
  renderMarkdown: vi.fn(),
}))

vi.mock('../content/pages.js', () => ({
  skillHero: vi.fn(),
  skillRelated: vi.fn(),
}))

describe('skillsController', () => {
  let skillsController: typeof import('./skills.controller.js').skillsController
  let mockListCategories: Mock
  let mockGetCategory: Mock
  let mockGetSkill: Mock
  let mockRenderPage: Mock
  let mockRenderMarkdown: Mock
  let mockSkillHero: Mock
  let mockSkillRelated: Mock
  let mockReq: Partial<IncomingMessage>
  let mockRes: Mocked<Partial<ServerResponse>>

  const sampleCategory = {
    slug: 'ingenierie',
    title: 'Ingénierie',
    description: 'Tests, revue de code, architecture',
    skills: [{ category: 'ingenierie', slug: 'creer-un-skill', name: 'Créer un skill', description: 'Comment faire' }],
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    const { listCategories, getCategory, getSkill } = await import('../content/skills.js')
    const { renderPage } = await import('../view.js')
    const { renderMarkdown } = await import('../content/markdown.js')
    const { skillHero, skillRelated } = await import('../content/pages.js')

    mockListCategories = listCategories as Mock
    mockGetCategory = getCategory as Mock
    mockGetSkill = getSkill as Mock
    mockRenderPage = renderPage as Mock
    mockRenderMarkdown = renderMarkdown as Mock
    mockSkillHero = skillHero as Mock
    mockSkillRelated = skillRelated as Mock

    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    } as Mocked<Partial<ServerResponse>>

    const module = await import('./skills.controller.js')
    skillsController = module.skillsController
  })

  it('renders the skills index with every category', () => {
    mockReq = { url: '/skills' }
    mockListCategories.mockReturnValue([sampleCategory])

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    const call = mockRenderPage.mock.calls[0][1] as { statusCode: number; bodyHtml: string }
    expect(call.statusCode).toBe(200)
    expect(call.bodyHtml).toContain('Ingénierie')
    expect(call.bodyHtml).toContain('Créer un skill')
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ active: { type: 'skills' } }))
  })

  it('renders an empty-category message when a category has no skills', () => {
    mockReq = { url: '/skills' }
    mockListCategories.mockReturnValue([{ ...sampleCategory, skills: [] }])

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    const call = mockRenderPage.mock.calls[0][1] as { bodyHtml: string }
    expect(call.bodyHtml).toContain("Aucun skill pour l'instant")
  })

  it('renders a category page when the category exists', () => {
    mockReq = { url: '/skills/ingenierie' }
    mockGetCategory.mockReturnValue(sampleCategory)

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetCategory).toHaveBeenCalledWith('ingenierie')
    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({
        statusCode: 200,
        active: { type: 'category', slug: 'ingenierie' },
      }),
    )
  })

  it('renders a category page without a description line when the category has none', () => {
    mockReq = { url: '/skills/ingenierie' }
    mockGetCategory.mockReturnValue({ ...sampleCategory, description: undefined })

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    const call = mockRenderPage.mock.calls[0][1] as { bodyHtml: string }
    expect(call.bodyHtml).not.toContain('Tests, revue de code')
  })

  it('renders the skills index without a description line for a category that has none', () => {
    mockReq = { url: '/skills' }
    mockListCategories.mockReturnValue([{ ...sampleCategory, description: undefined }])

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    const call = mockRenderPage.mock.calls[0][1] as { bodyHtml: string }
    expect(call.bodyHtml).not.toContain('Tests, revue de code')
  })

  it('finds the skill even when the URL carries a query string', () => {
    mockReq = { url: '/skills/ingenierie?ref=x' }
    mockGetCategory.mockReturnValue(undefined)

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetCategory).toHaveBeenCalledWith('ingenierie')
  })

  it('returns 404, not 500, for a malformed percent-encoded category or skill', () => {
    for (const url of ['/skills/%zz', '/skills/ingenierie/%E0%A4%A']) {
      mockRenderPage.mockClear()
      mockReq = { url }

      skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

      expect(mockRenderPage).toHaveBeenCalledWith(mockRes, expect.objectContaining({ statusCode: 404 }))
    }
    expect(mockGetCategory).not.toHaveBeenCalled()
    expect(mockGetSkill).not.toHaveBeenCalled()
  })

  it('returns 404 when the URL is missing entirely', () => {
    mockReq = { url: undefined }

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'skills' } }),
    )
  })

  it('returns 404 when the category does not exist', () => {
    mockReq = { url: '/skills/unknown' }
    mockGetCategory.mockReturnValue(undefined)

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'category', slug: 'unknown' } }),
    )
  })

  it('renders a skill page when the skill exists', () => {
    mockReq = { url: '/skills/ingenierie/creer-un-skill' }
    const skill = {
      category: 'ingenierie',
      slug: 'creer-un-skill',
      name: 'Créer un skill',
      description: 'Comment faire',
      content: '# Créer un skill',
    }
    const headings = [{ id: 'usage', text: 'Usage' }]
    const hero = { eyebrow: 'Ingénierie' }
    const related = [{ title: 'Autre' }]
    mockGetSkill.mockReturnValue(skill)
    mockGetCategory.mockReturnValue(sampleCategory)
    mockRenderMarkdown.mockReturnValue({ html: '<p>Body</p>', headings })
    mockSkillHero.mockReturnValue(hero)
    mockSkillRelated.mockReturnValue(related)

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetSkill).toHaveBeenCalledWith('ingenierie', 'creer-un-skill')
    expect(mockRenderMarkdown).toHaveBeenCalledWith('# Créer un skill', { stripTitle: true })
    expect(mockSkillRelated).toHaveBeenCalledWith(skill, sampleCategory.skills)
    expect(mockRenderPage).toHaveBeenCalledWith(mockRes, {
      statusCode: 200,
      bodyHtml: '<p>Body</p>',
      active: { type: 'skill', category: 'ingenierie', slug: 'creer-un-skill' },
      hero,
      toc: headings,
      related,
    })
  })

  it('renders a skill page with no related items when its category cannot be listed', () => {
    mockReq = { url: '/skills/ingenierie/creer-un-skill' }
    const skill = { category: 'ingenierie', slug: 'creer-un-skill', name: 'x', description: '', content: '# x' }
    mockGetSkill.mockReturnValue(skill)
    mockGetCategory.mockReturnValue(undefined)
    mockRenderMarkdown.mockReturnValue({ html: '', headings: [] })

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockSkillRelated).toHaveBeenCalledWith(skill, [])
  })

  it('returns 404 when the skill does not exist', () => {
    mockReq = { url: '/skills/ingenierie/unknown' }
    mockGetSkill.mockReturnValue(undefined)

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'skill', category: 'ingenierie', slug: 'unknown' } }),
    )
  })

  it('returns 404 for a URL with more than two segments after /skills', () => {
    mockReq = { url: '/skills/a/b/c' }

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockGetCategory).not.toHaveBeenCalled()
    expect(mockGetSkill).not.toHaveBeenCalled()
    expect(mockRenderPage).toHaveBeenCalledWith(
      mockRes,
      expect.objectContaining({ statusCode: 404, active: { type: 'skills' } }),
    )
  })

  it('returns 500 when an error occurs', () => {
    mockReq = { url: '/skills' }
    mockListCategories.mockImplementation(() => {
      throw new Error('boom')
    })

    skillsController(mockReq as IncomingMessage, mockRes as ServerResponse)

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain;charset=utf-8')
    expect(mockRes.writeHead).toHaveBeenCalledWith(500)
    expect(mockRes.end).toHaveBeenCalledWith('Internal Server Error')
  })
})
