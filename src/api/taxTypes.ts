/**
 * 稅別管理 API
 * 處理稅別的 CRUD 操作
 */
import { get, post, put, del } from '@/utils/request'
import type { TaxType, TaxTypeRequest, PaginatedResponse, PaginationParams } from '@/types'

/**
 * 查詢稅別列表
 * @param params - 分頁參數
 * @returns 分頁稅別列表
 */
export const getTaxTypes = (params?: PaginationParams): Promise<PaginatedResponse<TaxType>> => {
  return get<PaginatedResponse<TaxType>>('/tax-types', params as Record<string, unknown>)
}

/**
 * 取得稅別詳情
 * @param id - 稅別 ID
 * @returns 稅別詳情
 */
export const getTaxType = (id: number): Promise<TaxType> => {
  return get<TaxType>(`/tax-types/${id}`)
}

/**
 * 依代碼查詢稅別
 * @param code - 稅別代碼
 * @returns 稅別資訊
 */
export const getTaxTypeByCode = (code: string): Promise<TaxType> => {
  return get<TaxType>(`/tax-types/code/${code}`)
}

/**
 * 查詢啟用的稅別
 * @returns 啟用的稅別列表
 */
export const getActiveTaxTypes = (): Promise<TaxType[]> => {
  return get<TaxType[]>('/tax-types/active')
}

/**
 * 取得預設稅別
 * @returns 預設稅別
 */
export const getDefaultTaxType = (): Promise<TaxType> => {
  return get<TaxType>('/tax-types/default')
}

/**
 * 建立稅別
 * @param data - 稅別資料
 * @returns 建立的稅別
 */
export const createTaxType = (data: TaxTypeRequest): Promise<TaxType> => {
  return post<TaxType>('/tax-types', data)
}

/**
 * 更新稅別
 * @param id - 稅別 ID
 * @param data - 稅別資料
 * @returns 更新後的稅別
 */
export const updateTaxType = (id: number, data: TaxTypeRequest): Promise<TaxType> => {
  return put<TaxType>(`/tax-types/${id}`, data)
}

/**
 * 刪除稅別
 * @param id - 稅別 ID
 * @returns 刪除結果
 */
export const deleteTaxType = (id: number): Promise<void> => {
  return del<void>(`/tax-types/${id}`)
}
