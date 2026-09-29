export interface ParsedFrontmatter {
  data: Record<string, string>
  content: string
}

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

/**
 * Minimal YAML frontmatter parser for flat `key: value` pairs, which is all
 * SKILL.md's `name`/`description` fields need. Not a general YAML parser.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = FRONTMATTER_BLOCK.exec(raw)
  if (!match) {
    return { data: {}, content: raw }
  }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["'](.*)["']$/, '$1')

    if (key) {
      data[key] = value
    }
  }

  return { data, content: raw.slice(match[0].length) }
}
