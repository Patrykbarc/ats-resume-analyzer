import js from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const IGNORES = {
  ignores: [
    '**/dist',
    '**/*.d.ts',
    '**/vite.config.ts',
    'tailwind.config.js',
    'eslint.config.mjs',
    'postcss.config.js',
    'eslint.config.mts',
    'tsup.config.ts',
    'scripts'
  ]
}

export default defineConfig([
  IGNORES,

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: [
          './apps/api/tsconfig.json',
          './apps/web/tsconfig.json',
          './packages/*/**/tsconfig.json'
        ],
        tsconfigRootDir: import.meta.dirname
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },

  ...tseslint.configs.strict,

  pluginReact.configs.flat.recommended,

  {
    files: ['**/*.{ts,mts,cts,tsx}'],
    rules: {
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],

      'no-console': [
        'warn',
        {
          allow: ['error', 'warn']
        }
      ],

      // force use of curly brackts on if statements
      curly: 'error',

      // force space after comments
      'spaced-comment': [
        'error',
        'always',
        {
          markers: ['/']
        }
      ],

      // prefer template strings over string appends
      'prefer-template': 'error',

      // if you use 'new jsx transform' don't have to import React from 'react'
      'react/react-in-jsx-scope': 'off',
      'react/no-children-prop': 'off'
    }
  }
])
