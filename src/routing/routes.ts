import { Router } from './router.js'
import { homeController, agentController, staticController, licenseController } from '../controllers/index.js'
import { marked } from 'marked'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

/**
 * Application routes configuration
 * Defines the mapping between URLs and controllers
 */
const router = new Router()

// 1. Static files (CSS, JS, Images)
// Regex: starts with /css/, /js/ or /images/
router.add(/^\/(css|js|images)\/.*$/, staticController)

// 2. LICENSE file
router.add('/LICENSE', licenseController)

// 3. Agents
// Regex: starts with /.agents/
router.add(/^\/\.agents\/.*$/, agentController)

// 4. Home (exact match)
router.add('/', homeController)
router.add('/index.html', homeController)

export default router
