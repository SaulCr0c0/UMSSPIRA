module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  // Los .spec.ts de reportes (Épica 9) usan node:test, no Jest: se corren con su propio script
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/modules/reports/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testEnvironment: 'node',
};