import { IncomingMessage, ServerResponse } from 'http'
import ejs from 'ejs'
import { getAgent, listAgents, type AgentSummary } from '../content/agents.js'
import { renderMarkdown } from '../content/markdown.js'
import { agentHero, agentRelated } from '../content/pages.js'
import { decodeSegment, pathnameOf } from '../routing/url.js'
import { renderPage } from '../view.js'

const AGENT_URL = /^\/agents(?:\/([^/]+))?\/?$/

/** Makes the relative links from an agent file to an example reference work on the site. */
const rewriteLinks = (html: string): string =>
  html.replace(
    /href="\.\.\/examples\/([^"/]+)\/references\/([^"/]+)\.md"/g,
    (_match, example: string, reference: string) =>
      `href="/examples/${encodeURIComponent(example)}/references/${encodeURIComponent(reference)}"`,
  )

const renderAgentItem = (agent: AgentSummary): string =>
  `<li><a class="entry-link" href="/agents/${encodeURIComponent(agent.slug)}">${ejs.escapeXML(agent.title)}</a><p class="entry-desc">${ejs.escapeXML(agent.description)}</p></li>`

const renderAgentsIndex = (): string => {
  const sections: string[] = []
  let currentGroup: string | undefined
  let items: string[] = []

  const closeSection = (title: string): void => {
    sections.push(
      `<section class="mt-12"><h2 class="section-title">${ejs.escapeXML(title)}</h2><ul class="entry-list">${items.join('')}</ul></section>`,
    )
  }

  let currentTitle = ''
  for (const agent of listAgents()) {
    if (agent.group !== currentGroup) {
      if (currentGroup !== undefined) {
        closeSection(currentTitle)
      }
      currentGroup = agent.group
      currentTitle = agent.groupTitle
      items = []
    }
    items.push(renderAgentItem(agent))
  }
  if (currentGroup !== undefined) {
    closeSection(currentTitle)
  }

  return `<div class="not-prose"><h1 class="page-title">Agents</h1>${sections.join('')}</div>`
}

/**
 * Controller for agent pages.
 * Handles `/agents` (index) and `/agents/<slug>`, rendering `.agents/<slug>.md`.
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const agentController = (req: IncomingMessage, res: ServerResponse): void => {
  const match = AGENT_URL.exec(pathnameOf(req.url || ''))
  const requestedSlug = match?.[1] === undefined ? '' : decodeSegment(match[1])

  if (!match || requestedSlug === undefined) {
    renderPage(res, {
      statusCode: 404,
      bodyHtml: '<div class="not-prose"><h2 class="alert-title">URL d\'agent invalide</h2></div>',
      active: { type: 'agent', slug: '' },
    })
    return
  }

  if (requestedSlug === '') {
    renderPage(res, { statusCode: 200, bodyHtml: renderAgentsIndex(), active: { type: 'agents' } })
    return
  }

  const agent = getAgent(requestedSlug)

  if (!agent) {
    // The agent name comes from the URL, so it is escaped before reaching the
    // template, which renders content unescaped.
    const safeSlug = ejs.escapeXML(requestedSlug)
    renderPage(res, {
      statusCode: 404,
      bodyHtml: `<div class="not-prose"><h2 class="alert-title">Agent introuvable</h2><p class="mt-3">Aucun agent nommé ${safeSlug} n'est disponible.</p></div>`,
      active: { type: 'agent', slug: requestedSlug },
    })
    return
  }

  const { html, headings } = renderMarkdown(agent.content, { stripTitle: true, stripSummary: true })
  renderPage(res, {
    statusCode: 200,
    bodyHtml: rewriteLinks(html),
    active: { type: 'agent', slug: agent.slug },
    hero: agentHero(agent),
    toc: headings,
    related: agentRelated(agent, listAgents()),
  })
}
