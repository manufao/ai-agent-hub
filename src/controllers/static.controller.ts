import { IncomingMessage, ServerResponse } from 'http'
import { join, resolve, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../..')

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
 * Controller for static files
 * Handles CSS, JS, and image files from /public directory
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const staticController = (req: IncomingMessage, res: ServerResponse): void => {
  const url = req.url || '/'
  const filePath = join(rootDir, 'public', url)

  if (existsSync(filePath)) {
    const ext = extname(filePath)
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    res.setHeader('Content-Type', contentType)
    res.writeHead(200)
    res.end(readFileSync(filePath))
  } else {
    res.writeHead(404)
    res.end('File not found')
  }
}

/**
 * Controller for the LICENSE file
 * Displays the LICENSE file content as plain text
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const licenseController = (req: IncomingMessage, res: ServerResponse): void => {
  try {
    const licensePath = join(rootDir, 'LICENSE')
    if (!existsSync(licensePath)) {
      res.writeHead(404)
      res.end('LICENSE file not found')
      return
    }

    const licenseContent = readFileSync(licensePath, 'utf-8')
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(200)
    res.end(licenseContent)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error serving LICENSE file:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
