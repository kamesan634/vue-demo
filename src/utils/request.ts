/**
 * Axios 請求封裝
 * 提供統一的 HTTP 請求處理、錯誤處理和 JWT Token 自動刷新機制
 */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'
import type { ApiResponse } from '@/types'

// 建立 Axios 實例
const request: AxiosInstance = axios.create({
  // API 基礎網址
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 請求超時時間
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  // 請求標頭
  headers: {
    'Content-Type': 'application/json',
  },
})

// 用於防止 Token 刷新期間重複刷新
let isRefreshing = false
// 等待 Token 刷新的請求隊列
let refreshSubscribers: Array<(token: string) => void> = []

/**
 * 將等待中的請求加入隊列
 * @param callback - 當 Token 刷新完成後執行的回調函數
 */
const subscribeTokenRefresh = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback)
}

/**
 * 通知所有等待中的請求，Token 已刷新
 * @param token - 新的 Access Token
 */
const onTokenRefreshed = (token: string): void => {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

/**
 * 刷新 Token
 * @returns 新的 Access Token
 */
const refreshToken = async (): Promise<string> => {
  const refreshTokenValue = localStorage.getItem('refreshToken')

  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }

  const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    { refreshToken: refreshTokenValue }
  )

  if (response.data.success && response.data.data) {
    const { accessToken, refreshToken: newRefreshToken } = response.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', newRefreshToken)
    return accessToken
  }

  throw new Error('Token refresh failed')
}

/**
 * 請求攔截器
 * 自動添加 Authorization 標頭
 */
request.interceptors.request.use(
  (config) => {
    // 從 localStorage 取得 Token
    const token = localStorage.getItem('accessToken')

    // 如果有 Token，添加到請求標頭
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 開發環境下記錄請求資訊
    if (import.meta.env.VITE_ENABLE_API_LOG === 'true') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * 回應攔截器
 * 處理通用錯誤和 Token 刷新
 */
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 開發環境下記錄回應資訊
    if (import.meta.env.VITE_ENABLE_API_LOG === 'true') {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }

    // 檢查業務邏輯錯誤
    const { data } = response
    if (!data.success) {
      // 顯示錯誤訊息
      message.error(data.message || '操作失敗')
      return Promise.reject(new Error(data.message || '操作失敗'))
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // 處理 401 未授權錯誤（Token 過期）
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果是登入或刷新 Token 的請求失敗，直接跳轉到登入頁
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        handleLogout()
        return Promise.reject(error)
      }

      // 標記此請求已嘗試重試
      originalRequest._retry = true

      // 如果正在刷新 Token，將請求加入隊列
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(request(originalRequest))
          })
        })
      }

      // 開始刷新 Token
      isRefreshing = true

      try {
        const newToken = await refreshToken()
        isRefreshing = false

        // 通知所有等待中的請求
        onTokenRefreshed(newToken)

        // 重試原始請求
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return request(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        handleLogout()
        return Promise.reject(refreshError)
      }
    }

    // 處理其他 HTTP 錯誤
    const errorMessage = getErrorMessage(error)
    message.error(errorMessage)

    // 開發環境下記錄錯誤資訊
    if (import.meta.env.VITE_ENABLE_API_LOG === 'true') {
      console.error('[API Error]', error)
    }

    return Promise.reject(error)
  }
)

/**
 * 處理登出
 * 清除本地儲存的 Token 並跳轉到登入頁
 */
const handleLogout = (): void => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('userInfo')

  // 跳轉到登入頁
  const currentPath = window.location.pathname
  if (currentPath !== '/login') {
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
  }
}

/**
 * 取得錯誤訊息
 * @param error - 錯誤物件
 * @returns 錯誤訊息字串
 */
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // HTTP 狀態碼對應的錯誤訊息
    const statusMessages: Record<number, string> = {
      400: '請求參數錯誤',
      401: '未授權，請重新登入',
      403: '權限不足',
      404: '請求的資源不存在',
      500: '伺服器內部錯誤',
      502: '閘道錯誤',
      503: '服務暫時不可用',
      504: '閘道超時',
    }

    const status = error.response?.status
    if (status && statusMessages[status]) {
      return statusMessages[status]
    }

    // 嘗試取得後端回傳的錯誤訊息
    const responseMessage = error.response?.data?.message
    if (responseMessage) {
      return responseMessage
    }

    // 網路錯誤
    if (error.message === 'Network Error') {
      return '網路連線錯誤，請檢查網路狀態'
    }

    // 請求超時
    if (error.code === 'ECONNABORTED') {
      return '請求超時，請稍後再試'
    }
  }

  return '發生未知錯誤'
}

// ================================
// 通用請求方法
// ================================

/**
 * GET 請求
 * @template T - 回應資料類型
 * @param url - 請求 URL
 * @param params - 查詢參數
 * @param config - 額外配置
 * @returns 回應資料
 */
export const get = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await request.get<ApiResponse<T>>(url, { params, ...config })
  return response.data.data as T
}

/**
 * POST 請求
 * @template T - 回應資料類型
 * @param url - 請求 URL
 * @param data - 請求資料
 * @param config - 額外配置
 * @returns 回應資料
 */
export const post = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await request.post<ApiResponse<T>>(url, data, config)
  return response.data.data as T
}

/**
 * PUT 請求
 * @template T - 回應資料類型
 * @param url - 請求 URL
 * @param data - 請求資料
 * @param config - 額外配置
 * @returns 回應資料
 */
export const put = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await request.put<ApiResponse<T>>(url, data, config)
  return response.data.data as T
}

/**
 * DELETE 請求
 * @template T - 回應資料類型
 * @param url - 請求 URL
 * @param config - 額外配置
 * @returns 回應資料
 */
export const del = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await request.delete<ApiResponse<T>>(url, config)
  return response.data.data as T
}

export default request
