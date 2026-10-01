import pino from 'pino'
import { Config } from '../config.js'

/**
 * Structured logger: one JSON line per event on stdout, so `docker logs` or any
 * log collector can read it. The level comes from `LOG_LEVEL` (default `info`).
 *
 * Never log user-supplied values or file contents: pass identifiers, codes and
 * the `err` field only.
 */
export const logger = pino({ level: Config.logLevel })
