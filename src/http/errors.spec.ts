/**
 * Test suite for the HTTP error responses
 */

import { beforeEach, describe, expect, it, type Mock, type Mocked, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'http'
import { handleServerError, sendNotFound } from './errors.js'
import { logger } from '../logging/logger.js'

describe('http errors', () => {
  let mockRes: Mocked<Partial<ServerResponse>>

  beforeEach(() => {
    mockRes = {
      writeHead: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      headersSent: false,
    } as Mocked<Partial<ServerResponse>>
  })

  describe('sendNotFound', () => {
    it('answers 404 with a static French HTML page', () => {
      sendNotFound(mockRes as ServerResponse)

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html;charset=utf-8')
      expect(mockRes.writeHead).toHaveBeenCalledWith(404)
      expect(mockRes.end).toHaveBeenCalledWith(expect.stringContaining('Page introuvable'))
    })
  })

  describe('handleServerError', () => {
    const req = { method: 'GET', url: '/agents/x?token=secret' } as IncomingMessage

    it('logs the error with its stack and answers 500 without leaking it', () => {
      const error = new Error('disk exploded')
      const logError = vi.spyOn(logger, 'error')

      handleServerError(req, mockRes as ServerResponse, error)

      expect(logError).toHaveBeenCalledWith({ err: error, method: 'GET', url: '/agents/x' }, 'http.unhandled')
      expect(mockRes.writeHead).toHaveBeenCalledWith(500)
      const body = String((mockRes.end as unknown as Mock).mock.calls[0][0])
      expect(body).toContain('Erreur du serveur')
      expect(body).not.toContain('disk exploded')
    })

    it('only ends the response when the headers are already sent', () => {
      const logError = vi.spyOn(logger, 'error')
      Object.defineProperty(mockRes, 'headersSent', { value: true })

      handleServerError(req, mockRes as ServerResponse, new Error('late'))

      expect(logError).toHaveBeenCalled()
      expect(mockRes.writeHead).not.toHaveBeenCalled()
      expect(mockRes.end).toHaveBeenCalledWith()
    })
  })
})
