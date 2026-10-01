import { IncomingMessage, ServerResponse } from 'http'
import ejs from 'ejs'
import { listCategories, getCategory, getSkill, type CategorySummary } from '../content/skills.js'
import { renderMarkdown } from '../content/markdown.js'
import { skillHero, skillRelated } from '../content/pages.js'
import { decodeSegment, pathnameOf } from '../routing/url.js'
import { renderPage } from '../view.js'

const SKILLS_URL = /^\/skills(?:\/([^/]+))?(?:\/([^/]+))?\/?$/

const notFound = (message: string): string =>
  `<div class="not-prose"><h2 class="alert-title">Introuvable</h2><p class="mt-3">${ejs.escapeXML(message)}</p></div>`

const renderSkillList = (category: CategorySummary): string => {
  if (category.skills.length === 0) {
    return '<p class="empty-note">Aucun skill pour l\'instant.</p>'
  }

  const skillItems = category.skills
    .map(
      skill =>
        `<li><a class="entry-link" href="/skills/${encodeURIComponent(category.slug)}/${encodeURIComponent(skill.slug)}">${ejs.escapeXML(skill.name)}</a><p class="entry-desc">${ejs.escapeXML(skill.description)}</p></li>`,
    )
    .join('')

  return `<ul class="entry-list">${skillItems}</ul>`
}

const renderDescription = (category: CategorySummary): string =>
  category.description ? `<p class="entry-desc">${ejs.escapeXML(category.description)}</p>` : ''

const renderCategorySection = (category: CategorySummary): string => `<section class="mt-12">
    <h2 class="section-title"><a href="/skills/${encodeURIComponent(category.slug)}">${ejs.escapeXML(category.title)}</a></h2>
    ${renderDescription(category)}
    ${renderSkillList(category)}
  </section>`

const renderSkillsIndex = (): string =>
  `<div class="not-prose"><h1 class="page-title">Skills</h1>${listCategories().map(renderCategorySection).join('')}</div>`

const renderCategoryPage = (category: CategorySummary): string =>
  `<div class="not-prose"><h1 class="page-title">${ejs.escapeXML(category.title)}</h1>${renderDescription(category)}${renderSkillList(category)}</div>`

/**
 * Controller for the skills section.
 * Handles `/skills`, `/skills/<category>` and `/skills/<category>/<slug>`,
 * rendering `.agents/skills/<category>/<slug>/SKILL.md`.
 * @param req - HTTP request object
 * @param res - HTTP response object
 */
export const skillsController = (req: IncomingMessage, res: ServerResponse): void => {
  const match = SKILLS_URL.exec(pathnameOf(req.url || ''))
  const categorySlug = match?.[1] === undefined ? '' : decodeSegment(match[1])
  const skillSlug = match?.[2] === undefined ? '' : decodeSegment(match[2])

  if (!match || categorySlug === undefined || skillSlug === undefined) {
    renderPage(res, { statusCode: 404, bodyHtml: notFound('URL de skill invalide'), active: { type: 'skills' } })
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
}
