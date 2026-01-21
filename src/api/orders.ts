/**
 * 訂單管理 API
 * 處理訂單的 CRUD 操作、付款和狀態管理
 */
import { get, post } from '@/utils/request'
import type {
  Order,
  OrderRequest,
  OrderQueryParams,
  PaymentRequest,
  PaymentResponse,
  PaginatedResponse,
} from '@/types'

/**
 * 查詢訂單列表
 * @param params - 查詢參數
 * @returns 分頁訂單列表
 */
export const getOrders = (params?: OrderQueryParams): Promise<PaginatedResponse<Order>> => {
  return get<PaginatedResponse<Order>>('/orders', params as Record<string, unknown>)
}

/**
 * 取得訂單詳情
 * @param id - 訂單 ID
 * @returns 訂單詳情
 */
export const getOrder = (id: number): Promise<Order> => {
  return get<Order>(`/orders/${id}`)
}

/**
 * 建立訂單
 * @param data - 訂單資料
 * @returns 建立的訂單
 */
export const createOrder = (data: OrderRequest): Promise<Order> => {
  return post<Order>('/orders', data)
}

/**
 * 取消訂單
 * @param id - 訂單 ID
 * @returns 取消後的訂單
 */
export const cancelOrder = (id: number): Promise<Order> => {
  return post<Order>(`/orders/${id}/cancel`)
}

/**
 * 申請退款
 * @param id - 訂單 ID
 * @returns 退款後的訂單
 */
export const refundOrder = (id: number): Promise<Order> => {
  return post<Order>(`/orders/${id}/refund`)
}

/**
 * 處理付款
 * @param data - 付款請求資料
 * @returns 付款回應
 */
export const processPayment = (data: PaymentRequest): Promise<PaymentResponse> => {
  return post<PaymentResponse>('/payments', data)
}
