import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Repository root, resolved from this file's location (src/content/paths.ts). */
export const rootDir = resolve(__dirname, '../..')

export const agentsDir = join(rootDir, '.agents')
export const skillsDir = join(agentsDir, 'skills')
export const examplesDir = join(rootDir, 'examples')

export const overviewFilePath = join(agentsDir, 'README.md')

export function agentFilePath(slug: string): string {
  return join(agentsDir, `${slug}.md`)
}

export function skillCategoryDirPath(category: string): string {
  return join(skillsDir, category)
}

export function skillCategoryReadmePath(category: string): string {
  return join(skillCategoryDirPath(category), 'README.md')
}

export function skillFilePath(category: string, slug: string): string {
  return join(skillCategoryDirPath(category), slug, 'SKILL.md')
}

export function exampleDirPath(slug: string): string {
  return join(examplesDir, slug)
}

export function exampleFilePath(slug: string): string {
  return join(exampleDirPath(slug), 'SKILL.md')
}

export function exampleReferencesDirPath(exampleSlug: string): string {
  return join(exampleDirPath(exampleSlug), 'references')
}

export function exampleReferenceFilePath(exampleSlug: string, referenceSlug: string): string {
  return join(exampleReferencesDirPath(exampleSlug), `${referenceSlug}.md`)
}

/** A URL path segment is safe to use as a filesystem name: no traversal, no separators. */
const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/

export function isSafeSegment(segment: string): boolean {
  return SAFE_SEGMENT.test(segment) && segment !== '.' && segment !== '..'
}
