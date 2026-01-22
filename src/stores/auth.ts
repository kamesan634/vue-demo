/**
 * 認證狀態管理 Store
 * 管理使用者登入狀態、Token 和使用者資訊
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import type { UserInfo, LoginRequest } from '@/types'
import router from '@/router'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // ================================
    // 狀態定義
    // ================================

    /** Access Token */
    const accessToken = ref<string | null>(localStorage.getItem('accessToken'))

    /** Refresh Token */
    const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))

    /** 使用者資訊 */
    const userInfo = ref<UserInfo | null>(
      localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!) : null
    )

    /** 是否正在載入 */
    const loading = ref(false)

    // ================================
    // 計算屬性
    // ================================

    /** 是否已登入 */
    const isLoggedIn = computed(() => !!accessToken.value && !!userInfo.value)

    /** 使用者名稱 */
    const username = computed(() => userInfo.value?.username || '')

    /** 使用者顯示名稱 */
    const displayName = computed(() => userInfo.value?.name || username.value)

    /** 使用者角色 */
    const role = computed(() => userInfo.value?.role || '')

    /** 使用者角色名稱 */
    const roleName = computed(() => userInfo.value?.roleName || '')

    /** 是否為管理員 */
    const isAdmin = computed(() => role.value === 'ADMIN')

    /** 是否為店長 */
    const isManager = computed(() => role.value === 'MANAGER' || isAdmin.value)

    // ================================
    // 方法定義
    // ================================

    /**
     * 設定 Token
     * @param access - Access Token
     * @param refresh - Refresh Token
     */
    const setTokens = (access: string, refresh: string): void => {
      accessToken.value = access
      refreshToken.value = refresh
      localStorage.setItem('accessToken', access)
      localStorage.setItem('refreshToken', refresh)
    }

    /**
     * 設定使用者資訊
     * @param user - 使用者資訊
     */
    const setUserInfo = (user: UserInfo): void => {
      userInfo.value = user
      localStorage.setItem('userInfo', JSON.stringify(user))
    }

    /**
     * 清除認證狀態
     */
    const clearAuth = (): void => {
      accessToken.value = null
      refreshToken.value = null
      userInfo.value = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userInfo')
    }

    /**
     * 使用者登入
     * @param credentials - 登入憑證
     */
    const login = async (credentials: LoginRequest): Promise<void> => {
      loading.value = true
      try {
        const response = await loginApi(credentials)

        // 儲存 Token 和使用者資訊
        setTokens(response.accessToken, response.refreshToken)
        setUserInfo(response.user)

        // 檢查是否需要變更密碼
        if (response.passwordChangeRequired) {
          router.push('/change-password')
          return
        }

        // 跳轉到首頁或原本要訪問的頁面
        const redirect = router.currentRoute.value.query.redirect as string
        router.push(redirect || '/')
      } finally {
        loading.value = false
      }
    }

    /**
     * 使用者登出
     */
    const logout = async (): Promise<void> => {
      loading.value = true
      try {
        // 呼叫後端登出 API
        await logoutApi()
      } catch (error) {
        // 即使後端登出失敗，也要清除前端狀態
        console.error('登出 API 呼叫失敗:', error)
      } finally {
        // 清除認證狀態
        clearAuth()
        loading.value = false
        // 跳轉到登入頁
        router.push('/login')
      }
    }

    /**
     * 更新 Token（用於 Token 刷新後更新狀態）
     * @param access - 新的 Access Token
     * @param refresh - 新的 Refresh Token
     */
    const updateTokens = (access: string, refresh: string): void => {
      setTokens(access, refresh)
    }

    /**
     * 檢查是否有指定權限
     * @param requiredRole - 需要的角色
     * @returns 是否有權限
     */
    const hasRole = (requiredRole: string | string[]): boolean => {
      if (!role.value) return false

      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      return roles.includes(role.value)
    }

    /**
     * 檢查是否有存取指定模組的權限
     * @param module - 模組名稱
     * @returns 是否有權限
     */
    const canAccess = (module: string): boolean => {
      // 管理員有所有權限
      if (isAdmin.value) return true

      // 根據模組和角色判斷權限
      const permissions: Record<string, string[]> = {
        // 系統設定：僅管理員
        system: ['ADMIN'],
        // 商品管理：管理員、店長
        products: ['ADMIN', 'MANAGER'],
        // 庫存管理：管理員、店長、倉管
        inventory: ['ADMIN', 'MANAGER', 'WAREHOUSE'],
        // POS 銷售：管理員、店長、收銀員
        pos: ['ADMIN', 'MANAGER', 'CASHIER'],
        // 採購管理：管理員、店長、採購
        purchasing: ['ADMIN', 'MANAGER', 'PURCHASER'],
        // 客戶管理：管理員、店長、收銀員
        customers: ['ADMIN', 'MANAGER', 'CASHIER'],
        // 報表：所有角色可讀取
        reports: ['ADMIN', 'MANAGER', 'CASHIER', 'WAREHOUSE', 'PURCHASER', 'VIEWER'],
      }

      const allowedRoles = permissions[module]
      if (!allowedRoles) return false

      return allowedRoles.includes(role.value)
    }

    // 返回所有狀態和方法
    return {
      // 狀態
      accessToken,
      refreshToken,
      userInfo,
      loading,

      // 計算屬性
      isLoggedIn,
      username,
      displayName,
      role,
      roleName,
      isAdmin,
      isManager,

      // 方法
      login,
      logout,
      updateTokens,
      clearAuth,
      hasRole,
      canAccess,
    }
  },
  {
    // Pinia 持久化設定
    persist: {
      key: 'auth',
      storage: localStorage,
      paths: ['accessToken', 'refreshToken', 'userInfo'],
    },
  }
)
