/**
 * Test suite for the agents content loader
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { logger } from '../logging/logger.js'
import { resetReportedProblems } from './read-file.js'

vi.mock('fs', () => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  statSync: vi.fn(),
}))

function direntFile(name: string) {
  return { name, isFile: () => true, isDirectory: () => false }
}

function direntDir(name: string) {
  return { name, isFile: () => false, isDirectory: () => true }
}

describe('agents content', () => {
  let listAgents: typeof import('./agents.js').listAgents
  let getAgent: typeof import('./agents.js').getAgent
  let mockReaddirSync: Mock
  let mockReadFileSync: Mock
  let mockStatSync: Mock

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    mockReaddirSync = fs.readdirSync as Mock
    mockReadFileSync = fs.readFileSync as Mock
    mockStatSync = fs.statSync as Mock

    const module = await import('./agents.js')
    listAgents = module.listAgents
    getAgent = module.getAgent
  })

  describe('listAgents', () => {
    const files = (contents: Record<string, string>) => {
      mockReaddirSync.mockReturnValue([
        ...Object.keys(contents).map(name => direntFile(name)),
        direntFile('README.md'),
        direntDir('skills'),
      ])
      mockReadFileSync.mockImplementation((path: unknown) => {
        const name = Object.keys(contents).find(key => String(path).endsWith(key))
        return name ? contents[name] : ''
      })
    }

    it('lists .md files, skipping README.md and directories, with group and order from the frontmatter', () => {
      files({
        'architect.md': '---\ngroup: produit\norder: 2\n---\n\n# Architect\n\nYou plan.',
      })

      expect(listAgents()).toEqual([
        {
          slug: 'architect',
          title: 'Architect',
          description: 'You plan.',
          group: 'produit',
          groupTitle: 'Produit',
          order: 2,
        },
      ])
    })

    it('sorts by group, then by order, then by title', () => {
      files({
        'z.md': '---\ngroup: qualite\norder: 1\n---\n# Z',
        'b.md': '---\ngroup: produit\norder: 2\n---\n# B',
        'a.md': '---\ngroup: produit\norder: 1\n---\n# A',
        'y.md': '---\ngroup: qualite\n---\n# Y',
        'x.md': '---\ngroup: qualite\n---\n# X',
        'other.md': '# Other',
      })

      expect(listAgents().map(agent => agent.slug)).toEqual(['a', 'b', 'z', 'x', 'y', 'other'])
    })

    it('puts agents without a group last, titled by their group slug when unknown', () => {
      files({ 'lone.md': '---\ngroup: mystere\norder: nope\n---\n# Lone' })

      expect(listAgents()[0]).toMatchObject({ group: 'mystere', groupTitle: 'mystere', order: 999 })
    })

    it('falls back to the slug when the file has no top-level heading', () => {
      files({ 'architect.md': 'No heading here' })

      expect(listAgents()).toEqual([
        {
          slug: 'architect',
          title: 'architect',
          description: 'No heading here',
          group: 'autres',
          groupTitle: 'autres',
          order: 999,
        },
      ])
    })
  })

  describe('getAgent', () => {
    it('returns undefined for an unsafe slug', () => {
      expect(getAgent('../secrets')).toBeUndefined()
      expect(mockStatSync).not.toHaveBeenCalled()
    })

    it('returns undefined for the README, which is not an agent', () => {
      expect(getAgent('README')).toBeUndefined()
      expect(mockStatSync).not.toHaveBeenCalled()
    })

    it('returns undefined when the agent file does not exist', () => {
      mockStatSync.mockReturnValue(undefined)

      expect(getAgent('unknown')).toBeUndefined()
    })

    it('returns undefined when the path is a directory', () => {
      mockStatSync.mockReturnValue({ isFile: () => false })

      expect(getAgent('folder')).toBeUndefined()
    })

    it('returns the agent content and title when the file exists', () => {
      mockStatSync.mockReturnValue({ isFile: () => true })
      mockReadFileSync.mockReturnValue('---\ngroup: qualite\norder: 3\n---\n# Architect\n\nBody')

      expect(getAgent('architect')).toEqual({
        slug: 'architect',
        title: 'Architect',
        description: 'Body',
        group: 'qualite',
        groupTitle: 'Qualité et revue',
        order: 3,
        content: '# Architect\n\nBody',
      })
    })
  })

  describe('an unreadable file', () => {
    it('is skipped and logged once, so the other agents are still listed', () => {
      resetReportedProblems()
      const logError = vi.spyOn(logger, 'error')
      mockReaddirSync.mockReturnValue([direntFile('broken.md'), direntFile('ok.md')])
      mockReadFileSync.mockImplementation((path: string) => {
        if (path.endsWith('broken.md')) {
          throw Object.assign(new Error('EACCES'), { code: 'EACCES' })
        }
        return '# Ok\n\nSummary.'
      })

      expect(listAgents().map(agent => agent.slug)).toEqual(['ok'])
      listAgents()

      expect(logError).toHaveBeenCalledTimes(1)
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({ file: '.agents/broken.md' }),
        'content.unreadable',
      )
    })
  })
})
