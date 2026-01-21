/**
 * 供應商管理 API
 * 處理供應商的 CRUD 操作
 */
import { get, post, put, del } from '@/utils/request'
import type { Supplier, SupplierRequest, PaginatedResponse, PaginationParams } from '@/types'

/**
 * 查詢供應商列表
 * @param params - 分頁參數
 * @returns 分頁供應商列表
 */
export const getSuppliers = (params?: PaginationParams): Promise<PaginatedResponse<Supplier>> => {
  return get<PaginatedResponse<Supplier>>('/suppliers', params as Record<string, unknown>)
}

/**
 * 取得供應商詳情
 * @param id - 供應商 ID
 * @returns 供應商詳情
 */
export const getSupplier = (id: number): Promise<Supplier> => {
  return get<Supplier>(`/suppliers/${id}`)
}

/**
 * 建立供應商
 * @param data - 供應商資料
 * @returns 建立的供應商
 */
export const createSupplier = (data: SupplierRequest): Promise<Supplier> => {
  return post<Supplier>('/suppliers', data)
}

/**
 * 更新供應商
 * @param id - 供應商 ID
 * @param data - 供應商資料
 * @returns 更新後的供應商
 */
export const updateSupplier = (id: number, data: SupplierRequest): Promise<Supplier> => {
  return put<Supplier>(`/suppliers/${id}`, data)
}

/**
 * 刪除供應商
 * @param id - 供應商 ID
 * @returns 刪除結果
 */
export const deleteSupplier = (id: number): Promise<void> => {
  return del<void>(`/suppliers/${id}`)
}
