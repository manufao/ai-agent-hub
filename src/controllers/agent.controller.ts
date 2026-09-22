import { IncomingMessage, ServerResponse } from 'http'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync, existsSync } from 'fs'
import ejs from 'ejs'
import { marked } from 'marked'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = resolve(__dirname, '../..')

/**
 * Controller for agent pages
 * Handles routes of type `/.agents/<AGENT_NAME>/system-prompt.md`
 * and displays the corresponding README.md
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const agentController = (req: IncomingMessage, res: ServerResponse): void => {
  try {
    const url = req.url || ''
    const requestedFilePath = url.substring(1) // Remove the first '/'

    const parts = requestedFilePath.split('/')
    if (parts.length < 3) {
      res.writeHead(404)
      res.end('Invalid Agent URL format')
      return
    }

    // Build the TARGET path (Replace system-prompt.md with README.md)
    // Agent Directory: .agents/<AGENT_NAME>
    const agentDir = join(rootDir, parts[0], parts[1])

    // Target File: README.md
    const targetFilename = 'README.md'
    const targetFilePath = join(agentDir, targetFilename)

    let htmlContent: string
    let statusCode: number

    if (!existsSync(targetFilePath)) {
      // The agent name comes from the URL, so it is escaped before reaching the
      // template, which renders content unescaped.
      const agentName = ejs.escapeXML(parts[1])
      htmlContent = `<h2 class="text-3xl font-bold text-red-600">⚠️ Agent not found</h2><p>No agent named ${agentName} is available.</p>`
      statusCode = 404
    } else {
      const markdown = readFileSync(targetFilePath, 'utf-8')
      htmlContent = marked.parse(markdown) as string
      statusCode = 200
    }

    const templatePath = join(rootDir, 'views', 'index.ejs')
    const html = ejs.render(readFileSync(templatePath, 'utf-8'), {
      content: htmlContent,
      isHome: false,
    })

    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.writeHead(statusCode)
    res.end(html)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering Agent path:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
