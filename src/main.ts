#!/usr/bin/env node

/**
 * AI Agent Hub
 * Minimal web server to display AGENTS.md with EJS and Tailwind CSS
 */

import 'dotenv/config'
import { createServer } from 'http'
import { Config } from './config.js'
import { logger } from './logging/logger.js'
import { routeFamily } from './logging/http-log.js'
import router from './routing/routes.js'

export default function main(_port: number = Config.port) {
  const server = createServer((req, res) => {
    // Every 404 is logged here, once, whichever controller produced it. Only the
    // route family is logged: the path is what the visitor typed.
    res.on('finish', () => {
      if (res.statusCode === 404) {
        logger.info({ method: req.method, route: routeFamily(req.url) }, 'http.not_found')
      }
    })

    router.handle(req, res)
  })

  return server
}
