module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:eslint-plugin-react/recommended',
    'plugin:eslint-plugin-react-hooks/recommended',
    'plugin:eslint-comments/recommended',
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': [
      'error',
      {functions: false, classes: false},
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
