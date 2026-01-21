/**
 * 庫存管理 API
 * 處理庫存查詢、調整和異動記錄
 */
import { get, post } from '@/utils/request'
import type {
  Inventory,
  InventoryAdjustRequest,
  InventoryMovement,
  AdjustmentType,
  PaginatedResponse,
  PaginationParams,
} from '@/types'

/** 庫存異動查詢參數 */
interface InventoryMovementParams extends PaginationParams {
  /** 商品 ID */
  productId?: number
  /** 倉庫 ID */
  warehouseId?: number
  /** 異動類型 */
  movementType?: AdjustmentType
  /** 開始時間 */
  startTime?: string
  /** 結束時間 */
  endTime?: string
}

/**
 * 查詢所有庫存（分頁）
 * @param params - 分頁參數
 * @returns 分頁庫存列表
 */
export const getAllInventory = (
  params?: PaginationParams
): Promise<PaginatedResponse<Inventory>> => {
  return get<PaginatedResponse<Inventory>>('/inventory/all', params as Record<string, unknown>)
}

/**
 * 查詢特定庫存
 * @param productId - 商品 ID
 * @param warehouseId - 倉庫 ID
 * @returns 庫存資訊
 */
export const getInventory = (productId: number, warehouseId: number): Promise<Inventory> => {
  return get<Inventory>('/inventory', { productId, warehouseId })
}

/**
 * 查詢商品所有倉庫庫存
 * @param productId - 商品 ID
 * @returns 庫存列表
 */
export const getInventoryByProduct = (productId: number): Promise<Inventory[]> => {
  return get<Inventory[]>(`/inventory/product/${productId}`)
}

/**
 * 查詢商品總庫存
 * @param productId - 商品 ID
 * @returns 總庫存數量
 */
export const getProductTotalInventory = (productId: number): Promise<number> => {
  return get<number>(`/inventory/product/${productId}/total`)
}

/**
 * 查詢商品可用庫存
 * @param productId - 商品 ID
 * @returns 可用庫存數量
 */
export const getProductAvailableInventory = (productId: number): Promise<number> => {
  return get<number>(`/inventory/product/${productId}/available`)
}

/**
 * 查詢倉庫所有庫存
 * @param warehouseId - 倉庫 ID
 * @returns 庫存列表
 */
export const getInventoryByWarehouse = (warehouseId: number): Promise<Inventory[]> => {
  return get<Inventory[]>(`/inventory/warehouse/${warehouseId}`)
}

/**
 * 取得低庫存警告
 * @param threshold - 安全庫存閾值
 * @returns 低庫存列表
 */
export const getLowStockInventory = (threshold: number): Promise<PaginatedResponse<Inventory>> => {
  return get<PaginatedResponse<Inventory>>('/inventory/low-stock', { threshold })
}

/**
 * 調整庫存
 * @param data - 調整請求資料
 * @returns 調整後的庫存
 */
export const adjustInventory = (data: InventoryAdjustRequest): Promise<Inventory> => {
  return post<Inventory>('/inventory/adjust', data)
}

/**
 * 查詢商品在特定倉庫的庫存
 * @param productId - 商品 ID
 * @param warehouseId - 倉庫 ID
 * @returns 庫存資訊
 */
export const getProductInventory = (
  productId: number,
  warehouseId: number
): Promise<Inventory | null> => {
  return get<Inventory | null>('/inventory', { productId, warehouseId })
}

/**
 * 查詢庫存異動記錄（分頁）
 * 使用 /movements/search API，startDate 和 endDate 為必填
 * @param params - 查詢參數
 * @returns 分頁異動記錄列表
 */
export const getInventoryMovements = (
  params: Record<string, unknown>
): Promise<PaginatedResponse<InventoryMovement>> => {
  return get<PaginatedResponse<InventoryMovement>>('/inventory/movements/search', params)
}

/**
 * 查詢低庫存商品（分頁）
 * @param params - 查詢參數
 * @returns 分頁低庫存列表
 */
export const getLowStockItems = (
  params: Record<string, unknown>
): Promise<PaginatedResponse<Inventory>> => {
  return get<PaginatedResponse<Inventory>>('/inventory/low-stock', params)
}

/**
 * 查詢特定商品和倉庫的庫存異動記錄
 * @param productId - 商品 ID
 * @param warehouseId - 倉庫 ID
 * @returns 異動記錄列表
 */
export const getInventoryMovementsByProductAndWarehouse = (
  productId: number,
  warehouseId: number
): Promise<InventoryMovement[]> => {
  return get<InventoryMovement[]>('/inventory/movements', { productId, warehouseId })
}

/**
 * 查詢商品異動記錄
 * @param productId - 商品 ID
 * @returns 異動記錄列表
 */
export const getMovementsByProduct = (productId: number): Promise<InventoryMovement[]> => {
  return get<InventoryMovement[]>(`/inventory/movements/product/${productId}`)
}

/**
 * 查詢倉庫異動記錄
 * @param warehouseId - 倉庫 ID
 * @returns 異動記錄列表
 */
export const getMovementsByWarehouse = (warehouseId: number): Promise<InventoryMovement[]> => {
  return get<InventoryMovement[]>(`/inventory/movements/warehouse/${warehouseId}`)
}

/**
 * 依單號查詢異動記錄
 * @param referenceNo - 參考單號
 * @returns 異動記錄列表
 */
export const getMovementsByReference = (referenceNo: string): Promise<InventoryMovement[]> => {
  return get<InventoryMovement[]>(`/inventory/movements/reference/${referenceNo}`)
}

/**
 * 複合條件查詢異動記錄
 * @param params - 查詢參數
 * @returns 異動記錄列表
 */
export const searchMovements = (params: InventoryMovementParams): Promise<InventoryMovement[]> => {
  return get<InventoryMovement[]>('/inventory/movements/search', params as Record<string, unknown>)
}

/**
 * 取得異動類型列表
 * @returns 異動類型列表
 */
export const getMovementTypes = (): Promise<{ code: string; name: string }[]> => {
  return get<{ code: string; name: string }[]>('/inventory/movement-types')
}
