module.exports = {
  verbose: true,
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  testRegex: '(/spec/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^Components/(.*)': './src/components/$1',
  },
  globals: {
    window: {},
    'ts-jest': {
      tsconfig: './tsconfig.json',
    },
  },
  setupFiles: ['./jest.stubs.ts'],
  setupFilesAfterEnv: ['./jest.tests.ts'],
};
