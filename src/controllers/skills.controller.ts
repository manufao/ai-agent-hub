import { IncomingMessage, ServerResponse } from 'http'
import ejs from 'ejs'
import { listCategories, getCategory, getSkill, type CategorySummary } from '../content/skills.js'
import { renderMarkdown } from '../content/markdown.js'
import { skillHero, skillRelated } from '../content/pages.js'
import { decodeSegment, pathnameOf } from '../routing/url.js'
import { renderPage } from '../view.js'

const SKILLS_URL = /^\/skills(?:\/([^/]+))?(?:\/([^/]+))?\/?$/

const notFound = (message: string): string =>
  `<h2 class="text-3xl font-bold text-red-600">⚠️ Introuvable</h2><p>${ejs.escapeXML(message)}</p>`

const renderSkillList = (category: CategorySummary): string => {
  if (category.skills.length === 0) {
    return '<p class="mt-2 italic text-gray-500">Aucun skill pour l\'instant.</p>'
  }

  const skillItems = category.skills
    .map(
      skill =>
        `<li><a class="text-blue-600 hover:underline" href="/skills/${encodeURIComponent(category.slug)}/${encodeURIComponent(skill.slug)}">${ejs.escapeXML(skill.name)}</a> — ${ejs.escapeXML(skill.description)}</li>`,
    )
    .join('')

  return `<ul class="list-disc pl-6 mt-2">${skillItems}</ul>`
}

const renderCategoryCard = (category: CategorySummary): string => `<section class="mb-8">
    <h2 class="text-2xl font-semibold">
      <a class="hover:underline" href="/skills/${encodeURIComponent(category.slug)}">${ejs.escapeXML(category.title)}</a>
    </h2>
    ${category.description ? `<p class="mt-1 text-gray-600">${ejs.escapeXML(category.description)}</p>` : ''}
    ${renderSkillList(category)}
  </section>`

const renderSkillsIndex = (): string => {
  const categories = listCategories()
  return `<h1 class="text-3xl font-bold mb-6">Skills</h1>${categories.map(renderCategoryCard).join('')}`
}

const renderCategoryPage = (category: CategorySummary): string =>
  `<h1 class="text-3xl font-bold mb-2">${ejs.escapeXML(category.title)}</h1>${
    category.description ? `<p class="text-gray-600 mb-6">${ejs.escapeXML(category.description)}</p>` : ''
  }${renderSkillList(category)}`

/**
 * Controller for the skills section.
 * Handles `/skills`, `/skills/<category>` and `/skills/<category>/<slug>`,
 * rendering `.agents/skills/<category>/<slug>/SKILL.md`.
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const skillsController = (req: IncomingMessage, res: ServerResponse): void => {
  try {
    const match = SKILLS_URL.exec(pathnameOf(req.url || ''))
    const categorySlug = match?.[1] === undefined ? '' : decodeSegment(match[1])
    const skillSlug = match?.[2] === undefined ? '' : decodeSegment(match[2])

    if (!match || categorySlug === undefined || skillSlug === undefined) {
      renderPage(res, { statusCode: 404, bodyHtml: notFound('Invalid skills URL'), active: { type: 'skills' } })
      return
    }

    if (!categorySlug) {
      renderPage(res, { statusCode: 200, bodyHtml: renderSkillsIndex(), active: { type: 'skills' } })
      return
    }

    if (!skillSlug) {
      const category = getCategory(categorySlug)
      if (!category) {
        renderPage(res, {
          statusCode: 404,
          bodyHtml: notFound(`Aucune catégorie nommée ${categorySlug} n'est disponible.`),
          active: { type: 'category', slug: categorySlug },
        })
        return
      }

      renderPage(res, {
        statusCode: 200,
        bodyHtml: renderCategoryPage(category),
        active: { type: 'category', slug: category.slug },
      })
      return
    }

    const skill = getSkill(categorySlug, skillSlug)
    if (!skill) {
      renderPage(res, {
        statusCode: 404,
        bodyHtml: notFound(`Aucun skill nommé ${skillSlug} n'est disponible dans ${categorySlug}.`),
        active: { type: 'skill', category: categorySlug, slug: skillSlug },
      })
      return
    }

    const { html, headings } = renderMarkdown(skill.content, { stripTitle: true })
    renderPage(res, {
      statusCode: 200,
      bodyHtml: html,
      active: { type: 'skill', category: skill.category, slug: skill.slug },
      hero: skillHero(skill),
      toc: headings,
      related: skillRelated(skill, getCategory(skill.category)?.skills ?? []),
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering skills page:', error)
    res.setHeader('Content-Type', 'text/plain;charset=utf-8')
    res.writeHead(500)
    res.end('Internal Server Error')
  }
}
