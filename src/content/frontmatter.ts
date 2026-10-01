export interface ParsedFrontmatter {
  data: Record<string, string>
  content: string
}

const FRONTMATTER_BLOCK = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/
const KEY_LINE = /^([A-Za-z0-9_-]+):[ \t]*(.*)$/
const BLOCK_SCALAR = /^([>|])[+-]?$/

function unquote(value: string): string {
  const match = /^"(.*)"$|^'(.*)'$/.exec(value)
  return match ? (match[1] ?? match[2]) : value
}

/**
 * Minimal YAML frontmatter parser for what SKILL.md needs: top-level
 * `key: value` pairs, quoted values, multi-line plain values and block
 * scalars (`>` folds lines into spaces, `|` keeps line breaks). Not a general
 * YAML parser.
 */
export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const match = FRONTMATTER_BLOCK.exec(raw)
  if (!match) {
    return { data: {}, content: raw }
  }

  const data: Record<string, string> = {}
  let key: string | undefined
  let indicator = ''
  let lines: string[] = []

  const flush = (): void => {
    if (key === undefined) {
      return
    }

    const separator = indicator === '|' ? '\n' : ' '
    const value = lines
      .map(line => line.trim())
      .filter(line => line !== '')
      .join(separator)
    data[key] = indicator === '' ? unquote(value) : value
  }

  for (const line of match[1].split(/\r?\n/)) {
    const keyLine = KEY_LINE.exec(line)
    if (keyLine) {
      flush()
      key = keyLine[1]
      const block = BLOCK_SCALAR.exec(keyLine[2].trim())
      indicator = block ? block[1] : ''
      lines = block ? [] : [keyLine[2]]
    } else if (/^\s/.test(line)) {
      lines.push(line)
    }
  }
  flush()

  return { data, content: raw.slice(match[0].length) }
}

/** True when the text opens a frontmatter block with `---` but never closes it. */
export function hasUnterminatedFrontmatter(raw: string): boolean {
  return /^---\r?\n/.test(raw) && !FRONTMATTER_BLOCK.test(raw)
}
