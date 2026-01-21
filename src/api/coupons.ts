/**
 * 優惠券管理 API
 * 處理優惠券的 CRUD 操作、驗證和使用
 */
import { get, post, put, del } from '@/utils/request'
import type {
  Coupon,
  CouponRequest,
  CouponUsage,
  ValidateCouponRequest,
  ValidateCouponResponse,
  UseCouponRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/types'

/**
 * 查詢優惠券列表
 * @param params - 分頁參數
 * @returns 分頁優惠券列表
 */
export const getCoupons = (params?: PaginationParams): Promise<PaginatedResponse<Coupon>> => {
  return get<PaginatedResponse<Coupon>>('/coupons', params as Record<string, unknown>)
}

/**
 * 取得優惠券詳情
 * @param id - 優惠券 ID
 * @returns 優惠券詳情
 */
export const getCoupon = (id: number): Promise<Coupon> => {
  return get<Coupon>(`/coupons/${id}`)
}

/**
 * 依代碼查詢優惠券
 * @param code - 優惠券代碼
 * @returns 優惠券資訊
 */
export const getCouponByCode = (code: string): Promise<Coupon> => {
  return get<Coupon>(`/coupons/code/${code}`)
}

/**
 * 建立優惠券
 * @param data - 優惠券資料
 * @returns 建立的優惠券
 */
export const createCoupon = (data: CouponRequest): Promise<Coupon> => {
  return post<Coupon>('/coupons', data)
}

/**
 * 更新優惠券
 * @param id - 優惠券 ID
 * @param data - 優惠券資料
 * @returns 更新後的優惠券
 */
export const updateCoupon = (id: number, data: CouponRequest): Promise<Coupon> => {
  return put<Coupon>(`/coupons/${id}`, data)
}

/**
 * 刪除優惠券
 * @param id - 優惠券 ID
 * @returns 刪除結果
 */
export const deleteCoupon = (id: number): Promise<void> => {
  return del<void>(`/coupons/${id}`)
}

/**
 * 驗證優惠券
 * @param data - 驗證請求資料
 * @returns 驗證結果
 */
export const validateCoupon = (data: ValidateCouponRequest): Promise<ValidateCouponResponse> => {
  return post<ValidateCouponResponse>('/coupons/validate', data)
}

/**
 * 使用優惠券
 * @param data - 使用請求資料
 * @returns 使用結果
 */
export const useCoupon = (data: UseCouponRequest): Promise<void> => {
  return post<void>('/coupons/use', data)
}

/**
 * 查詢優惠券使用記錄
 * @param couponId - 優惠券 ID
 * @returns 使用記錄列表
 */
export const getCouponUsage = (couponId: number): Promise<CouponUsage[]> => {
  return get<CouponUsage[]>(`/coupons/${couponId}/usage`)
}
