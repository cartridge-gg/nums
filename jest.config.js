export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
  },
  roots: ['<rootDir>/client/src'],
  testMatch: ['**/*.test.ts'],
}; 