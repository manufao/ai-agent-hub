import { IncomingMessage, ServerResponse } from 'http'
import { statSync } from 'fs'
import { agentsDir } from '../content/paths.js'

/**
 * Controller for the health check.
 * Answers 200 when the content directory is readable and 503 otherwise, without
 * reading any content or rendering the site layout.
 * @param _req - HTTP request object
 * @param res - HTTP response object
 */
export const healthController = (_req: IncomingMessage, res: ServerResponse): void => {
  const healthy = statSync(agentsDir, { throwIfNoEntry: false })?.isDirectory() === true

  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.writeHead(healthy ? 200 : 503)
  res.end(healthy ? 'ok' : 'unavailable')
}
