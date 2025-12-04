#!/usr/bin/env node

/**
 * CLI entry point for AI Agent Hub
 */

import { Config } from './config.js'
import main from './main.js'

const port = Config.port
const server = main(port)

server.listen(port)

// eslint-disable-next-line no-console
console.log(`
╔════════════════════════════════════════════╗
║        🤖 AI Agent Hub - Running          ║
╚════════════════════════════════════════════╝

Server running at: http://localhost:${port}
Press Ctrl+C to stop
`)
