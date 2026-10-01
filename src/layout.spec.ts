/**
 * Test suite for the site layout template, rendered for real
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import ejs from 'ejs'
import { rootDir } from './content/paths.js'

const templatePath = join(rootDir, 'views', 'index.ejs')

const renderLayout = (): string =>
  ejs.render(readFileSync(templatePath, 'utf-8'), {
    content: '<p>Contenu</p>',
    nav: { agents: [], categories: [], examples: [] },
    active: { type: 'overview' },
    hero: null,
    toc: [],
    related: [],
  })

describe('site layout', () => {
  it('shows the page content', () => {
    expect(renderLayout()).toContain('<p>Contenu</p>')
  })

  it('has a footer linking to the health check', () => {
    const html = renderLayout()

    expect(html).toMatch(/<footer[^>]*>[\s\S]*<a href="\/health"[^>]*>État du site<\/a>[\s\S]*<\/footer>/)
  })
})
