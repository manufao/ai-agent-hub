import { readdirSync, existsSync } from 'fs'
import {
  exampleFilePath,
  exampleReferenceFilePath,
  exampleReferencesDirPath,
  examplesDir,
  isSafeSegment,
} from './paths.js'
import { parseFrontmatter } from './frontmatter.js'
import { extractTitle } from './markdown.js'
import { readContentFile, skipUnreadable } from './read-file.js'

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

function listReferences(exampleSlug: string): ReferenceSummary[] {
  const referencesDir = exampleReferencesDirPath(exampleSlug)
  if (!existsSync(referencesDir)) {
    return []
  }

  return readdirSync(referencesDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => {
      const slug = entry.name.replace(/\.md$/, '')
      const filePath = exampleReferenceFilePath(exampleSlug, slug)
      return skipUnreadable(filePath, (): ReferenceSummary => ({
        slug,
        title: extractTitle(readContentFile(filePath), slug),
      }))
    })
    .filter((reference): reference is ReferenceSummary => reference !== undefined)
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Lists every example under `examples/` (a folder holding a SKILL.md). */
export function listExamples(): ExampleSummary[] {
  return readdirSync(examplesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const skillPath = exampleFilePath(entry.name)
      if (!existsSync(skillPath)) {
        return undefined
      }

      return skipUnreadable(skillPath, (): ExampleSummary => {
        const { data } = parseFrontmatter(readContentFile(skillPath))
        return { slug: entry.name, name: data.name ?? entry.name, description: data.description ?? '' }
      })
    })
    .filter((example): example is ExampleSummary => example !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/** Reads a single example by slug. Returns undefined for an unknown or unsafe slug. */
export function getExample(slug: string): Example | undefined {
  if (!isSafeSegment(slug)) {
    return undefined
  }

  const skillPath = exampleFilePath(slug)
  if (!existsSync(skillPath)) {
    return undefined
  }

  const { data, content } = parseFrontmatter(readContentFile(skillPath))
  return {
    slug,
    name: data.name ?? slug,
    description: data.description ?? '',
    content,
    references: listReferences(slug),
  }
}

/** Reads one reference file of an example. Returns undefined for an unknown or unsafe path. */
export function getReference(exampleSlug: string, referenceSlug: string): Reference | undefined {
  if (!isSafeSegment(exampleSlug) || !isSafeSegment(referenceSlug)) {
    return undefined
  }

  const referencePath = exampleReferenceFilePath(exampleSlug, referenceSlug)
  if (!existsSync(referencePath)) {
    return undefined
  }

  const content = readContentFile(referencePath)
  return { slug: referenceSlug, title: extractTitle(content, referenceSlug), content }
}
