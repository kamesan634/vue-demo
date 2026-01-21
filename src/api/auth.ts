/**
 * 認證相關 API
 * 處理使用者登入、登出、Token 刷新和密碼變更
 */
import { post } from '@/utils/request'
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '@/types'

/**
 * 使用者登入
 * @param data - 登入請求資料（帳號、密碼）
 * @returns 登入回應（Token、使用者資訊）
 */
export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return post<LoginResponse>('/auth/login', data)
}

/**
 * 使用者登出
 * @returns 登出結果
 */
export const logout = (): Promise<void> => {
  return post<void>('/auth/logout')
}

/**
 * 刷新 Token
 * @param data - 刷新請求資料（Refresh Token）
 * @returns 新的 Token 資訊
 */
export const refreshToken = (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
  return post<RefreshTokenResponse>('/auth/refresh', data)
}

/**
 * 變更密碼
 * @param userId - 使用者 ID
 * @param oldPassword - 舊密碼
 * @param newPassword - 新密碼
 * @returns 變更結果
 */
export const changePassword = (
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  // 後端使用 @RequestParam，需要用 form data 格式
  const params = new URLSearchParams()
  params.append('userId', userId.toString())
  params.append('oldPassword', oldPassword)
  params.append('newPassword', newPassword)

  return post<void>('/auth/change-password', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
}
