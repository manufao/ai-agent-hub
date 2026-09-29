import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** Repository root, resolved from this file's location (src/content/paths.ts). */
export const rootDir = resolve(__dirname, '../..')

export const agentsDir = join(rootDir, '.agents')
export const skillsDir = join(agentsDir, 'skills')
export const examplesDir = join(rootDir, 'examples')

/** A URL path segment is safe to use as a filesystem name: no traversal, no separators. */
const SAFE_SEGMENT = /^[a-zA-Z0-9._-]+$/

export function isSafeSegment(segment: string): boolean {
  return SAFE_SEGMENT.test(segment) && segment !== '.' && segment !== '..'
}
