import { IncomingMessage, ServerResponse } from 'http'
import { renderMarkdown } from '../content/markdown.js'
import { getOverview } from '../content/overview.js'
import { renderPage } from '../view.js'

/**
 * Controller for the home page.
 * Displays `.agents/README.md` (the site's overview content) rendered as HTML.
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const homeController = (req: IncomingMessage, res: ServerResponse): void => {
  try {
    const overview = getOverview()

    if (overview === undefined) {
      renderPage(res, {
        statusCode: 200,
        bodyHtml:
          '<h1 class="text-3xl font-bold text-red-600">⚠️ .agents/README.md introuvable</h1><p class="mt-4 text-gray-600">Merci de créer un fichier .agents/README.md.</p>',
        active: { type: 'overview' },
      })
      return
    }

    const { html, headings } = renderMarkdown(overview)
    renderPage(res, { statusCode: 200, bodyHtml: html, active: { type: 'overview' }, toc: headings })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering home page:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
