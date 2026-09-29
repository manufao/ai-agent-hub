import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { examplesDir, isSafeSegment } from './paths.js'
import { parseFrontmatter } from './frontmatter.js'
import { extractTitle } from './markdown.js'

export interface ReferenceSummary {
  slug: string
  title: string
}

export interface Reference extends ReferenceSummary {
  content: string
}

export interface ExampleSummary {
  slug: string
  name: string
  description: string
}

export interface Example extends ExampleSummary {
  content: string
  references: ReferenceSummary[]
}

function listReferences(exampleDir: string): ReferenceSummary[] {
  const referencesDir = join(exampleDir, 'references')
  if (!existsSync(referencesDir)) {
    return []
  }

  return readdirSync(referencesDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => {
      const slug = entry.name.replace(/\.md$/, '')
      return { slug, title: extractTitle(readFileSync(join(referencesDir, entry.name), 'utf-8'), slug) }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Lists every example under `examples/` (a folder holding a SKILL.md). */
export function listExamples(): ExampleSummary[] {
  return readdirSync(examplesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const skillPath = join(examplesDir, entry.name, 'SKILL.md')
      if (!existsSync(skillPath)) {
        return undefined
      }

      const { data } = parseFrontmatter(readFileSync(skillPath, 'utf-8'))
      return { slug: entry.name, name: data.name ?? entry.name, description: data.description ?? '' }
    })
    .filter((example): example is ExampleSummary => example !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Reads a single example by slug. Returns undefined for an unknown or unsafe slug. */
export function getExample(slug: string): Example | undefined {
  if (!isSafeSegment(slug)) {
    return undefined
  }

  const exampleDir = join(examplesDir, slug)
  const skillPath = join(exampleDir, 'SKILL.md')
  if (!existsSync(skillPath)) {
    return undefined
  }

  const { data, content } = parseFrontmatter(readFileSync(skillPath, 'utf-8'))
  return {
    slug,
    name: data.name ?? slug,
    description: data.description ?? '',
    content,
    references: listReferences(exampleDir),
  }
}

/** Reads one reference file of an example. Returns undefined for an unknown or unsafe path. */
export function getReference(exampleSlug: string, referenceSlug: string): Reference | undefined {
  if (!isSafeSegment(exampleSlug) || !isSafeSegment(referenceSlug)) {
    return undefined
  }

  const referencePath = join(examplesDir, exampleSlug, 'references', `${referenceSlug}.md`)
  if (!existsSync(referencePath)) {
    return undefined
  }

  const content = readFileSync(referencePath, 'utf-8')
  return { slug: referenceSlug, title: extractTitle(content, referenceSlug), content }
}
