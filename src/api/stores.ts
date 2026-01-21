/**
 * 門市/倉庫管理 API
 * 處理門市和倉庫的 CRUD 操作
 */
import { get, post, put, del } from '@/utils/request'
import type { Store, StoreRequest, StoreType, PaginatedResponse, PaginationParams } from '@/types'

/** 門市查詢參數 */
interface StoreQueryParams extends PaginationParams {
  /** 類型篩選 */
  type?: StoreType
}

/**
 * 查詢門市/倉庫列表
 * @param params - 分頁和篩選參數
 * @returns 分頁門市列表
 */
export const getStores = (params?: StoreQueryParams): Promise<PaginatedResponse<Store>> => {
  return get<PaginatedResponse<Store>>('/stores', params as Record<string, unknown>)
}

/**
 * 取得門市/倉庫詳情
 * @param id - 門市 ID
 * @returns 門市詳情
 */
export const getStore = (id: number): Promise<Store> => {
  return get<Store>(`/stores/${id}`)
}

/**
 * 依代碼查詢門市/倉庫
 * @param code - 門市代碼
 * @returns 門市資訊
 */
export const getStoreByCode = (code: string): Promise<Store> => {
  return get<Store>(`/stores/code/${code}`)
}

/**
 * 查詢所有啟用的門市/倉庫
 * @returns 啟用的門市列表
 */
export const getActiveStores = (): Promise<Store[]> => {
  return get<Store[]>('/stores/active')
}

/**
 * 查詢所有門市
 * @returns 門市列表
 */
export const getAllStoresByTypeStore = (): Promise<Store[]> => {
  return get<Store[]>('/stores/type/store')
}

/**
 * 查詢所有倉庫
 * @returns 倉庫列表
 */
export const getAllStoresByTypeWarehouse = (): Promise<Store[]> => {
  return get<Store[]>('/stores/type/warehouse')
}

/**
 * 查詢主倉庫/總部
 * @returns 主倉庫資訊
 */
export const getMainStore = (): Promise<Store> => {
  return get<Store>('/stores/main')
}

/**
 * 建立門市/倉庫
 * @param data - 門市資料
 * @returns 建立的門市
 */
export const createStore = (data: StoreRequest): Promise<Store> => {
  return post<Store>('/stores', data)
}

/**
 * 更新門市/倉庫
 * @param id - 門市 ID
 * @param data - 門市資料
 * @returns 更新後的門市
 */
export const updateStore = (id: number, data: StoreRequest): Promise<Store> => {
  return put<Store>(`/stores/${id}`, data)
}

/**
 * 刪除門市/倉庫（軟刪除）
 * @param id - 門市 ID
 * @returns 刪除結果
 */
export const deleteStore = (id: number): Promise<void> => {
  return del<void>(`/stores/${id}`)
}
