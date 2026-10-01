import { IncomingMessage, ServerResponse } from 'http'
import { pathnameOf } from './url.js'
import { handleServerError, sendNotFound } from '../http/errors.js'

/**
 * Type for a route handler function
 */
export type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void

/**
 * Interface defining a route
 */
export interface Route {
  method?: string // GET, POST, etc. (optional)
  path: RegExp | string // Regex for flexibility or string for exact match
  handler: RouteHandler
}

/**
 * Router class - Pattern to handle routing without a framework
 */
export class Router {
  private routes: Route[] = []

  /**
   * Adds a route to the router
   * @param path - Path (exact string or RegExp)
   @param handler - Function to execute when the route matches
   */
  add(path: RegExp | string, handler: RouteHandler): void {
    this.routes.push({ path, handler })
  }

  /**
   * Finds and executes the appropriate route for the request
   * @param req - HTTP request
   * @param res - HTTP response
   */
  handle(req: IncomingMessage, res: ServerResponse): void {
    // Routes match on the path only, so a query string or fragment never breaks a route
    const url = pathnameOf(req.url || '/')

    // Find the FIRST matching route
    const match = this.routes.find(route => {
      if (route.path instanceof RegExp) {
        return route.path.test(url)
      }
      return route.path === url
    })

    if (!match) {
      sendNotFound(res)
      return
    }

    // One place turns any unexpected error into a logged, static 500 page
    try {
      match.handler(req, res)
    } catch (error) {
      handleServerError(req, res, error)
    }
  }
}
