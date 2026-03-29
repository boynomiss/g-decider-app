module.exports = {
  extends: [
    'expo',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // Remove project option to avoid parsing errors with JS files
    // project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Performance optimizations
    'react/jsx-no-bind': 'warn',
    'react/jsx-no-constructed-context-values': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react/no-array-index-key': 'warn',
    'react/no-unstable-nested-components': 'warn',
    
    // Code quality - simplified to avoid rule conflicts
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/array-type': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    
    // React specific
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': 'off', // Using TypeScript instead
    'react/display-name': 'warn', // Add display name rule
    
    // Import rules - simplified to avoid resolver issues
    'import/no-unresolved': 'off', // Disable to avoid resolver conflicts
    'import/namespace': 'off', // Disable to avoid resolver conflicts
    'import/default': 'off', // Disable to avoid resolver conflicts
    'import/no-named-as-default-member': 'off', // Disable to avoid resolver conflicts
    'import/export': 'warn', // Warn about export issues
    'import/first': 'warn', // Warn about import order
    
    // General rules
    'no-unused-vars': 'off', // Use TypeScript version instead
    'prefer-const': 'warn', // Use TypeScript version instead
    'no-var': 'warn', // Use TypeScript version instead
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.config.js',
    '*.config.ts',
    'scripts/',
    '__tests__/',
    'functions/',
    'test-*.js',
    '*.test.js',
    '*.test.ts',
    '*.test.tsx',
    'debug-imports.js',
    'fix-*.js',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
}; 