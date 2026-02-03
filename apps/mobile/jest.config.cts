module.exports = {
  displayName: 'mobile',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.spec.tsx'],
  coverageDirectory: '../../coverage/apps/mobile',
};
