/**
 * Vite 配置文件
 * 用於配置 Vue 3 專案的建置和開發設定
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  // 插件配置
  plugins: [
    // Vue 3 支援
    vue(),
    // 自動導入 Vue 相關 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
      },
    }),
    // Ant Design Vue 組件自動導入
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false, // 使用 CSS-in-JS，不需要額外導入樣式
        }),
      ],
      dts: 'src/components.d.ts',
    }),
  ],

  // 路徑解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  // 開發伺服器配置
  server: {
    port: 5173, // 開發環境 Port
    host: true, // 允許外部訪問
    open: true, // 自動開啟瀏覽器
    // API 代理配置（可選，用於解決跨域問題）
    proxy: {
      '/api': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // 建置配置
  build: {
    // 輸出目錄
    outDir: 'dist',
    // 資源內聯閾值（小於此大小的資源會被內聯為 base64）
    assetsInlineLimit: 4096,
    // 分塊策略
    rollupOptions: {
      output: {
        // 分離第三方庫
        manualChunks: {
          'ant-design-vue': ['ant-design-vue'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          echarts: ['echarts', 'vue-echarts'],
        },
      },
    },
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // Ant Design Vue 主題變數
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'success-color': '#52c41a',
          'warning-color': '#faad14',
          'error-color': '#f5222d',
        },
      },
    },
  },
})
