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
  },
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
