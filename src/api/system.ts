/**
 * 系統管理 API
 * 處理系統參數設定和稽核日誌
 */
import { get, put } from '@/utils/request'
import type {
  SystemParameter,
  AuditLog,
  AuditLogQueryParams,
  PaginatedResponse,
} from '@/types'

/**
 * 取得系統參數
 * @returns 系統參數物件
 */
export const getSystemParameters = (): Promise<Record<string, unknown>> => {
  return get<Record<string, unknown>>('/system-parameters')
}

/**
 * 更新系統參數（單一參數）
 * @param category - 參數類別
 * @param key - 參數鍵
 * @param value - 參數值
 * @returns 更新結果
 */
export const updateSystemParameter = (
  category: string,
  key: string,
  value: string
): Promise<void> => {
  return put<void>(`/system-parameters/${category}/${key}`, { value })
}

/**
 * 更新所有系統參數
 * @param params - 系統參數物件
 * @returns 更新結果
 */
export const updateSystemParameters = (
  params: Record<string, unknown>
): Promise<void> => {
  return put<void>('/system-parameters', params)
}

/**
 * 查詢稽核日誌
 * @param params - 查詢參數
 * @returns 分頁稽核日誌列表
 */
export const getAuditLogs = (
  params?: AuditLogQueryParams
): Promise<PaginatedResponse<AuditLog>> => {
  return get<PaginatedResponse<AuditLog>>('/audit-logs', params as Record<string, unknown>)
}
