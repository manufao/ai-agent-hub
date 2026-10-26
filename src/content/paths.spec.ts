/**
 * Test suite for path helpers
 */

import { describe, expect, it } from 'vitest'
import { join } from 'path'
import {
  agentFilePath,
  agentsDir,
  exampleDirPath,
  exampleFilePath,
  exampleReferenceFilePath,
  exampleReferencesDirPath,
  examplesDir,
  isSafeSegment,
  overviewFilePath,
  skillCategoryDirPath,
  skillCategoryReadmePath,
  skillFilePath,
  skillsDir,
} from './paths.js'

describe('isSafeSegment', () => {
  it('accepts a simple kebab-case name', () => {
    expect(isSafeSegment('my-skill')).toBe(true)
  })

  it('accepts a name with dots (e.g. a slug ending in an extension-like suffix)', () => {
    expect(isSafeSegment('vitest-unit-test.reference')).toBe(true)
  })

  it('rejects a path separator', () => {
    expect(isSafeSegment('foo/bar')).toBe(false)
  })

  it('rejects a lone dot', () => {
    expect(isSafeSegment('.')).toBe(false)
  })

  it('rejects a parent directory reference', () => {
    expect(isSafeSegment('..')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(isSafeSegment('')).toBe(false)
  })
})

describe('agentFilePath', () => {
  it('should return the markdown file of the agent under the agents directory', () => {
    // When
    const path = agentFilePath('inspector-review')

    // Then
    expect(path).toBe(join(agentsDir, 'inspector-review.md'))
  })
})

describe('skillFilePath', () => {
  it('should return the SKILL.md file of the skill under its category directory', () => {
    // When
    const path = skillFilePath('ingenierie', 'unit-testing-conventions')

    // Then
    expect(path).toBe(join(skillsDir, 'ingenierie', 'unit-testing-conventions', 'SKILL.md'))
  })
})

it('should point overviewFilePath to the README of the agents directory', () => {
  expect(overviewFilePath).toBe(join(agentsDir, 'README.md'))
})

describe('skillCategoryDirPath', () => {
  it('should return the category directory under the skills directory', () => {
    // When
    const path = skillCategoryDirPath('ingenierie')

    // Then
    expect(path).toBe(join(skillsDir, 'ingenierie'))
  })
})

describe('skillCategoryReadmePath', () => {
  it('should return the README of the category directory', () => {
    // When
    const path = skillCategoryReadmePath('ingenierie')

    // Then
    expect(path).toBe(join(skillsDir, 'ingenierie', 'README.md'))
  })
})

describe('exampleDirPath', () => {
  it('should return the example directory under the examples directory', () => {
    // When
    const path = exampleDirPath('create-skill-or-agent')

    // Then
    expect(path).toBe(join(examplesDir, 'create-skill-or-agent'))
  })
})

describe('exampleFilePath', () => {
  it('should return the SKILL.md file of the example', () => {
    // When
    const path = exampleFilePath('create-skill-or-agent')

    // Then
    expect(path).toBe(join(examplesDir, 'create-skill-or-agent', 'SKILL.md'))
  })
})

describe('exampleReferencesDirPath', () => {
  it('should return the references directory of the example', () => {
    // When
    const path = exampleReferencesDirPath('create-skill-or-agent')

    // Then
    expect(path).toBe(join(examplesDir, 'create-skill-or-agent', 'references'))
  })
})

describe('exampleReferenceFilePath', () => {
  it('should return the markdown file of the reference in the example references directory', () => {
    // When
    const path = exampleReferenceFilePath('create-skill-or-agent', 'how-use-agent-in-claude')

    // Then
    expect(path).toBe(join(examplesDir, 'create-skill-or-agent', 'references', 'how-use-agent-in-claude.md'))
  })
})
