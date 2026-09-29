import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { agentsDir } from './paths.js'

/** Reads the site's homepage content (`.agents/README.md`), or undefined if it's missing. */
export function getOverview(): string | undefined {
  const overviewPath = join(agentsDir, 'README.md')
  return existsSync(overviewPath) ? readFileSync(overviewPath, 'utf-8') : undefined
}
