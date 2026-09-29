/**
 * Test suite for the minimal frontmatter parser
 */

import { describe, expect, it } from 'vitest'
import { parseFrontmatter } from './frontmatter.js'

describe('parseFrontmatter', () => {
  it('returns the raw content untouched when there is no frontmatter block', () => {
    const raw = '# Title\n\nBody text'

    expect(parseFrontmatter(raw)).toEqual({ data: {}, content: raw })
  })

  it('parses flat key/value pairs from the frontmatter block', () => {
    const raw = '---\nname: my-skill\ndescription: Does a thing\n---\n\n# Body\n'

    const { data, content } = parseFrontmatter(raw)

    expect(data).toEqual({ name: 'my-skill', description: 'Does a thing' })
    expect(content).toBe('\n# Body\n')
  })

  it('strips surrounding quotes from values', () => {
    const raw = '---\nname: "quoted-name"\ndescription: \'single quoted\'\n---\nBody'

    const { data } = parseFrontmatter(raw)

    expect(data).toEqual({ name: 'quoted-name', description: 'single quoted' })
  })

  it('ignores lines without a colon and lines with an empty key', () => {
    const raw = '---\nnot-a-pair\n: no key\nname: ok\n---\nBody'

    const { data } = parseFrontmatter(raw)

    expect(data).toEqual({ name: 'ok' })
  })
})
