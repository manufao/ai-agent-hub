import { IncomingMessage, ServerResponse } from 'http'
import { join, resolve, dirname, extname, sep } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync, statSync } from 'fs'
import { sendNotFound } from '../http/errors.js'
import { decodeSegment, pathnameOf } from '../routing/url.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../..')
const publicDir = join(rootDir, 'public')

// MIME types for static files
const mimeTypes: Record<string, string> = {
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

/**
 * Resolves a request URL to a file inside `public/`, or undefined when the URL
 * is malformed or points outside it (path traversal, encoded or not).
 */
const resolvePublicFile = (url: string): string | undefined => {
  const decoded = decodeSegment(pathnameOf(url))
  if (decoded === undefined || decoded.includes('\0')) {
    return undefined
  }

  const filePath = resolve(publicDir, `.${decoded}`)
  return filePath.startsWith(publicDir + sep) ? filePath : undefined
}

/**
 * Controller for static files
 * Handles CSS, JS, and image files from /public directory
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const staticController = (req: IncomingMessage, res: ServerResponse): void => {
  const filePath = resolvePublicFile(req.url || '/')

  if (filePath && statSync(filePath, { throwIfNoEntry: false })?.isFile()) {
    const ext = extname(filePath)
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.writeHead(200)
    res.end(readFileSync(filePath))
  } else {
    sendNotFound(res)
  }
}

/**
 * Controller for the LICENSE file
 * Displays the LICENSE file content as plain text
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const licenseController = (req: IncomingMessage, res: ServerResponse): void => {
  const licensePath = join(rootDir, 'LICENSE')
  if (!existsSync(licensePath)) {
    sendNotFound(res)
    return
  }

  res.setHeader('Content-Type', 'text/plain;charset=utf-8')
  res.writeHead(200)
  res.end(readFileSync(licensePath, 'utf-8'))
}
