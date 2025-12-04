/**
 * Test suite for Routes configuration
 */

import { jest } from '@jest/globals'

// Mock the controllers before importing routes
jest.unstable_mockModule('../controllers/index.js', () => ({
  homeController: jest.fn(),
  agentController: jest.fn(),
  staticController: jest.fn(),
  licenseController: jest.fn(),
}))

// Mock marked
jest.unstable_mockModule('marked', () => ({
  marked: {
    setOptions: jest.fn(),
    parse: jest.fn(),
  },
}))

describe('Routes Configuration', () => {
  let router: typeof import('./routes.js').default
  let mockMarkedSetOptions: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()

    const { marked } = await import('marked')
    mockMarkedSetOptions = marked.setOptions as jest.Mock

    const routesModule = await import('./routes.js')
    router = routesModule.default
  })

  describe('route definitions', () => {
    it('should have router defined', () => {
      expect(router).toBeDefined()
      expect(router.handle).toBeDefined()
    })
  })

  describe('marked configuration', () => {
    it('should configure marked with breaks and gfm options', () => {
      expect(mockMarkedSetOptions).toHaveBeenCalledWith({
        breaks: true,
        gfm: true,
      })
    })
  })
})
