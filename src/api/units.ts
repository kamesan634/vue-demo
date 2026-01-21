/**
 * 單位管理 API
 * 處理計量單位的 CRUD 操作
 */
import { get, post, put, del } from '@/utils/request'
import type { Unit, UnitRequest, PaginatedResponse, PaginationParams } from '@/types'

/**
 * 查詢單位列表
 * @param params - 分頁參數
 * @returns 分頁單位列表
 */
export const getUnits = (params?: PaginationParams): Promise<PaginatedResponse<Unit>> => {
  return get<PaginatedResponse<Unit>>('/units', params as Record<string, unknown>)
}

/**
 * 取得單位詳情
 * @param id - 單位 ID
 * @returns 單位詳情
 */
export const getUnit = (id: number): Promise<Unit> => {
  return get<Unit>(`/units/${id}`)
}

/**
 * 依代碼查詢單位
 * @param code - 單位代碼
 * @returns 單位資訊
 */
export const getUnitByCode = (code: string): Promise<Unit> => {
  return get<Unit>(`/units/code/${code}`)
}

/**
 * 查詢啟用的單位
 * @returns 啟用的單位列表
 */
export const getActiveUnits = (): Promise<Unit[]> => {
  return get<Unit[]>('/units/active')
}

/**
 * 搜尋單位
 * @param keyword - 搜尋關鍵字（名稱、代碼）
 * @returns 單位列表
 */
export const searchUnits = (keyword: string): Promise<Unit[]> => {
  return get<Unit[]>('/units/search', { keyword })
}

/**
 * 建立單位
 * @param data - 單位資料
 * @returns 建立的單位
 */
export const createUnit = (data: UnitRequest): Promise<Unit> => {
  return post<Unit>('/units', data)
}

/**
 * 更新單位
 * @param id - 單位 ID
 * @param data - 單位資料
 * @returns 更新後的單位
 */
export const updateUnit = (id: number, data: UnitRequest): Promise<Unit> => {
  return put<Unit>(`/units/${id}`, data)
}

/**
 * 刪除單位
 * @param id - 單位 ID
 * @returns 刪除結果
 */
export const deleteUnit = (id: number): Promise<void> => {
  return del<void>(`/units/${id}`)
}
