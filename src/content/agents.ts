import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { agentsDir, isSafeSegment } from './paths.js'
import { extractSummary, extractTitle } from './markdown.js'

export interface AgentSummary {
  slug: string
  title: string
  description: string
}

export interface Agent extends AgentSummary {
  content: string
}

/** Lists every agent persona directly under `.agents/` (flat `<slug>.md` files, README.md excluded). */
export function listAgents(): AgentSummary[] {
  return readdirSync(agentsDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map(entry => {
      const slug = entry.name.replace(/\.md$/, '')
      const markdown = readFileSync(join(agentsDir, entry.name), 'utf-8')
      return { slug, title: extractTitle(markdown, slug), description: extractSummary(markdown) }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Reads a single agent persona by slug. Returns undefined for an unknown or unsafe slug. */
export function getAgent(slug: string): Agent | undefined {
  if (!isSafeSegment(slug)) {
    return undefined
  }

  const filePath = join(agentsDir, `${slug}.md`)
  if (!existsSync(filePath)) {
    return undefined
  }

  const content = readFileSync(filePath, 'utf-8')
  return { slug, title: extractTitle(content, slug), description: extractSummary(content), content }
}
