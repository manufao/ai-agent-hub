import 'dotenv/config'

const isCI = process.env.CI === 'true'

export default {
  verbose: true,
  collectCoverage: true,
  resetModules: true,
  restoreMocks: true,
  roots: ['<rootDir>/src/'],
  testEnvironment: 'node',
  transform: {},
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '.spec.ts$',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
      useESM: true,
    },
  },
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/**/*.spec.ts', '!<rootDir>/src/index.ts'],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coveragePathIgnorePatterns: ['<rootDir>/dist/', '/node_modules/'],
  coverageProvider: 'v8',
  coverageReporters: isCI ? ['json'] : ['text', 'html'],
}
