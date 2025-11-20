#!/usr/bin/env node

/**
 * Agent Training - AI Agents Library
 * Minimal web server to display AGENTS.md with EJS and Tailwind CSS
 */

import 'dotenv/config'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { resolve, join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import ejs from 'ejs'
import { marked } from 'marked'
import { Config } from './config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '..')

const nodePath = resolve(process.argv[1])
const modulePath = resolve(fileURLToPath(import.meta.url))
const isCLI = nodePath === modulePath

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

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

export default function main(port: number = Config.port) {
  const requestListener = (request: IncomingMessage, response: ServerResponse) => {
    const url = request.url || '/'

    // Serve static files from /public
    if (url.startsWith('/css/') || url.startsWith('/js/') || url.startsWith('/images/')) {
      const filePath = join(rootDir, 'public', url)

      if (existsSync(filePath)) {
        const ext = extname(filePath)
        const contentType = mimeTypes[ext] || 'application/octet-stream'

        response.setHeader('Content-Type', contentType)
        response.writeHead(200)
        response.end(readFileSync(filePath))
        return
      } else {
        response.writeHead(404)
        response.end('File not found')
        return
      }
    }

    // Serve main page
    if (url === '/' || url === '/index.html') {
      try {
        const agentsPath = join(rootDir, 'AGENTS.md')
        let htmlContent: string

        if (!existsSync(agentsPath)) {
          htmlContent =
            '<h1 class="text-3xl font-bold text-red-600">⚠️ AGENTS.md not found</h1><p class="mt-4 text-gray-600">Please create an AGENTS.md file in the root directory.</p>'
        } else {
          const markdown = readFileSync(agentsPath, 'utf-8')
          htmlContent = marked.parse(markdown) as string
        }

        const templatePath = join(rootDir, 'views', 'index.ejs')
        const html = ejs.render(readFileSync(templatePath, 'utf-8'), {
          content: htmlContent,
        })

        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.writeHead(200)
        response.end(html)
      } catch (error) {
        console.error('Error rendering page:', error)
        response.setHeader('Content-Type', 'text/plain;charset=utf-8')
        response.writeHead(500)
        response.end('Internal Server Error')
      }
      return
    }

    // 404 for all other routes
    response.writeHead(404)
    response.end('Not Found')
  }

  const server = createServer(requestListener)

  if (isCLI) {
    server.listen(port)
    console.log(`
╔════════════════════════════════════════════╗
║   🤖 Agent Training - AI Agents Library   ║
╚════════════════════════════════════════════╝

Server running at: http://localhost:${port}
Press Ctrl+C to stop
    `)
  }

  return server
}

if (isCLI) {
  main()
}
