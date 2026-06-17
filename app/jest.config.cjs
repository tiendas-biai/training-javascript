/** Jest config for the Dev Drill app (separate from the root exercises config). */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy',
    // authEnv.ts uses import.meta.env (Vite-only, invalid under the CommonJS
    // test transpile); swap in the mock so tests run on the local/anon path.
    '(^\\./authEnv$|/auth/authEnv$)': '<rootDir>/src/auth/authEnv.mock.ts',
    // Default anonymous auth state for all tests; individual tests override with
    // their own jest.mock('@auth0/auth0-react') when exercising the auth'd path.
    '^@auth0/auth0-react$': '<rootDir>/src/test/auth0.mock.tsx',
  },
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
