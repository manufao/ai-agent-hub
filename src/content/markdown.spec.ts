/**
 * Test suite for markdown helpers
 */

import { describe, expect, it } from 'vitest'
import { extractSummary, extractTitle, renderMarkdown, slugify } from './markdown.js'

describe('extractTitle', () => {
  it('returns the first top-level heading', () => {
    expect(extractTitle('# Architect\n\nBody', 'fallback')).toBe('Architect')
  })

  it('falls back when there is no heading', () => {
    expect(extractTitle('No heading', 'fallback')).toBe('fallback')
  })
})

describe('extractSummary', () => {
  it('returns the first plain paragraph, skipping headings, quotes, lists and code', () => {
    const markdown = '# Title\n\n> A note\n\n- item\n\n```ts\ncode\n```\n\nYou are **the** `Agent`,\nready to work.'

    expect(extractSummary(markdown)).toBe('You are the Agent, ready to work.')
  })

  it('returns an empty string when there is no paragraph', () => {
    expect(extractSummary('# Only a title')).toBe('')
  })
})

describe('slugify', () => {
  it('lowercases, strips accents and hyphenates', () => {
    expect(slugify('Périmètre & Hors-périmètre !')).toBe('perimetre-hors-perimetre')
  })
})

describe('renderMarkdown', () => {
  it('gives each h2 an id and returns the headings', () => {
    const { html, headings } = renderMarkdown('# Title\n\n## First part\n\ntext\n\n## Second **part**')

    expect(html).toContain('<h2 id="first-part">First part</h2>')
    expect(html).toContain('<h2 id="second-part">Second <strong>part</strong></h2>')
    expect(headings).toEqual([
      { id: 'first-part', text: 'First part' },
      { id: 'second-part', text: 'Second part' },
    ])
  })

  it('keeps ids unique when two headings share a name', () => {
    const { headings } = renderMarkdown('## Same\n\n## Same')

    expect(headings.map(h => h.id)).toEqual(['same', 'same-2'])
  })

  it('falls back to a generic id when a heading has no alphanumeric characters', () => {
    const { headings } = renderMarkdown('## ???')

    expect(headings[0].id).toBe('section')
  })

  it('keeps the leading h1 by default', () => {
    expect(renderMarkdown('# Title\n\ntext').html).toContain('<h1>Title</h1>')
  })

  it('removes the first paragraph when stripSummary is set', () => {
    const { html } = renderMarkdown('# Title\n\nSummary.\n\nSecond paragraph.', {
      stripTitle: true,
      stripSummary: true,
    })

    expect(html).not.toContain('Summary.')
    expect(html).toContain('Second paragraph.')
  })

  it('removes the leading h1 when stripTitle is set', () => {
    expect(renderMarkdown('# Title\n\ntext', { stripTitle: true }).html).not.toContain('<h1>')
  })
})
