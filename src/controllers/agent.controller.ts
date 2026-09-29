import { IncomingMessage, ServerResponse } from 'http'
import ejs from 'ejs'
import { getAgent, listAgents } from '../content/agents.js'
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

const renderAgentsIndex = (): string => {
  const items = listAgents()
    .map(
      agent =>
        `<li><a class="text-blue-600 hover:underline" href="/agents/${encodeURIComponent(agent.slug)}">${ejs.escapeXML(agent.title)}</a> — ${ejs.escapeXML(agent.description)}</li>`,
    )
    .join('')

  return `<h1 class="text-3xl font-bold mb-6">Agents</h1><ul class="list-disc pl-6">${items}</ul>`
}

/**
 * Controller for agent pages.
 * Handles `/agents` (index) and `/agents/<slug>`, rendering `.agents/<slug>.md`.
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const agentController = (req: IncomingMessage, res: ServerResponse): void => {
  try {
    const match = AGENT_URL.exec(pathnameOf(req.url || ''))
    const requestedSlug = match?.[1] === undefined ? '' : decodeSegment(match[1])

    if (!match || requestedSlug === undefined) {
      renderPage(res, {
        statusCode: 404,
        bodyHtml: '<h2 class="text-3xl font-bold text-red-600">⚠️ URL d\'agent invalide</h2>',
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
        bodyHtml: `<h2 class="text-3xl font-bold text-red-600">⚠️ Agent introuvable</h2><p>Aucun agent nommé ${safeSlug} n'est disponible.</p>`,
        active: { type: 'agent', slug: requestedSlug },
      })
      return
    }

    const { html, headings } = renderMarkdown(agent.content, { stripTitle: true })
    renderPage(res, {
      statusCode: 200,
      bodyHtml: rewriteLinks(html),
      active: { type: 'agent', slug: agent.slug },
      hero: agentHero(agent),
      toc: headings,
      related: agentRelated(agent.slug, listAgents()),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering agent page:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
