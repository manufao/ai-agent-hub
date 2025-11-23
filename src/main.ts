#!/usr/bin/env node

/**
 * AI Agent Hub
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
        // eslint-disable-next-line no-console
        console.error('Error rendering page:', error)
        response.setHeader('Content-Type', 'text/plain;charset=utf-8')
        response.writeHead(500)
        response.end('Internal Server Error')
      }
      return
    }

    if (url === '/LICENSE') {
      try {
        const licensePath = join(rootDir, 'LICENSE')
        if (!existsSync(licensePath)) {
          response.writeHead(404)
          response.end('LICENSE file not found')
          return
        }

        const licenseContent = readFileSync(licensePath, 'utf-8')
        response.setHeader('Content-Type', 'text/plain;charset=utf-8')
        response.writeHead(200)
        response.end(licenseContent)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error serving LICENSE file:', error)
        response.setHeader('Content-Type', 'text/plain;charset=utf-8')
        response.writeHead(500)
        response.end('Internal Server Error')
      }
      return
    }

    // Handle agent routes of the form /.agents/<AGENT_NAME>/system-prompt.md
    if (url.startsWith('/.agents/')) {
      try {
        const requestedFilePath = url.substring(1) // Remove the first '/'

        const parts = requestedFilePath.split('/')
        if (parts.length < 3) {
          response.writeHead(404)
          response.end('Invalid Agent URL format')
          return
        }

        // Build the TARGET path (Replace system-prompt.md with README.md)
        // Agent Directory: .agents/<AGENT_NAME>
        const agentDir = join(rootDir, parts[0], parts[1])

        // Target File: README.md
        const targetFilename = 'README.md'
        const targetFilePath = join(agentDir, targetFilename)

        let htmlContent: string

        if (!existsSync(targetFilePath)) {
          htmlContent = `<h2 class="text-3xl font-bold text-red-600">⚠️ Agent README not found</h2><p>Fichier ${targetFilename} non trouvé dans ${agentDir}</p>`
        } else {
          const markdown = readFileSync(targetFilePath, 'utf-8')
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
        // eslint-disable-next-line no-console
        console.error('Error rendering Agent path:', error)
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
    // eslint-disable-next-line no-console
    console.log(`
╔════════════════════════════════════════════╗
║        🤖 AI Agent Hub - Running          ║
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
