/**
 * Test suite for the examples content loader
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { logger } from '../logging/logger.js'
import { resetReportedProblems } from './read-file.js'

vi.mock('fs', () => ({
  readdirSync: vi.fn(),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
}))

const dir = (name: string) => ({ name, isFile: () => false, isDirectory: () => true })
const file = (name: string) => ({ name, isFile: () => true, isDirectory: () => false })

describe('examples content', () => {
  let listExamples: typeof import('./examples.js').listExamples
  let getExample: typeof import('./examples.js').getExample
  let getReference: typeof import('./examples.js').getReference
  let mockReaddirSync: Mock
  let mockReadFileSync: Mock
  let mockExistsSync: Mock

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    mockReaddirSync = fs.readdirSync as Mock
    mockReadFileSync = fs.readFileSync as Mock
    mockExistsSync = fs.existsSync as Mock

    const module = await import('./examples.js')
    listExamples = module.listExamples
    getExample = module.getExample
    getReference = module.getReference
  })

  describe('listExamples', () => {
    it('lists example folders that hold a SKILL.md, sorted by name', () => {
      mockReaddirSync.mockReturnValue([dir('zeta'), dir('alpha'), dir('no-skill'), file('notes.md')])
      mockExistsSync.mockImplementation((path: unknown) => !String(path).includes('no-skill'))
      mockReadFileSync.mockImplementation((path: unknown) =>
        String(path).includes('zeta') ? '---\nname: Zeta\ndescription: Last\n---\nBody' : 'No frontmatter',
      )

      expect(listExamples()).toEqual([
        { slug: 'alpha', name: 'alpha', description: '' },
        { slug: 'zeta', name: 'Zeta', description: 'Last' },
      ])
    })
  })

  describe('getExample', () => {
    it('returns undefined for an unsafe slug', () => {
      expect(getExample('..')).toBeUndefined()
    })

    it('returns undefined when SKILL.md is missing', () => {
      mockExistsSync.mockReturnValue(false)

      expect(getExample('unknown')).toBeUndefined()
    })

    it('reads the example and lists its references', () => {
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([file('b.md'), file('a.md'), file('image.png'), dir('sub')])
      mockReadFileSync.mockImplementation((path: unknown) => {
        const value = String(path)
        if (value.endsWith('SKILL.md')) {
          return '---\nname: demo\ndescription: A demo\n---\n# Demo'
        }
        return value.endsWith('a.md') ? '# Alpha ref' : 'No heading'
      })

      expect(getExample('demo')).toEqual({
        slug: 'demo',
        name: 'demo',
        description: 'A demo',
        content: '# Demo',
        references: [
          { slug: 'a', title: 'Alpha ref' },
          { slug: 'b', title: 'b' },
        ],
      })
    })

    it('defaults name and description and returns no references without a references folder', () => {
      mockExistsSync.mockImplementation((path: unknown) => String(path).endsWith('SKILL.md'))
      mockReadFileSync.mockReturnValue('Body only')

      expect(getExample('bare')).toEqual({
        slug: 'bare',
        name: 'bare',
        description: '',
        content: 'Body only',
        references: [],
      })
    })
  })

  describe('getReference', () => {
    it('returns undefined for an unsafe example or reference slug', () => {
      expect(getReference('..', 'ok')).toBeUndefined()
      expect(getReference('ok', '..')).toBeUndefined()
    })

    it('returns undefined when the reference file is missing', () => {
      mockExistsSync.mockReturnValue(false)

      expect(getReference('demo', 'unknown')).toBeUndefined()
    })

    it('reads the reference with its title', () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue('# Guide\n\nBody')

      expect(getReference('demo', 'guide')).toEqual({ slug: 'guide', title: 'Guide', content: '# Guide\n\nBody' })
    })
  })

  describe('an unreadable file', () => {
    it('is skipped and logged when listing the examples', () => {
      resetReportedProblems()
      const logError = vi.spyOn(logger, 'error')
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([dir('broken'), dir('ok')])
      mockReadFileSync.mockImplementation((path: string) => {
        if (path.includes('broken')) {
          throw new Error('EACCES')
        }
        return '---\nname: ok\n---\nBody'
      })

      expect(listExamples().map(example => example.slug)).toEqual(['ok'])
      expect(logError).toHaveBeenCalledWith(
        expect.objectContaining({ file: 'examples/broken/SKILL.md' }),
        'content.unreadable',
      )
    })

    it('is skipped when listing the references of an example', () => {
      resetReportedProblems()
      const logError = vi.spyOn(logger, 'error')
      mockExistsSync.mockReturnValue(true)
      mockReaddirSync.mockReturnValue([file('a.md'), file('b.md')])
      mockReadFileSync.mockImplementation((path: string) => {
        if (path.endsWith('b.md')) {
          throw new Error('EACCES')
        }
        return '---\nname: ok\n---\n# Title A'
      })

      expect(getExample('ok')?.references.map(reference => reference.slug)).toEqual(['a'])
      expect(logError).toHaveBeenCalledTimes(1)
    })
  })
})
