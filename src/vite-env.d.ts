/// <reference types="vite/client" />

/**
 * Vite 環境變數類型定義
 */
interface ImportMetaEnv {
  /** API 基礎網址 */
  readonly VITE_API_BASE_URL: string
  /** API 請求超時時間（毫秒） */
  readonly VITE_API_TIMEOUT: string
  /** 應用程式標題 */
  readonly VITE_APP_TITLE: string
  /** 應用程式版本 */
  readonly VITE_APP_VERSION: string
  /** 環境標識 */
  readonly VITE_APP_ENV: string
  /** Access Token 過期時間（秒） */
  readonly VITE_ACCESS_TOKEN_EXPIRE: string
  /** Token 刷新提前時間（秒） */
  readonly VITE_TOKEN_REFRESH_THRESHOLD: string
  /** 是否啟用 Mock 數據 */
  readonly VITE_ENABLE_MOCK: string
  /** 是否顯示開發者工具 */
  readonly VITE_SHOW_DEV_TOOLS: string
  /** 是否啟用 API 請求日誌 */
  readonly VITE_ENABLE_API_LOG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Vue 組件聲明
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
