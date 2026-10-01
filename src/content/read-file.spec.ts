/**
 * Test suite for the content file helpers
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { logger } from '../logging/logger.js'

vi.mock('fs', () => ({
  readFileSync: vi.fn(),
}))

describe('content file helpers', () => {
  let readContentFile: typeof import('./read-file.js').readContentFile
  let skipUnreadable: typeof import('./read-file.js').skipUnreadable
  let resetReportedProblems: typeof import('./read-file.js').resetReportedProblems
  let mockReadFileSync: Mock

  beforeEach(async () => {
    vi.clearAllMocks()

    mockReadFileSync = (await import('fs')).readFileSync as Mock
    const module = await import('./read-file.js')
    readContentFile = module.readContentFile
    skipUnreadable = module.skipUnreadable
    resetReportedProblems = module.resetReportedProblems
    resetReportedProblems()
  })

  describe('readContentFile', () => {
    it('returns the file content as UTF-8', () => {
      mockReadFileSync.mockReturnValue('---\nname: x\n---\nBody')

      expect(readContentFile('/repo/.agents/a.md')).toBe('---\nname: x\n---\nBody')
      expect(mockReadFileSync).toHaveBeenCalledWith('/repo/.agents/a.md', 'utf-8')
    })

    it('warns once about a frontmatter that is never closed', () => {
      const logWarn = vi.spyOn(logger, 'warn')
      mockReadFileSync.mockReturnValue('---\nname: x\n\nBody without closing')

      readContentFile('/repo/.agents/a.md')
      readContentFile('/repo/.agents/a.md')

      expect(logWarn).toHaveBeenCalledTimes(1)
      expect(logWarn).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'unterminated' }),
        'content.frontmatter_invalid',
      )
    })

    it('does not warn about a valid frontmatter or a file without one', () => {
      const logWarn = vi.spyOn(logger, 'warn')

      mockReadFileSync.mockReturnValue('---\nname: x\n---\nBody')
      readContentFile('/repo/.agents/a.md')
      mockReadFileSync.mockReturnValue('# Just a title')
      readContentFile('/repo/.agents/b.md')

      expect(logWarn).not.toHaveBeenCalled()
    })

    it('lets a read error propagate', () => {
      mockReadFileSync.mockImplementation(() => {
        throw new Error('EACCES')
      })

      expect(() => readContentFile('/repo/.agents/a.md')).toThrow('EACCES')
    })
  })

  describe('skipUnreadable', () => {
    it('returns the value of a successful read', () => {
      expect(skipUnreadable('/repo/.agents/a.md', () => 42)).toBe(42)
    })

    it('skips an unreadable file and logs it once, without any file content', () => {
      const logError = vi.spyOn(logger, 'error')
      const failure = new Error('EACCES: permission denied')
      const read = () => {
        throw failure
      }

      expect(skipUnreadable('/nowhere/.agents/a.md', read)).toBeUndefined()
      expect(skipUnreadable('/nowhere/.agents/a.md', read)).toBeUndefined()

      expect(logError).toHaveBeenCalledTimes(1)
      expect(logError).toHaveBeenCalledWith(
        { file: expect.stringContaining('a.md'), err: failure },
        'content.unreadable',
      )
    })

    it('logs again once the reported problems are reset', () => {
      const logError = vi.spyOn(logger, 'error')
      const read = () => {
        throw new Error('boom')
      }

      skipUnreadable('/x/a.md', read)
      resetReportedProblems()
      skipUnreadable('/x/a.md', read)

      expect(logError).toHaveBeenCalledTimes(2)
    })
  })
})
