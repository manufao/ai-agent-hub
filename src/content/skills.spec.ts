/**
 * Test suite for the skills content loader
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

vi.mock('fs', () => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}))

function direntDir(name: string) {
  return { name, isFile: () => false, isDirectory: () => true }
}

function direntFile(name: string) {
  return { name, isFile: () => true, isDirectory: () => false }
}

describe('skills content', () => {
  let listCategories: typeof import('./skills.js').listCategories
  let getCategory: typeof import('./skills.js').getCategory
  let getSkill: typeof import('./skills.js').getSkill
  let mockReaddirSync: Mock
  let mockReadFileSync: Mock
  let mockExistsSync: Mock

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    mockReaddirSync = fs.readdirSync as Mock
    mockReadFileSync = fs.readFileSync as Mock
    mockExistsSync = fs.existsSync as Mock

    const module = await import('./skills.js')
    listCategories = module.listCategories
    getCategory = module.getCategory
    getSkill = module.getSkill
  })

  function mockRepository() {
    mockReaddirSync.mockImplementation((dirPath: unknown) => {
      const path = String(dirPath)
      if (path.endsWith('skills')) {
        return [direntDir('ingenierie'), direntDir('productivite'), direntFile('not-a-category.md')]
      }
      if (path.endsWith('ingenierie')) {
        return [direntDir('create-skill-or-agent'), direntFile('README.md')]
      }
      if (path.endsWith('productivite')) {
        return []
      }
      return []
    })

    mockExistsSync.mockImplementation((filePath: unknown) => {
      const path = String(filePath)
      if (path.endsWith('SKILL.md')) {
        return true
      }
      if (path.endsWith('README.md')) {
        return path.includes('ingenierie') && !path.includes('create-skill-or-agent')
      }
      // Category directory existence check (getCategory)
      return path.endsWith('ingenierie') || path.endsWith('productivite')
    })

    mockReadFileSync.mockImplementation((filePath: unknown) => {
      const path = String(filePath)
      if (path.endsWith('SKILL.md')) {
        return '---\nname: create-skill-or-agent\ndescription: Comment créer un skill\n---\nBody'
      }
      if (path.includes('README.md')) {
        return 'Skills liés au développement logiciel\n\n_Second paragraph._'
      }
      return ''
    })
  }

  describe('listCategories', () => {
    it('lists categories with their skills, using README.md for the description', () => {
      mockRepository()

      expect(listCategories()).toEqual([
        {
          slug: 'ingenierie',
          title: 'Ingénierie',
          description: 'Skills liés au développement logiciel',
          skills: [
            {
              category: 'ingenierie',
              slug: 'create-skill-or-agent',
              name: 'create-skill-or-agent',
              description: 'Comment créer un skill',
            },
          ],
        },
        {
          slug: 'productivite',
          title: 'Productivité',
          description: undefined,
          skills: [],
        },
      ])
    })

    it('falls back to the raw slug as the category title when unmapped', () => {
      mockReaddirSync.mockImplementation((dirPath: unknown) => {
        const path = String(dirPath)
        return path.endsWith('skills') ? [direntDir('juridique')] : []
      })
      mockExistsSync.mockReturnValue(false)

      expect(listCategories()).toEqual([{ slug: 'juridique', title: 'juridique', description: undefined, skills: [] }])
    })

    it('defaults name and description when the skill has no frontmatter', () => {
      mockReaddirSync.mockImplementation((dirPath: unknown) => {
        const path = String(dirPath)
        if (path.endsWith('skills')) {
          return [direntDir('ingenierie')]
        }
        if (path.endsWith('ingenierie')) {
          return [direntDir('sans-frontmatter')]
        }
        return []
      })
      mockExistsSync.mockImplementation((filePath: unknown) => String(filePath).endsWith('SKILL.md'))
      mockReadFileSync.mockReturnValue('Body without frontmatter')

      expect(listCategories()).toEqual([
        {
          slug: 'ingenierie',
          title: 'Ingénierie',
          description: undefined,
          skills: [
            {
              category: 'ingenierie',
              slug: 'sans-frontmatter',
              name: 'sans-frontmatter',
              description: '',
            },
          ],
        },
      ])
    })

    it('leaves the description undefined when the category README has no paragraph', () => {
      mockReaddirSync.mockImplementation((dirPath: unknown) =>
        String(dirPath).endsWith('skills') ? [direntDir('ingenierie')] : [],
      )
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('# Only a title')

      expect(listCategories()[0].description).toBeUndefined()
    })

    it('skips a skill directory that has no SKILL.md', () => {
      mockReaddirSync.mockImplementation((dirPath: unknown) => {
        const path = String(dirPath)
        if (path.endsWith('skills')) {
          return [direntDir('ingenierie')]
        }
        if (path.endsWith('ingenierie')) {
          return [direntDir('empty-folder')]
        }
        return []
      })
      mockExistsSync.mockReturnValue(false)

      expect(listCategories()).toEqual([
        { slug: 'ingenierie', title: 'Ingénierie', description: undefined, skills: [] },
      ])
    })

    it('sorts skills within a category by name', () => {
      mockReaddirSync.mockImplementation((dirPath: unknown) => {
        const path = String(dirPath)
        if (path.endsWith('skills')) {
          return [direntDir('ingenierie')]
        }
        if (path.endsWith('ingenierie')) {
          return [direntDir('zeta'), direntDir('alpha')]
        }
        return []
      })
      mockExistsSync.mockImplementation((filePath: unknown) => String(filePath).endsWith('SKILL.md'))
      mockReadFileSync.mockImplementation((filePath: unknown) => {
        const path = String(filePath)
        if (path.includes('zeta')) {
          return '---\nname: Zeta\n---\nBody'
        }
        return '---\nname: Alpha\n---\nBody'
      })

      const [category] = listCategories()

      expect(category.skills.map(skill => skill.name)).toEqual(['Alpha', 'Zeta'])
    })
  })

  describe('getCategory', () => {
    it('returns undefined for an unsafe category', () => {
      expect(getCategory('..')).toBeUndefined()
    })

    it('returns undefined when the category directory does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      expect(getCategory('unknown')).toBeUndefined()
    })

    it('returns the matching category from the full listing', () => {
      mockRepository()

      expect(getCategory('ingenierie')?.slug).toBe('ingenierie')
    })
  })

  describe('getSkill', () => {
    it('returns undefined for an unsafe category or slug', () => {
      expect(getSkill('..', 'ok')).toBeUndefined()
      expect(getSkill('ok', '..')).toBeUndefined()
    })

    it('returns undefined when SKILL.md does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      expect(getSkill('ingenierie', 'unknown')).toBeUndefined()
    })

    it('reads the skill, defaulting name/description when missing from frontmatter', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('Body without frontmatter')

      expect(getSkill('ingenierie', 'unnamed')).toEqual({
        category: 'ingenierie',
        slug: 'unnamed',
        name: 'unnamed',
        description: '',
        content: 'Body without frontmatter',
      })
    })
  })
})
