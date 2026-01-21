/**
 * 分類管理 API
 * 處理商品分類的 CRUD 操作和樹狀結構查詢
 */
import { get, post, put, del } from '@/utils/request'
import type { Category, CategoryRequest, PaginatedResponse, PaginationParams } from '@/types'

/** 分類查詢參數 */
interface CategoryQueryParams extends PaginationParams {
  /** 是否只查詢啟用的分類 */
  activeOnly?: boolean
}

/**
 * 查詢分類列表
 * @param params - 分頁和篩選參數
 * @returns 分頁分類列表
 */
export const getCategories = (
  params?: CategoryQueryParams
): Promise<PaginatedResponse<Category>> => {
  return get<PaginatedResponse<Category>>('/categories', params as Record<string, unknown>)
}

/**
 * 取得分類詳情
 * @param id - 分類 ID
 * @returns 分類詳情
 */
export const getCategory = (id: number): Promise<Category> => {
  return get<Category>(`/categories/${id}`)
}

/**
 * 依代碼查詢分類
 * @param code - 分類代碼
 * @returns 分類資訊
 */
export const getCategoryByCode = (code: string): Promise<Category> => {
  return get<Category>(`/categories/code/${code}`)
}

/**
 * 取得分類樹狀結構
 * @param includeInactive - 是否包含停用的分類
 * @returns 分類樹狀結構
 */
export const getCategoryTree = (includeInactive?: boolean): Promise<Category[]> => {
  return get<Category[]>('/categories/tree', { includeInactive })
}

/**
 * 取得子分類
 * @param parentId - 父分類 ID
 * @returns 子分類列表
 */
export const getChildCategories = (parentId: number): Promise<Category[]> => {
  return get<Category[]>(`/categories/${parentId}/children`)
}

/**
 * 搜尋分類
 * @param keyword - 搜尋關鍵字
 * @returns 分類列表
 */
export const searchCategories = (keyword: string): Promise<Category[]> => {
  return get<Category[]>('/categories/search', { keyword })
}

/**
 * 建立分類
 * @param data - 分類資料
 * @returns 建立的分類
 */
export const createCategory = (data: CategoryRequest): Promise<Category> => {
  return post<Category>('/categories', data)
}

/**
 * 更新分類
 * @param id - 分類 ID
 * @param data - 分類資料
 * @returns 更新後的分類
 */
export const updateCategory = (id: number, data: CategoryRequest): Promise<Category> => {
  return put<Category>(`/categories/${id}`, data)
}

/**
 * 刪除分類
 * @param id - 分類 ID
 * @returns 刪除結果
 */
export const deleteCategory = (id: number): Promise<void> => {
  return del<void>(`/categories/${id}`)
}
