module.exports = {
  verbose: true,
  transform: {
    '.(ts|tsx)': './node_modules/ts-jest/preprocessor.js',
  },
  testRegex: '(/spec/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  moduleNameMapper: {
    '^Components/(.*)': './src/components/$1',
  },
  globals: {
    window: {},
    'ts-jest': {
      tsConfigFile: './tsconfig.json',
    },
  },
  setupFiles: ['./jest.stubs.js'],
  setupFilesAfterEnv: ['./jest.tests.ts'],
};
