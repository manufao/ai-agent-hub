import { readFileSync } from 'fs'
import { relative } from 'path'
import { logger } from '../logging/logger.js'
import { hasUnterminatedFrontmatter } from './frontmatter.js'
import { rootDir } from './paths.js'

const reported = new Set<string>()

/** Logs a content problem once per event and file: pages are rendered on every request, so a broken file must not flood the logs. */
function logOnce(level: 'warn' | 'error', event: string, path: string, fields: Record<string, unknown> = {}): void {
  const file = relative(rootDir, path)
  const key = `${event}:${file}`
  if (reported.has(key)) {
    return
  }

  reported.add(key)
  logger[level]({ file, ...fields }, event)
}

/** Forgets the problems already logged. Used by tests. */
export function resetReportedProblems(): void {
  reported.clear()
}

/** Reads a content file as UTF-8, and warns (once) when its frontmatter is opened but never closed. */
export function readContentFile(path: string): string {
  const raw = readFileSync(path, 'utf-8')
  if (hasUnterminatedFrontmatter(raw)) {
    logOnce('warn', 'content.frontmatter_invalid', path, { reason: 'unterminated' })
  }
  return raw
}

/**
 * Runs the read of one content file for a listing. An unreadable file is
 * logged (once) and skipped, so the rest of the site keeps working without it.
 */
export function skipUnreadable<T>(path: string, read: () => T): T | undefined {
  try {
    return read()
  } catch (error) {
    logOnce('error', 'content.unreadable', path, { err: error })
    return undefined
  }
}
