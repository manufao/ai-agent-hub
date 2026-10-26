import { existsSync } from 'fs'
import { overviewFilePath } from './paths.js'
import { readContentFile } from './read-file.js'

/** Reads the site's homepage content (`.agents/README.md`), or undefined if it's missing. */
export function getOverview(): string | undefined {
  return existsSync(overviewFilePath) ? readContentFile(overviewFilePath) : undefined
}
