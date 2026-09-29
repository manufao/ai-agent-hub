/**
 * Test suite for the overview content loader
 */

import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

describe('getOverview', () => {
  let getOverview: typeof import('./overview.js').getOverview
  let mockExistsSync: Mock
  let mockReadFileSync: Mock

  beforeEach(async () => {
    vi.clearAllMocks()

    const fs = await import('fs')
    mockExistsSync = fs.existsSync as Mock
    mockReadFileSync = fs.readFileSync as Mock

    const module = await import('./overview.js')
    getOverview = module.getOverview
  })

  it('returns the file content when .agents/README.md exists', () => {
    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('# Overview')

    expect(getOverview()).toBe('# Overview')
  })

  it('returns undefined when .agents/README.md is missing', () => {
    mockExistsSync.mockReturnValue(false)

    expect(getOverview()).toBeUndefined()
    expect(mockReadFileSync).not.toHaveBeenCalled()
  })
})
