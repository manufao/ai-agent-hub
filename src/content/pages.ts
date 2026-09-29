import type { Agent, AgentSummary } from './agents.js'
import { categoryTitle, type Skill, type SkillSummary } from './skills.js'
import type { Example, Reference } from './examples.js'
import { extractTitle } from './markdown.js'

export interface UsageRow {
  label: string
  value: string
}

export interface Hero {
  eyebrow: string
  title: string
  description: string
  usageTitle: string
  usage: UsageRow[]
}

export interface RelatedItem {
  title: string
  href: string
  description: string
}

export function agentHero(agent: Agent): Hero {
  return {
    eyebrow: 'Agent',
    title: agent.title,
    description: agent.description,
    usageTitle: 'Utiliser cet agent',
    usage: [
      { label: 'Claude Code', value: `Use the ${agent.slug} agent to …` },
      { label: 'Codex CLI', value: `Ask ${agent.slug} to …` },
      { label: 'Cursor', value: `@${agent.slug}` },
    ],
  }
}

export function skillHero(skill: Skill): Hero {
  return {
    eyebrow: `${categoryTitle(skill.category)} · /${skill.name}`,
    title: extractTitle(skill.content, skill.name),
    description: skill.description,
    usageTitle: 'Utiliser ce skill',
    usage: [
      { label: 'Claude Code', value: `/${skill.slug}` },
      {
        label: 'Codex CLI, Cursor, Gemini CLI',
        value: `.agents/skills/${skill.category}/${skill.slug}/SKILL.md`,
      },
    ],
  }
}

export function agentRelated(currentSlug: string, agents: AgentSummary[]): RelatedItem[] {
  return agents
    .filter(agent => agent.slug !== currentSlug)
    .map(agent => ({
      title: agent.title,
      href: `/agents/${encodeURIComponent(agent.slug)}`,
      description: agent.description,
    }))
}

export function skillRelated(current: Skill, siblings: SkillSummary[]): RelatedItem[] {
  return siblings
    .filter(skill => skill.slug !== current.slug)
    .map(skill => ({
      title: skill.name,
      href: `/skills/${encodeURIComponent(skill.category)}/${encodeURIComponent(skill.slug)}`,
      description: skill.description,
    }))
}

export function exampleHero(example: Example): Hero {
  return {
    eyebrow: 'Exemple',
    title: extractTitle(example.content, example.name),
    description: example.description,
    usageTitle: '',
    usage: [],
  }
}

export function referenceHero(example: Example, reference: Reference): Hero {
  return {
    eyebrow: `Exemple · ${example.name}`,
    title: reference.title,
    description: '',
    usageTitle: '',
    usage: [],
  }
}

/** References of an example; when viewing one of them, also links back to the example itself. */
export function exampleRelated(example: Example, currentReference?: string): RelatedItem[] {
  const references = example.references
    .filter(reference => reference.slug !== currentReference)
    .map(reference => ({
      title: reference.title,
      href: `/examples/${encodeURIComponent(example.slug)}/references/${encodeURIComponent(reference.slug)}`,
      description: '',
    }))

  return currentReference === undefined
    ? references
    : [{ title: example.name, href: `/examples/${encodeURIComponent(example.slug)}`, description: '' }, ...references]
}
