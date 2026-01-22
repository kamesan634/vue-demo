/**
 * 應用程式狀態管理 Store
 * 管理應用程式的全域狀態，如側邊欄展開狀態、主題設定等
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore(
  'app',
  () => {
    // ================================
    // 狀態定義
    // ================================

    /** 側邊欄是否收合 */
    const sidebarCollapsed = ref(false)

    /** 目前選中的選單項目 */
    const selectedMenuKeys = ref<string[]>([])

    /** 展開的選單項目 */
    const openMenuKeys = ref<string[]>([])

    /** 是否為行動裝置 */
    const isMobile = ref(false)

    /** 頁面載入中 */
    const pageLoading = ref(false)

    /** 目前的頁面標題 */
    const pageTitle = ref('')

    /** 麵包屑路徑 */
    const breadcrumbs = ref<{ title: string; path?: string }[]>([])

    // ================================
    // 計算屬性
    // ================================

    /** 側邊欄寬度 */
    const sidebarWidth = computed(() => (sidebarCollapsed.value ? 80 : 256))

    /** 完整的頁面標題（含應用程式名稱） */
    const fullPageTitle = computed(() => {
      const appTitle = import.meta.env.VITE_APP_TITLE || '龜三的ERP Demo'
      return pageTitle.value ? `${pageTitle.value} - ${appTitle}` : appTitle
    })

    // ================================
    // 方法定義
    // ================================

    /**
     * 切換側邊欄展開/收合狀態
     */
    const toggleSidebar = (): void => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    /**
     * 設定側邊欄展開/收合狀態
     * @param collapsed - 是否收合
     */
    const setSidebarCollapsed = (collapsed: boolean): void => {
      sidebarCollapsed.value = collapsed
    }

    /**
     * 設定選中的選單項目
     * @param keys - 選中的選單鍵值
     */
    const setSelectedMenuKeys = (keys: string[]): void => {
      selectedMenuKeys.value = keys
    }

    /**
     * 設定展開的選單項目
     * @param keys - 展開的選單鍵值
     */
    const setOpenMenuKeys = (keys: string[]): void => {
      openMenuKeys.value = keys
    }

    /**
     * 設定是否為行動裝置
     * @param mobile - 是否為行動裝置
     */
    const setIsMobile = (mobile: boolean): void => {
      isMobile.value = mobile
      // 行動裝置預設收合側邊欄
      if (mobile) {
        sidebarCollapsed.value = true
      }
    }

    /**
     * 設定頁面載入狀態
     * @param loading - 是否載入中
     */
    const setPageLoading = (loading: boolean): void => {
      pageLoading.value = loading
    }

    /**
     * 設定頁面標題
     * @param title - 頁面標題
     */
    const setPageTitle = (title: string): void => {
      pageTitle.value = title
      // 更新瀏覽器標題
      document.title = fullPageTitle.value
    }

    /**
     * 設定麵包屑
     * @param items - 麵包屑項目
     */
    const setBreadcrumbs = (items: { title: string; path?: string }[]): void => {
      breadcrumbs.value = items
    }

    /**
     * 初始化應用程式狀態
     * 檢測螢幕大小並設定相應狀態
     */
    const initApp = (): void => {
      // 檢測是否為行動裝置
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      // 初始檢測
      checkMobile()

      // 監聽視窗大小變化
      window.addEventListener('resize', checkMobile)
    }

    // 返回所有狀態和方法
    return {
      // 狀態
      sidebarCollapsed,
      selectedMenuKeys,
      openMenuKeys,
      isMobile,
      pageLoading,
      pageTitle,
      breadcrumbs,

      // 計算屬性
      sidebarWidth,
      fullPageTitle,

      // 方法
      toggleSidebar,
      setSidebarCollapsed,
      setSelectedMenuKeys,
      setOpenMenuKeys,
      setIsMobile,
      setPageLoading,
      setPageTitle,
      setBreadcrumbs,
      initApp,
    }
  },
  {
    // Pinia 持久化設定
    persist: {
      key: 'app',
      storage: localStorage,
      paths: ['sidebarCollapsed'],
    },
  }
)
