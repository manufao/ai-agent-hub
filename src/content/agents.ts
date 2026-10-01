import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { agentsDir, isSafeSegment } from './paths.js'
import { parseFrontmatter } from './frontmatter.js'
import { extractSummary, extractTitle } from './markdown.js'
import { readContentFile, skipUnreadable } from './read-file.js'

export interface AgentSummary {
  slug: string
  title: string
  description: string
  group: string
  groupTitle: string
  order: number
}

export interface Agent extends AgentSummary {
  content: string
}

const GROUPS = ['produit', 'architecture', 'qualite', 'livraison']

const GROUP_TITLES: Record<string, string> = {
  produit: 'Produit',
  architecture: 'Architecture et implémentation',
  qualite: 'Qualité et revue',
  livraison: 'Livraison',
}

const UNGROUPED = 'autres'
const UNORDERED = 999

export function groupTitle(group: string): string {
  return GROUP_TITLES[group] ?? group
}

function groupRank(group: string): number {
  const rank = GROUPS.indexOf(group)
  return rank === -1 ? GROUPS.length : rank
}

function readAgent(slug: string, raw: string): Agent {
  const { data, content } = parseFrontmatter(raw)
  const group = data.group ?? UNGROUPED
  return {
    slug,
    title: extractTitle(content, slug),
    description: extractSummary(content),
    group,
    groupTitle: groupTitle(group),
    order: Number.parseInt(data.order ?? '', 10) || UNORDERED,
    content,
  }
}

/**
 * Lists every agent persona directly under `.agents/` (flat `<slug>.md` files, README.md excluded),
 * grouped by the `group` frontmatter field and ordered by `order` inside each group.
 */
export function listAgents(): AgentSummary[] {
  return readdirSync(agentsDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md') && entry.name !== 'README.md')
    .map(entry => {
      const filePath = join(agentsDir, entry.name)
      return skipUnreadable(filePath, (): AgentSummary => {
        const agent = readAgent(entry.name.replace(/\.md$/, ''), readContentFile(filePath))
        return {
          slug: agent.slug,
          title: agent.title,
          description: agent.description,
          group: agent.group,
          groupTitle: agent.groupTitle,
          order: agent.order,
        }
      })
    })
    .filter((agent): agent is AgentSummary => agent !== undefined)
    .sort((a, b) => groupRank(a.group) - groupRank(b.group) || a.order - b.order || a.title.localeCompare(b.title))
}

/** Reads a single agent persona by slug. Returns undefined for an unknown or unsafe slug. */
export function getAgent(slug: string): Agent | undefined {
  if (!isSafeSegment(slug) || slug === 'README') {
    return undefined
  }

  const filePath = join(agentsDir, `${slug}.md`)
  if (!statSync(filePath, { throwIfNoEntry: false })?.isFile()) {
    return undefined
  }

  return readAgent(slug, readContentFile(filePath))
}
