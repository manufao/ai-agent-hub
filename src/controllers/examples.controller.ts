import { IncomingMessage, ServerResponse } from 'http'
import ejs from 'ejs'
import { getExample, getReference, listExamples } from '../content/examples.js'
import { renderMarkdown } from '../content/markdown.js'
import { exampleHero, exampleRelated, referenceHero } from '../content/pages.js'
import { renderPage } from '../view.js'

const EXAMPLES_URL = /^\/examples(?:\/([^/]+))?(?:\/references\/([^/]+))?\/?$/

const notFound = (message: string): string =>
  `<h2 class="text-3xl font-bold text-red-600">⚠️ Introuvable</h2><p>${ejs.escapeXML(message)}</p>`

/** Makes the relative links of an example (its references and the agent files) work on the site. */
const rewriteLinks = (html: string, exampleSlug: string): string =>
  html
    .replace(
      /href="references\/([^"/]+)\.md"/g,
      (_match, name: string) => `href="/examples/${exampleSlug}/references/${name}"`,
    )
    .replace(/href="(?:\.\.\/)+\.agents\/([^"/]+)\.md"/g, (_match, agent: string) => `href="/agents/${agent}"`)

const renderExamplesIndex = (): string => {
  const items = listExamples()
    .map(
      example =>
        `<li><a class="text-blue-600 hover:underline" href="/examples/${encodeURIComponent(example.slug)}">${ejs.escapeXML(example.name)}</a> — ${ejs.escapeXML(example.description)}</li>`,
    )
    .join('')

  return `<h1 class="text-3xl font-bold mb-6">Exemples</h1><ul class="list-disc pl-6">${items}</ul>`
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
    const match = EXAMPLES_URL.exec(req.url || '')

    if (!match) {
      renderPage(res, {
        statusCode: 404,
        bodyHtml: notFound("URL d'exemple invalide"),
        active: { type: 'examples' },
      })
      return
    }

    const exampleSlug = match[1] ? decodeURIComponent(match[1]) : undefined
    const referenceSlug = match[2] ? decodeURIComponent(match[2]) : undefined

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
