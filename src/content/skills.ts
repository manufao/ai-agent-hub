import { readdirSync, existsSync } from 'fs'
import { skillCategoryDirPath, skillCategoryReadmePath, skillFilePath, skillsDir, isSafeSegment } from './paths.js'
import { parseFrontmatter } from './frontmatter.js'
import { extractSummary } from './markdown.js'
import { readContentFile, skipUnreadable } from './read-file.js'

export interface SkillSummary {
  category: string
  slug: string
  name: string
  description: string
}

export interface Skill extends SkillSummary {
  content: string
}

export interface CategorySummary {
  slug: string
  title: string
  description?: string
  skills: SkillSummary[]
}

const CATEGORY_TITLES: Record<string, string> = {
  ingenierie: 'Ingénierie',
  productivite: 'Productivité',
  marketing: 'Marketing',
}

export function categoryTitle(slug: string): string {
  return CATEGORY_TITLES[slug] ?? slug
}

function readCategoryDescription(category: string): string | undefined {
  const readmePath = skillCategoryReadmePath(category)
  return existsSync(readmePath)
    ? skipUnreadable(readmePath, () => extractSummary(readContentFile(readmePath)) || undefined)
    : undefined
}

function readSkillSummary(category: string, slug: string): SkillSummary | undefined {
  const skillPath = skillFilePath(category, slug)
  if (!existsSync(skillPath)) {
    return undefined
  }

  return skipUnreadable(skillPath, (): SkillSummary => {
    const { data } = parseFrontmatter(readContentFile(skillPath))
    return { category, slug, name: data.name ?? slug, description: data.description ?? '' }
  })
}

function readCategory(slug: string): CategorySummary {
  const skills = readdirSync(skillCategoryDirPath(slug), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(skillEntry => readSkillSummary(slug, skillEntry.name))
    .filter((skill): skill is SkillSummary => skill !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    slug,
    title: categoryTitle(slug),
    description: readCategoryDescription(slug),
    skills,
  }
}

/** Lists every skill category under `.agents/skills/`, each with its skills (empty categories included). */
export function listCategories(): CategorySummary[] {
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => readCategory(entry.name))
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Reads a single category (metadata + skills) by slug, scanning only that category. */
export function getCategory(category: string): CategorySummary | undefined {
  if (!isSafeSegment(category) || !existsSync(skillCategoryDirPath(category))) {
    return undefined
  }

  return readCategory(category)
}

/** Reads a single skill by category and slug. Returns undefined for an unknown or unsafe path. */
export function getSkill(category: string, slug: string): Skill | undefined {
  if (!isSafeSegment(category) || !isSafeSegment(slug)) {
    return undefined
  }

  const skillPath = skillFilePath(category, slug)
  if (!existsSync(skillPath)) {
    return undefined
  }

  const { data, content } = parseFrontmatter(readContentFile(skillPath))
  return { category, slug, name: data.name ?? slug, description: data.description ?? '', content }
}
