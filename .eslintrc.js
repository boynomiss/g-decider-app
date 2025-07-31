module.exports = {
  extends: [
    'expo',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    // Performance optimizations
    'react/jsx-no-bind': 'warn',
    'react/jsx-no-constructed-context-values': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'warn',
    
    // Code quality
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    
    // React specific
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    
    // General
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}; 