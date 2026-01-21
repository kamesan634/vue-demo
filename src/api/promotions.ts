/**
 * 促銷管理 API
 * 處理促銷活動的 CRUD 操作
 */
import { get, post, put, del } from '@/utils/request'
import type { Promotion, PromotionRequest, PaginatedResponse, PaginationParams } from '@/types'

/**
 * 查詢促銷活動列表
 * @param params - 分頁參數
 * @returns 分頁促銷活動列表
 */
export const getPromotions = (params?: PaginationParams): Promise<PaginatedResponse<Promotion>> => {
  return get<PaginatedResponse<Promotion>>('/promotions', params as Record<string, unknown>)
}

/**
 * 取得促銷活動詳情
 * @param id - 促銷活動 ID
 * @returns 促銷活動詳情
 */
export const getPromotion = (id: number): Promise<Promotion> => {
  return get<Promotion>(`/promotions/${id}`)
}

/**
 * 取得進行中的促銷活動
 * @returns 進行中的促銷活動列表
 */
export const getOngoingPromotions = (): Promise<Promotion[]> => {
  return get<Promotion[]>('/promotions/ongoing')
}

/**
 * 建立促銷活動
 * @param data - 促銷活動資料
 * @returns 建立的促銷活動
 */
export const createPromotion = (data: PromotionRequest): Promise<Promotion> => {
  return post<Promotion>('/promotions', data)
}

/**
 * 更新促銷活動
 * @param id - 促銷活動 ID
 * @param data - 促銷活動資料
 * @returns 更新後的促銷活動
 */
export const updatePromotion = (id: number, data: PromotionRequest): Promise<Promotion> => {
  return put<Promotion>(`/promotions/${id}`, data)
}

/**
 * 刪除促銷活動
 * @param id - 促銷活動 ID
 * @returns 刪除結果
 */
export const deletePromotion = (id: number): Promise<void> => {
  return del<void>(`/promotions/${id}`)
}
