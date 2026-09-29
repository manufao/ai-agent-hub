import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { skillsDir, isSafeSegment } from './paths.js'
import { parseFrontmatter } from './frontmatter.js'

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

function readCategoryDescription(categoryDir: string): string | undefined {
  const readmePath = join(categoryDir, 'README.md')
  return existsSync(readmePath) ? readFileSync(readmePath, 'utf-8').trim() : undefined
}

function readSkillSummary(category: string, slug: string, skillDir: string): SkillSummary | undefined {
  const skillPath = join(skillDir, 'SKILL.md')
  if (!existsSync(skillPath)) {
    return undefined
  }

  const { data } = parseFrontmatter(readFileSync(skillPath, 'utf-8'))
  return { category, slug, name: data.name ?? slug, description: data.description ?? '' }
}

/** Lists every skill category under `.agents/skills/`, each with its skills (empty categories included). */
export function listCategories(): CategorySummary[] {
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(categoryEntry => {
      const categoryDir = join(skillsDir, categoryEntry.name)
      const skills = readdirSync(categoryDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(skillEntry => readSkillSummary(categoryEntry.name, skillEntry.name, join(categoryDir, skillEntry.name)))
        .filter((skill): skill is SkillSummary => skill !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name))

      return {
        slug: categoryEntry.name,
        title: categoryTitle(categoryEntry.name),
        description: readCategoryDescription(categoryDir),
        skills,
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

/** Reads a single category's summary (metadata + skill list), without requiring a full listing. */
export function getCategory(category: string): CategorySummary | undefined {
  if (!isSafeSegment(category)) {
    return undefined
  }

  const categoryDir = join(skillsDir, category)
  if (!existsSync(categoryDir)) {
    return undefined
  }

  return listCategories().find(c => c.slug === category)
}

/** Reads a single skill by category and slug. Returns undefined for an unknown or unsafe path. */
export function getSkill(category: string, slug: string): Skill | undefined {
  if (!isSafeSegment(category) || !isSafeSegment(slug)) {
    return undefined
  }

  const skillPath = join(skillsDir, category, slug, 'SKILL.md')
  if (!existsSync(skillPath)) {
    return undefined
  }

  const { data, content } = parseFrontmatter(readFileSync(skillPath, 'utf-8'))
  return { category, slug, name: data.name ?? slug, description: data.description ?? '', content }
}
