import { IncomingMessage, ServerResponse } from 'http'
import { logger } from '../logging/logger.js'
import { loggableUrl } from '../logging/http-log.js'

/** A self-contained error page: it must not depend on the content files, which may be the cause of the error. */
const errorPage = (title: string, message: string): string =>
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem"><h1>${title}</h1><p>${message}</p><p><a href="/">Retour à l'accueil</a></p></body></html>`

const sendPage = (res: ServerResponse, statusCode: number, html: string): void => {
  res.setHeader('Content-Type', 'text/html;charset=utf-8')
  res.writeHead(statusCode)
  res.end(html)
}

/** Answers 404 with a static French page. */
export const sendNotFound = (res: ServerResponse): void => {
  sendPage(res, 404, errorPage('Page introuvable', "Cette page n'existe pas."))
}

/**
 * Logs an unexpected error and answers 500 with a static French page. The
 * error (stack included) goes to the logs only, never to the response.
 */
export const handleServerError = (req: IncomingMessage, res: ServerResponse, error: unknown): void => {
  logger.error({ err: error, method: req.method, url: loggableUrl(req.url) }, 'http.unhandled')

  if (res.headersSent) {
    res.end()
    return
  }

  sendPage(res, 500, errorPage('Erreur du serveur', 'Une erreur est survenue. Réessayez plus tard.'))
}
