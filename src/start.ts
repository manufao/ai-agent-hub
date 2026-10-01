import { statSync } from 'fs'
import { relative } from 'path'
import type { Server } from 'http'
import { Config } from './config.js'
import { agentsDir, examplesDir, rootDir, skillsDir } from './content/paths.js'
import { logger } from './logging/logger.js'
import main from './main.js'

const isDirectory = (path: string): boolean => statSync(path, { throwIfNoEntry: false })?.isDirectory() === true

/**
 * Starts the server after checking what it needs: a valid port and the content
 * directories. Every failure is logged with a clear event and sets a non-zero
 * exit code instead of leaving a server that answers 500 everywhere.
 * @param port - TCP port to listen on
 * @returns The server, or undefined when it did not start
 */
export function startServer(port: number = Config.port): Server | undefined {
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    logger.error({ port: String(port) }, 'startup.invalid_port')
    process.exitCode = 1
    return undefined
  }

  const missing = [agentsDir, skillsDir, examplesDir].filter(dir => !isDirectory(dir))
  if (missing.length > 0) {
    logger.error({ missing: missing.map(dir => relative(rootDir, dir)) }, 'startup.content_dir_missing')
    process.exitCode = 1
    return undefined
  }

  const server = main(port)

  server.on('error', (error: NodeJS.ErrnoException) => {
    logger.error(
      { port, code: error.code },
      error.code === 'EADDRINUSE' ? 'startup.port_in_use' : 'startup.listen_failed',
    )
    process.exitCode = 1
  })

  server.listen(port, () => logger.info({ port }, 'startup.listening'))

  return server
}
