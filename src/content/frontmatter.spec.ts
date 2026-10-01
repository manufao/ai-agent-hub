/**
 * Test suite for the minimal frontmatter parser
 */

import { describe, expect, it } from 'vitest'
import { hasUnterminatedFrontmatter, parseFrontmatter } from './frontmatter.js'

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

  it('strips matching surrounding quotes from values', () => {
    const raw = '---\nname: "quoted-name"\ndescription: \'single quoted\'\n---\nBody'

    expect(parseFrontmatter(raw).data).toEqual({ name: 'quoted-name', description: 'single quoted' })
  })

  it('keeps mismatched quotes as they are', () => {
    expect(parseFrontmatter('---\nname: "abc\'\n---\nBody').data).toEqual({ name: '"abc\'' })
  })

  it('keeps colons inside a value', () => {
    expect(parseFrontmatter('---\ndescription: Use when: foo\n---\nBody').data).toEqual({
      description: 'Use when: foo',
    })
  })

  it('folds a `>` block scalar into a single line', () => {
    const raw = '---\nname: demo\ndescription: >\n  First line\n  Use when: second\n\nother: x\n---\nBody'

    expect(parseFrontmatter(raw).data).toEqual({
      name: 'demo',
      description: 'First line Use when: second',
      other: 'x',
    })
  })

  it('keeps line breaks in a `|` block scalar', () => {
    const raw = '---\ndescription: |-\n  Line one\n  Line two\n---\nBody'

    expect(parseFrontmatter(raw).data).toEqual({ description: 'Line one\nLine two' })
  })

  it('folds a multi-line plain value', () => {
    const raw = '---\ndescription: Starts here\n  and continues\n---\nBody'

    expect(parseFrontmatter(raw).data).toEqual({ description: 'Starts here and continues' })
  })

  it('ignores lines that are neither a key nor a continuation', () => {
    const raw = '---\nnot-a-pair\n: no key\nname: ok\n---\nBody'

    expect(parseFrontmatter(raw).data).toEqual({ name: 'ok' })
  })

  it('returns no data for a block with only unusable lines', () => {
    expect(parseFrontmatter('---\n  indented but no key\n---\nBody').data).toEqual({})
  })
})

describe('hasUnterminatedFrontmatter', () => {
  it('detects a frontmatter block that is opened but never closed', () => {
    expect(hasUnterminatedFrontmatter('---\nname: x\n\n# Body')).toBe(true)
  })

  it('accepts a closed block and a file without frontmatter', () => {
    expect(hasUnterminatedFrontmatter('---\nname: x\n---\nBody')).toBe(false)
    expect(hasUnterminatedFrontmatter('# Body')).toBe(false)
  })
})
