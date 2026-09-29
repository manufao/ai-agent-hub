/**
 * Test suite for the agents content loader
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

vi.mock('fs', () => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
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
  let mockExistsSync: Mock

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    mockReaddirSync = fs.readdirSync as Mock
    mockReadFileSync = fs.readFileSync as Mock
    mockExistsSync = fs.existsSync as Mock

    const module = await import('./agents.js')
    listAgents = module.listAgents
    getAgent = module.getAgent
  })

  describe('listAgents', () => {
    it('lists .md files, skipping README.md and directories', () => {
      mockReaddirSync.mockReturnValue([
        direntFile('architect.md'),
        direntFile('README.md'),
        direntDir('skills'),
        direntFile('vitest-unit-test.md'),
      ])
      mockReadFileSync.mockImplementation((path: unknown) =>
        String(path).includes('architect') ? '# Architect\n\nYou plan.' : '# Vitest Unit Test Agent',
      )

      expect(listAgents()).toEqual([
        { slug: 'architect', title: 'Architect', description: 'You plan.' },
        { slug: 'vitest-unit-test', title: 'Vitest Unit Test Agent', description: '' },
      ])
    })

    it('falls back to the slug when the file has no top-level heading', () => {
      mockReaddirSync.mockReturnValue([direntFile('architect.md')])
      mockReadFileSync.mockReturnValue('No heading here')

      expect(listAgents()).toEqual([{ slug: 'architect', title: 'architect', description: 'No heading here' }])
    })
  })

  describe('getAgent', () => {
    it('returns undefined for an unsafe slug', () => {
      expect(getAgent('../secrets')).toBeUndefined()
      expect(mockExistsSync).not.toHaveBeenCalled()
    })

    it('returns undefined when the agent file does not exist', () => {
      mockExistsSync.mockReturnValue(false)

      expect(getAgent('unknown')).toBeUndefined()
    })

    it('returns the agent content and title when the file exists', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('# Architect\n\nBody')

      expect(getAgent('architect')).toEqual({
        slug: 'architect',
        title: 'Architect',
        description: 'Body',
        content: '# Architect\n\nBody',
      })
    })
  })
})
