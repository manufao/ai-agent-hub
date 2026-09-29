import { marked } from 'marked'

export interface Heading {
  id: string
  text: string
}

export interface RenderedMarkdown {
  html: string
  headings: Heading[]
}

export interface RenderOptions {
  /** Drop the leading `<h1>` (the page hero already displays the title). */
  stripTitle?: boolean
}

const TITLE_LINE = /^#\s+(.+)$/m
const LEADING_H1 = /^\s*<h1[^>]*>[\s\S]*?<\/h1>\s*/
const H2 = /<h2>([\s\S]*?)<\/h2>/g
const NON_PARAGRAPH_START = /^(#|>|[-*]\s|\d+\.\s|```|\|)/

export function extractTitle(markdown: string, fallback: string): string {
  const match = TITLE_LINE.exec(markdown)
  return match?.[1]?.trim() || fallback
}

/** First plain paragraph of a markdown document, with inline formatting removed. */
export function extractSummary(markdown: string): string {
  const paragraph = markdown
    .split(/\r?\n\r?\n/)
    .map(block => block.trim())
    .find(block => block !== '' && !NON_PARAGRAPH_START.test(block))

  return paragraph ? paragraph.replace(/\s*\n\s*/g, ' ').replace(/[*_`]/g, '') : ''
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Renders markdown to HTML, giving every `<h2>` an id and returning them for a table of contents. */
export function renderMarkdown(markdown: string, options: RenderOptions = {}): RenderedMarkdown {
  let html = marked.parse(markdown) as string
  if (options.stripTitle) {
    html = html.replace(LEADING_H1, '')
  }

  const headings: Heading[] = []
  const seen = new Map<string, number>()

  html = html.replace(H2, (_match, inner: string) => {
    const text = inner.replace(/<[^>]*>/g, '').trim()
    const base = slugify(text) || 'section'
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count === 0 ? base : `${base}-${count + 1}`
    headings.push({ id, text })
    return `<h2 id="${id}">${inner}</h2>`
  })

  return { html, headings }
}
