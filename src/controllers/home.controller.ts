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
 * Controller for the home page
 * Displays the content of AGENTS.md rendered as HTML
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const homeController = (req: IncomingMessage, res: ServerResponse): void => {
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

    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.writeHead(200)
    res.end(html)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering page:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
