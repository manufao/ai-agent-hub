import { IncomingMessage, ServerResponse } from 'http'
import ejs from 'ejs'
import { getExample, getReference, listExamples } from '../content/examples.js'
import { renderMarkdown } from '../content/markdown.js'
import { exampleHero, exampleRelated, referenceHero } from '../content/pages.js'
import { decodeSegment, pathnameOf } from '../routing/url.js'
import { renderPage } from '../view.js'

const EXAMPLES_URL = /^\/examples(?:\/([^/]+))?(?:\/references\/([^/]+))?\/?$/

const notFound = (message: string): string =>
  `<div class="not-prose"><h2 class="alert-title">Introuvable</h2><p class="mt-3">${ejs.escapeXML(message)}</p></div>`

/** Makes the relative links of an example (its references and the agent files) work on the site. */
const rewriteLinks = (html: string, exampleSlug: string): string =>
  html
    .replace(
      /href="references\/([^"/]+)\.md"/g,
      (_match, name: string) =>
        `href="/examples/${encodeURIComponent(exampleSlug)}/references/${encodeURIComponent(name)}"`,
    )
    .replace(
      /href="(?:\.\.\/)+\.agents\/([^"/]+)\.md"/g,
      (_match, agent: string) => `href="/agents/${encodeURIComponent(agent)}"`,
    )

const renderExamplesIndex = (): string => {
  const items = listExamples()
    .map(
      example =>
        `<li><a class="entry-link" href="/examples/${encodeURIComponent(example.slug)}">${ejs.escapeXML(example.name)}</a><p class="entry-desc">${ejs.escapeXML(example.description)}</p></li>`,
    )
    .join('')

  return `<div class="not-prose"><h1 class="page-title">Exemples</h1><ul class="entry-list">${items}</ul></div>`
}

/**
 * Controller for the examples section.
 * Handles `/examples`, `/examples/<slug>` and `/examples/<slug>/references/<name>`,
 * rendering `examples/<slug>/SKILL.md` and `examples/<slug>/references/<name>.md`.
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const examplesController = (req: IncomingMessage, res: ServerResponse): void => {
  try {
    const match = EXAMPLES_URL.exec(pathnameOf(req.url || ''))
    const exampleSlug = match?.[1] === undefined ? '' : decodeSegment(match[1])
    const referenceSlug = match?.[2] === undefined ? '' : decodeSegment(match[2])

    if (!match || exampleSlug === undefined || referenceSlug === undefined) {
      renderPage(res, {
        statusCode: 404,
        bodyHtml: notFound("URL d'exemple invalide"),
        active: { type: 'examples' },
      })
      return
    }

    if (!exampleSlug) {
      renderPage(res, { statusCode: 200, bodyHtml: renderExamplesIndex(), active: { type: 'examples' } })
      return
    }

    const example = getExample(exampleSlug)
    if (!example) {
      renderPage(res, {
        statusCode: 404,
        bodyHtml: notFound(`Aucun exemple nommé ${exampleSlug} n'est disponible.`),
        active: { type: 'example', slug: exampleSlug },
      })
      return
    }

    if (!referenceSlug) {
      const { html, headings } = renderMarkdown(example.content, { stripTitle: true })
      renderPage(res, {
        statusCode: 200,
        bodyHtml: rewriteLinks(html, example.slug),
        active: { type: 'example', slug: example.slug },
        hero: exampleHero(example),
        toc: headings,
        related: exampleRelated(example),
      })
      return
    }

    const reference = getReference(example.slug, referenceSlug)
    if (!reference) {
      renderPage(res, {
        statusCode: 404,
        bodyHtml: notFound(`Aucune référence nommée ${referenceSlug} n'est disponible dans ${exampleSlug}.`),
        active: { type: 'example', slug: example.slug, reference: referenceSlug },
      })
      return
    }

    const { html, headings } = renderMarkdown(reference.content, { stripTitle: true })
    renderPage(res, {
      statusCode: 200,
      bodyHtml: rewriteLinks(html, example.slug),
      active: { type: 'example', slug: example.slug, reference: reference.slug },
      hero: referenceHero(example, reference),
      toc: headings,
      related: exampleRelated(example, reference.slug),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering examples page:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
