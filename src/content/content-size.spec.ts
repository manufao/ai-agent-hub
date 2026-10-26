import { describe, expect, it } from 'vitest'
import { listAgents } from './agents.js'
import { agentFilePath, skillFilePath } from './paths.js'
import { readContentFile } from './read-file.js'
import { listCategories } from './skills.js'

describe('content size', () => {
  const MAX_SKILL_LINES = 100
  const MAX_AGENT_LINES = 50

  const skillPaths = listCategories().flatMap(category =>
    category.skills.map(skill => skillFilePath(category.slug, skill.slug)),
  )
  const agentPaths = listAgents().map(agent => agentFilePath(agent.slug))

  it.each(skillPaths)(`should keep %s at most ${MAX_SKILL_LINES} lines long`, path => {
    // When
    const lines = readContentFile(path).trimEnd().split('\n').length

    // Then
    expect(lines).toBeLessThanOrEqual(MAX_SKILL_LINES)
  })

  it.each(agentPaths)(`should keep %s at most ${MAX_AGENT_LINES} lines long`, path => {
    // When
    const lines = readContentFile(path).trimEnd().split('\n').length

    // Then
    expect(lines).toBeLessThanOrEqual(MAX_AGENT_LINES)
  })
})
