/**
 * Test suite for page presenters (hero, related items)
 */

import { describe, expect, it } from 'vitest'
import {
  agentHero,
  agentRelated,
  exampleHero,
  exampleRelated,
  referenceHero,
  skillHero,
  skillRelated,
} from './pages.js'

const skill = {
  category: 'ingenierie',
  slug: 'creer-un-skill',
  name: 'creer-un-skill',
  description: 'Explains how to create a skill',
  content: '# Create a skill\n\nBody',
}

describe('agentHero', () => {
  it('describes the agent and how to invoke it in each tool', () => {
    const hero = agentHero({ slug: 'architect', title: 'Architect', description: 'Plans work', content: '' })

    expect(hero).toMatchObject({
      crumbs: [{ label: 'Agents', href: '/agents' }],
      title: 'Architect',
      description: 'Plans work',
    })
    expect(hero.usage.map(row => row.label)).toEqual(['Claude Code', 'Codex CLI', 'Cursor'])
    expect(hero.usage[2].value).toBe('@architect')
  })
})

describe('skillHero', () => {
  it('uses the markdown title, the category and the slash command', () => {
    const hero = skillHero(skill)

    expect(hero.crumbs).toEqual([
      { label: 'Skills', href: '/skills' },
      { label: 'Ingénierie', href: '/skills/ingenierie' },
    ])
    expect(hero.title).toBe('Create a skill')
    expect(hero.description).toBe('Explains how to create a skill')
    expect(hero.usage).toEqual([
      { label: 'Claude Code', value: '/creer-un-skill' },
      { label: 'Codex CLI, Cursor, Gemini CLI', value: '.agents/skills/ingenierie/creer-un-skill/SKILL.md' },
    ])
  })
})

describe('agentRelated', () => {
  it('lists the other agents only', () => {
    const agents = [
      { slug: 'architect', title: 'Architect', description: 'Plans' },
      { slug: 'vitest', title: 'Vitest', description: 'Tests' },
    ]

    expect(agentRelated('architect', agents)).toEqual([
      { title: 'Vitest', href: '/agents/vitest', description: 'Tests' },
    ])
  })
})

describe('skillRelated', () => {
  it('lists the other skills of the category only', () => {
    const siblings = [
      { category: 'ingenierie', slug: 'creer-un-skill', name: 'creer-un-skill', description: 'Self' },
      { category: 'ingenierie', slug: 'autre', name: 'Autre', description: 'Other' },
    ]

    expect(skillRelated(skill, siblings)).toEqual([
      { title: 'Autre', href: '/skills/ingenierie/autre', description: 'Other' },
    ])
  })
})

const example = {
  slug: 'demo',
  name: 'demo',
  description: 'A demo',
  content: '# Demo title\n\nBody',
  references: [
    { slug: 'a', title: 'Ref A' },
    { slug: 'b', title: 'Ref B' },
  ],
}

describe('exampleHero', () => {
  it('has no usage panel content', () => {
    expect(exampleHero(example)).toEqual({
      crumbs: [{ label: 'Exemples', href: '/examples' }],
      title: 'Demo title',
      description: 'A demo',
      usageTitle: '',
      usage: [],
    })
  })
})

describe('referenceHero', () => {
  it('names the parent example in the eyebrow', () => {
    expect(referenceHero(example, { slug: 'a', title: 'Ref A', content: '' })).toMatchObject({
      crumbs: [
        { label: 'Exemples', href: '/examples' },
        { label: 'demo', href: '/examples/demo' },
      ],
      title: 'Ref A',
    })
  })
})

describe('exampleRelated', () => {
  it('lists every reference from the example page', () => {
    expect(exampleRelated(example).map(item => item.href)).toEqual([
      '/examples/demo/references/a',
      '/examples/demo/references/b',
    ])
  })

  it('links back to the example and lists the other references from a reference page', () => {
    expect(exampleRelated(example, 'a').map(item => item.href)).toEqual([
      '/examples/demo',
      '/examples/demo/references/b',
    ])
  })
})
