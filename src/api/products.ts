/**
 * 商品管理 API
 * 處理商品的 CRUD 操作和查詢
 */
import { get, post, put, del } from '@/utils/request'
import type { Product, ProductRequest, PaginatedResponse, PaginationParams } from '@/types'

/** 商品查詢參數 */
interface ProductQueryParams extends PaginationParams {
  /** 是否只查詢啟用的商品 */
  activeOnly?: boolean
}

/**
 * 查詢商品列表
 * @param params - 分頁和篩選參數
 * @returns 分頁商品列表
 */
export const getProducts = (params?: ProductQueryParams): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>('/products', params as Record<string, unknown>)
}

/**
 * 取得商品詳情
 * @param id - 商品 ID
 * @returns 商品詳情
 */
export const getProduct = (id: number): Promise<Product> => {
  return get<Product>(`/products/${id}`)
}

/**
 * 依 SKU 查詢商品
 * @param sku - 商品 SKU
 * @returns 商品資訊
 */
export const getProductBySku = (sku: string): Promise<Product> => {
  return get<Product>(`/products/sku/${sku}`)
}

/**
 * 依條碼查詢商品
 * @param barcode - 條碼
 * @returns 商品資訊
 */
export const getProductByBarcode = (barcode: string): Promise<Product> => {
  return get<Product>(`/products/barcode/${barcode}`)
}

/**
 * 搜尋商品
 * @param keyword - 搜尋關鍵字（名稱、SKU、條碼）
 * @param params - 分頁參數
 * @returns 分頁商品列表
 */
export const searchProducts = (
  keyword: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>('/products/search', {
    keyword,
    ...params,
  } as Record<string, unknown>)
}

/**
 * 依分類查詢商品
 * @param categoryId - 分類 ID
 * @param params - 分頁參數
 * @returns 分頁商品列表
 */
export const getProductsByCategory = (
  categoryId: number,
  params?: PaginationParams
): Promise<PaginatedResponse<Product>> => {
  return get<PaginatedResponse<Product>>(
    `/products/category/${categoryId}`,
    params as Record<string, unknown>
  )
}

/**
 * 建立商品
 * @param data - 商品資料
 * @returns 建立的商品
 */
export const createProduct = (data: ProductRequest): Promise<Product> => {
  return post<Product>('/products', data)
}

/**
 * 更新商品
 * @param id - 商品 ID
 * @param data - 商品資料
 * @returns 更新後的商品
 */
export const updateProduct = (id: number, data: ProductRequest): Promise<Product> => {
  return put<Product>(`/products/${id}`, data)
}

/**
 * 刪除商品（軟刪除）
 * @param id - 商品 ID
 * @returns 刪除結果
 */
export const deleteProduct = (id: number): Promise<void> => {
  return del<void>(`/products/${id}`)
}

/**
 * 永久刪除商品
 * @param id - 商品 ID
 * @returns 刪除結果
 */
export const deleteProductPermanent = (id: number): Promise<void> => {
  return del<void>(`/products/${id}/permanent`)
}
