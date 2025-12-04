#!/usr/bin/env node

/**
 * AI Agent Hub
 * Minimal web server to display AGENTS.md with EJS and Tailwind CSS
 */

import 'dotenv/config'
import { createServer } from 'http'
import { Config } from './config.js'
import router from './routing/routes.js'

export default function main(_port: number = Config.port) {
  const server = createServer((req, res) => router.handle(req, res))

  return server
}
