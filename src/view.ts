import { ServerResponse } from 'http'
import { readFileSync } from 'fs'
import { join } from 'path'
import ejs from 'ejs'
import { rootDir } from './content/paths.js'
import { listAgents, type AgentSummary } from './content/agents.js'
import { listCategories, type CategorySummary } from './content/skills.js'
import { listExamples, type ExampleSummary } from './content/examples.js'
import type { Heading } from './content/markdown.js'
import type { Hero, RelatedItem } from './content/pages.js'

export interface NavData {
  agents: AgentSummary[]
  categories: CategorySummary[]
  examples: ExampleSummary[]
}

export type ActiveSection =
  | { type: 'overview' }
  | { type: 'agent'; slug: string }
  | { type: 'skills' }
  | { type: 'category'; slug: string }
  | { type: 'skill'; category: string; slug: string }
  | { type: 'examples' }
  | { type: 'example'; slug: string; reference?: string }

export interface RenderPageOptions {
  statusCode: number
  bodyHtml: string
  active: ActiveSection
  hero?: Hero
  toc?: Heading[]
  related?: RelatedItem[]
}

/**
 * Renders a page inside the shared site layout (sidebar navigation, optional
 * hero, content, table of contents and related items), and writes it to the
 * response. Every controller that produces HTML goes through this so the
 * layout is built consistently in one place.
 */
export const renderPage = (res: ServerResponse, options: RenderPageOptions): void => {
  const nav: NavData = { agents: listAgents(), categories: listCategories(), examples: listExamples() }
  const templatePath = join(rootDir, 'views', 'index.ejs')
  const html = ejs.render(readFileSync(templatePath, 'utf-8'), {
    content: options.bodyHtml,
    nav,
    active: options.active,
    hero: options.hero ?? null,
    toc: options.toc ?? [],
    related: options.related ?? [],
  })

  res.setHeader('Content-Type', 'text/html;charset=utf-8')
  res.writeHead(options.statusCode)
  res.end(html)
}
