/**
 * 客戶管理 API
 * 處理客戶/會員的 CRUD 操作和點數管理
 */
import { get, post, put, del } from '@/utils/request'
import type {
  Customer,
  CustomerRequest,
  CustomerStatistics,
  PaginatedResponse,
  PaginationParams,
} from '@/types'

/** 客戶查詢參數 */
interface CustomerQueryParams extends PaginationParams {
  /** 搜尋關鍵字 */
  keyword?: string
  /** 等級 ID */
  levelId?: number
  /** 是否啟用 */
  active?: boolean
  /** 性別 */
  gender?: string
}

/**
 * 查詢客戶列表
 * @param params - 分頁和篩選參數
 * @returns 分頁客戶列表
 */
export const getCustomers = (
  params?: CustomerQueryParams
): Promise<PaginatedResponse<Customer>> => {
  return get<PaginatedResponse<Customer>>('/customers', params as Record<string, unknown>)
}

/**
 * 取得客戶詳情
 * @param id - 客戶 ID
 * @returns 客戶詳情
 */
export const getCustomer = (id: number): Promise<Customer> => {
  return get<Customer>(`/customers/${id}`)
}

/**
 * 依會員編號查詢客戶
 * @param memberNo - 會員編號
 * @returns 客戶資訊
 */
export const getCustomerByMemberNo = (memberNo: string): Promise<Customer> => {
  return get<Customer>(`/customers/member-no/${memberNo}`)
}

/**
 * 搜尋客戶
 * @param keyword - 搜尋關鍵字（姓名、手機、Email、會員編號）
 * @param params - 分頁參數
 * @returns 分頁客戶列表
 */
export const searchCustomers = (
  keyword: string,
  params?: PaginationParams
): Promise<PaginatedResponse<Customer>> => {
  return get<PaginatedResponse<Customer>>('/customers/search', {
    keyword,
    ...params,
  } as Record<string, unknown>)
}

/**
 * 複合條件查詢客戶
 * @param params - 查詢參數
 * @returns 分頁客戶列表
 */
export const filterCustomers = (
  params: CustomerQueryParams
): Promise<PaginatedResponse<Customer>> => {
  return get<PaginatedResponse<Customer>>('/customers/filter', params as Record<string, unknown>)
}

/**
 * 查詢今日壽星
 * @returns 今日壽星列表
 */
export const getTodayBirthdays = (): Promise<Customer[]> => {
  return get<Customer[]>('/customers/birthday/today')
}

/**
 * 查詢本月壽星
 * @returns 本月壽星列表
 */
export const getMonthBirthdays = (): Promise<Customer[]> => {
  return get<Customer[]>('/customers/birthday/month')
}

/**
 * 取得會員統計資訊
 * @returns 會員統計資訊
 */
export const getCustomerStatistics = (): Promise<CustomerStatistics> => {
  return get<CustomerStatistics>('/customers/statistics')
}

/**
 * 建立客戶
 * @param data - 客戶資料
 * @returns 建立的客戶
 */
export const createCustomer = (data: CustomerRequest): Promise<Customer> => {
  return post<Customer>('/customers', data)
}

/**
 * 更新客戶
 * @param id - 客戶 ID
 * @param data - 客戶資料
 * @returns 更新後的客戶
 */
export const updateCustomer = (id: number, data: CustomerRequest): Promise<Customer> => {
  return put<Customer>(`/customers/${id}`, data)
}

/**
 * 刪除客戶（軟刪除）
 * @param id - 客戶 ID
 * @returns 刪除結果
 */
export const deleteCustomer = (id: number): Promise<void> => {
  return del<void>(`/customers/${id}`)
}

/**
 * 新增會員點數
 * @param id - 客戶 ID
 * @param points - 增加的點數
 * @param reason - 原因說明
 * @returns 更新後的客戶
 */
export const addPoints = (id: number, points: number, reason?: string): Promise<Customer> => {
  return post<Customer>(`/customers/${id}/points/add`, null, {
    params: { points, reason },
  })
}

/**
 * 扣除會員點數
 * @param id - 客戶 ID
 * @param points - 扣除的點數
 * @param reason - 原因說明
 * @returns 更新後的客戶
 */
export const deductPoints = (id: number, points: number, reason?: string): Promise<Customer> => {
  return post<Customer>(`/customers/${id}/points/deduct`, null, {
    params: { points, reason },
  })
}

/**
 * 計算消費可獲得點數
 * @param id - 客戶 ID
 * @param spentAmount - 消費金額
 * @returns 可獲得的點數
 */
export const calculatePoints = (id: number, spentAmount: number): Promise<number> => {
  return get<number>(`/customers/${id}/points/calculate`, { spentAmount })
}

/**
 * 記錄消費
 * @param id - 客戶 ID
 * @param spentAmount - 消費金額
 * @returns 更新後的客戶
 */
export const recordSpending = (id: number, spentAmount: number): Promise<Customer> => {
  return post<Customer>(`/customers/${id}/spending`, null, {
    params: { spentAmount },
  })
}
