/**
 * ESLint 配置文件
 * 用於統一程式碼風格和檢查潛在錯誤
 */
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import * as parserVue from 'vue-eslint-parser'
import configPrettier from '@vue/eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'
import * as parserTypeScript from '@typescript-eslint/parser'
import pluginTypeScript from '@typescript-eslint/eslint-plugin'

export default [
  // JavaScript 基本規則
  js.configs.recommended,

  // Vue 3 推薦規則
  ...pluginVue.configs['flat/recommended'],

  // Prettier 整合
  configPrettier,

  // 全域設定
  {
    languageOptions: {
      globals: {
        // 瀏覽器全域變數
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        // Vue 自動導入的全域變數
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      },
    },
  },

  // TypeScript 文件規則
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
    },
    rules: {
      // 關閉基本規則，使用 TypeScript 版本
      'no-unused-vars': 'off',
      // TypeScript 特定規則
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Vue 文件規則
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        parser: parserTypeScript,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': pluginTypeScript,
      prettier: pluginPrettier,
    },
    rules: {
      // 關閉基本規則，使用 TypeScript 版本
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Vue 特定規則
      'vue/multi-word-component-names': 'off', // 允許單字組件名稱
      'vue/no-v-html': 'off', // 允許使用 v-html
      'vue/require-default-prop': 'off', // 不強制要求預設 prop
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'always',
          },
        },
      ],
      // Prettier 規則
      'prettier/prettier': 'error',
    },
  },

  // 忽略文件
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '*.d.ts',
      'src/auto-imports.d.ts',
      'src/components.d.ts',
      '.eslintrc-auto-import.json',
    ],
  },
]
