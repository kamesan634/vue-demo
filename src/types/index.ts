/**
 * TypeScript 類型定義主文件
 * 匯出所有應用程式使用的類型定義
 */

// ================================
// API 通用類型
// ================================

/**
 * API 統一回應格式
 * @template T - 回應資料的類型
 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 */
  success: boolean
  /** HTTP 狀態碼 */
  code: number
  /** 訊息說明 */
  message: string
  /** 回傳資料 */
  data?: T
  /** 回應時間 (ISO 8601) */
  timestamp: string
}

/**
 * 分頁查詢參數
 */
export interface PaginationParams {
  /** 頁碼（從 1 開始） */
  page?: number
  /** 每頁筆數 */
  size?: number
  /** 排序欄位 */
  sortBy?: string
  /** 排序方向 */
  sortDir?: 'asc' | 'desc'
}

/**
 * 分頁回應格式
 * @template T - 內容項目的類型
 */
export interface PaginatedResponse<T> {
  /** 內容列表 */
  content: T[]
  /** 當前頁碼 */
  page: number
  /** 每頁筆數 */
  size: number
  /** 總筆數 */
  totalElements: number
  /** 總頁數 */
  totalPages: number
  /** 是否為第一頁 */
  first: boolean
  /** 是否為最後一頁 */
  last: boolean
}

// ================================
// 認證相關類型
// ================================

/**
 * 登入請求
 */
export interface LoginRequest {
  /** 使用者名稱 */
  username: string
  /** 密碼 */
  password: string
}

/**
 * 使用者資訊
 */
export interface UserInfo {
  /** 使用者 ID */
  id: number
  /** 使用者名稱 */
  username: string
  /** 姓名 */
  name: string
  /** Email */
  email: string
  /** 角色代碼 */
  role: string
  /** 角色名稱 */
  roleName: string
}

/**
 * 登入回應
 */
export interface LoginResponse {
  /** Access Token */
  accessToken: string
  /** Refresh Token */
  refreshToken: string
  /** Token 類型 */
  tokenType: string
  /** 過期時間（秒） */
  expiresIn: number
  /** 使用者資訊 */
  user: UserInfo
  /** 密碼是否過期 */
  passwordExpired: boolean
  /** 密碼剩餘天數 */
  passwordRemainingDays: number
  /** 是否需要變更密碼 */
  passwordChangeRequired: boolean
}

/**
 * Token 刷新請求
 */
export interface RefreshTokenRequest {
  /** Refresh Token */
  refreshToken: string
}

/**
 * Token 刷新回應
 */
export interface RefreshTokenResponse {
  /** 新的 Access Token */
  accessToken: string
  /** 新的 Refresh Token */
  refreshToken: string
  /** Token 類型 */
  tokenType: string
  /** 過期時間（秒） */
  expiresIn: number
}

/**
 * 變更密碼請求
 */
export interface ChangePasswordRequest {
  /** 目前密碼 */
  currentPassword: string
  /** 新密碼 */
  newPassword: string
  /** 確認新密碼 */
  confirmPassword: string
}

// ================================
// 商品相關類型
// ================================

/**
 * 分類資訊
 */
export interface Category {
  /** 分類 ID */
  id: number
  /** 分類代碼 */
  code: string
  /** 分類名稱 */
  name: string
  /** 分類描述 */
  description?: string
  /** 父分類 ID */
  parentId?: number
  /** 完整路徑名稱 */
  fullPathName?: string
  /** 排序順序 */
  sortOrder: number
  /** 是否啟用 */
  active: boolean
  /** 子分類 */
  children?: Category[]
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新分類請求
 */
export interface CategoryRequest {
  /** 分類代碼 */
  code: string
  /** 分類名稱 */
  name: string
  /** 分類描述 */
  description?: string
  /** 父分類 ID */
  parentId?: number
  /** 排序順序 */
  sortOrder?: number
  /** 是否啟用 */
  active?: boolean
}

/**
 * 單位資訊
 */
export interface Unit {
  /** 單位 ID */
  id: number
  /** 單位代碼 */
  code: string
  /** 單位名稱 */
  name: string
  /** 是否啟用 */
  active: boolean
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新單位請求
 */
export interface UnitRequest {
  /** 單位代碼 */
  code: string
  /** 單位名稱 */
  name: string
  /** 是否啟用 */
  active?: boolean
}

/**
 * 稅別資訊
 */
export interface TaxType {
  /** 稅別 ID */
  id: number
  /** 稅別代碼 */
  code: string
  /** 稅別名稱 */
  name: string
  /** 稅率（百分比） */
  rate: number
  /** 是否為預設 */
  isDefault: boolean
  /** 是否啟用 */
  active: boolean
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新稅別請求
 */
export interface TaxTypeRequest {
  /** 稅別代碼 */
  code: string
  /** 稅別名稱 */
  name: string
  /** 稅率（百分比） */
  rate: number
  /** 是否為預設 */
  isDefault?: boolean
  /** 是否啟用 */
  active?: boolean
}

/**
 * 商品條碼
 */
export interface ProductBarcode {
  /** 條碼 */
  barcode: string
  /** 條碼類型 */
  barcodeType: string
  /** 備註 */
  notes?: string
}

/**
 * 商品資訊
 */
export interface Product {
  /** 商品 ID */
  id: number
  /** SKU 貨號 */
  sku: string
  /** 商品名稱 */
  name: string
  /** 商品描述 */
  description?: string
  /** 分類資訊 */
  category?: Category
  /** 單位資訊 */
  unit: Unit
  /** 稅別資訊 */
  taxType: TaxType
  /** 成本價 */
  costPrice: number
  /** 售價 */
  sellingPrice: number
  /** 含稅價 */
  taxIncludedPrice: number
  /** 毛利 */
  grossProfit: number
  /** 毛利率 */
  grossProfitMargin: number
  /** 主要條碼 */
  barcode?: string
  /** 安全庫存量 */
  safetyStock: number
  /** 是否啟用 */
  active: boolean
  /** 額外條碼列表 */
  barcodes: ProductBarcode[]
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新商品請求
 */
export interface ProductRequest {
  /** SKU 貨號 */
  sku: string
  /** 商品名稱 */
  name: string
  /** 商品描述 */
  description?: string
  /** 分類 ID */
  categoryId?: number
  /** 單位 ID */
  unitId: number
  /** 稅別 ID */
  taxTypeId: number
  /** 成本價 */
  costPrice?: number
  /** 售價 */
  sellingPrice: number
  /** 主要條碼 */
  barcode?: string
  /** 安全庫存量 */
  safetyStock?: number
  /** 是否啟用 */
  active?: boolean
  /** 額外條碼列表 */
  barcodes?: ProductBarcode[]
}

// ================================
// 客戶相關類型
// ================================

/**
 * 會員等級
 */
export interface CustomerLevel {
  /** 等級 ID */
  id: number
  /** 等級代碼 */
  code: string
  /** 等級名稱 */
  name: string
  /** 折扣率 */
  discountRate: number
  /** 點數倍率 */
  pointsMultiplier: number
}

/**
 * 客戶/會員資訊
 */
export interface Customer {
  /** 客戶 ID */
  id: number
  /** 會員編號 */
  memberNo: string
  /** 姓名 */
  name: string
  /** 電話 */
  phone: string
  /** Email */
  email?: string
  /** 性別 */
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  /** 性別顯示 */
  genderDisplay?: string
  /** 生日 */
  birthday?: string
  /** 年齡 */
  age?: number
  /** 是否今日生日 */
  birthdayToday?: boolean
  /** 是否本月生日 */
  birthdayMonth?: boolean
  /** 地址 */
  address?: string
  /** 會員等級 */
  level: CustomerLevel
  /** 總點數 */
  totalPoints: number
  /** 總消費金額 */
  totalSpent: number
  /** 註冊日期 */
  registerDate?: string
  /** 是否啟用 */
  active: boolean
  /** 備註 */
  notes?: string
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新客戶請求
 */
export interface CustomerRequest {
  /** 姓名 */
  name: string
  /** 電話 */
  phone: string
  /** Email */
  email?: string
  /** 性別 */
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  /** 生日 */
  birthday?: string
  /** 地址 */
  address?: string
  /** 會員等級 ID */
  levelId?: number
  /** 備註 */
  notes?: string
}

/**
 * 客戶統計資訊
 */
export interface CustomerStatistics {
  /** 總客戶數 */
  totalCustomers: number
  /** 活躍客戶數 */
  activeCustomers: number
  /** 今日註冊數 */
  todayRegistrations: number
  /** 今日壽星數 */
  todayBirthdays: number
}

// ================================
// 訂單相關類型
// ================================

/** 訂單狀態 */
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED'

/**
 * 訂單明細
 */
export interface OrderItem {
  /** 明細 ID */
  id: number
  /** 商品 ID */
  productId: number
  /** 商品編號 */
  productCode: string
  /** 商品名稱 */
  productName: string
  /** 數量 */
  quantity: number
  /** 單價 */
  unitPrice: number
  /** 折扣金額 */
  discountAmount: number
  /** 小計 */
  subtotal: number
}

/**
 * 訂單資訊
 */
export interface Order {
  /** 訂單 ID */
  id: number
  /** 訂單編號 */
  orderNo: string
  /** 門市 ID */
  storeId: number
  /** 門市名稱 */
  storeName: string
  /** 客戶 ID */
  customerId?: number
  /** 客戶名稱 */
  customerName?: string
  /** 訂單日期 */
  orderDate: string
  /** 訂單時間 */
  orderTime: string
  /** 小計 */
  subtotal: number
  /** 折扣金額 */
  discountAmount: number
  /** 稅額 */
  taxAmount: number
  /** 總金額 */
  totalAmount: number
  /** 已付金額 */
  paidAmount: number
  /** 找零 */
  changeAmount: number
  /** 獲得點數 */
  pointsEarned: number
  /** 使用點數 */
  pointsUsed: number
  /** 訂單狀態 */
  status: OrderStatus
  /** 狀態描述 */
  statusDescription: string
  /** 備註 */
  notes?: string
  /** 訂單明細 */
  items: OrderItem[]
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立訂單明細請求
 */
export interface OrderItemRequest {
  /** 商品 ID */
  productId: number
  /** 數量 */
  quantity: number
  /** 單價 */
  unitPrice: number
  /** 折扣金額 */
  discountAmount?: number
}

/**
 * 建立訂單請求
 */
export interface OrderRequest {
  /** 門市 ID */
  storeId: number
  /** 客戶 ID */
  customerId?: number
  /** 訂單明細 */
  items: OrderItemRequest[]
  /** 訂單折扣 */
  discountAmount?: number
  /** 稅額 */
  taxAmount?: number
  /** 備註 */
  notes?: string
}

/**
 * 訂單查詢參數
 */
export interface OrderQueryParams extends PaginationParams {
  /** 訂單編號關鍵字 */
  orderNoKeyword?: string
  /** 門市 ID */
  storeId?: number
  /** 客戶 ID */
  customerId?: number
  /** 訂單狀態 */
  status?: OrderStatus
  /** 開始日期 */
  startDate?: string
  /** 結束日期 */
  endDate?: string
}

// ================================
// 付款相關類型
// ================================

/** 付款方式 */
export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'LINE_PAY'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'JKOPAY'
  | 'POINTS'

/**
 * 付款請求
 */
export interface PaymentRequest {
  /** 訂單 ID */
  orderId: number
  /** 付款方式 */
  paymentMethod: PaymentMethod
  /** 付款金額 */
  amount: number
  /** 實收金額 */
  receivedAmount?: number
  /** 交易參考號 */
  referenceNo?: string
}

/**
 * 付款回應
 */
export interface PaymentResponse {
  /** 付款 ID */
  id: number
  /** 訂單 ID */
  orderId: number
  /** 訂單編號 */
  orderNo: string
  /** 付款方式 */
  paymentMethod: PaymentMethod
  /** 付款方式名稱 */
  paymentMethodName: string
  /** 付款金額 */
  amount: number
  /** 實收金額 */
  receivedAmount: number
  /** 找零 */
  changeAmount: number
  /** 付款狀態 */
  status: string
  /** 付款時間 */
  paidAt: string
}

// ================================
// 門市/倉庫相關類型
// ================================

/** 門市/倉庫類型 */
export type StoreType = 'STORE' | 'WAREHOUSE'

/**
 * 門市/倉庫資訊
 */
export interface Store {
  /** 門市 ID */
  id: number
  /** 代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 類型 */
  type: StoreType
  /** 類型名稱 */
  typeName: string
  /** 地址 */
  address?: string
  /** 電話 */
  phone?: string
  /** Email */
  email?: string
  /** 營業時間 */
  businessHours?: string
  /** 是否為主倉庫/總部 */
  main: boolean
  /** 是否啟用 */
  active: boolean
  /** 排序順序 */
  sortOrder: number
  /** 備註 */
  notes?: string
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新門市/倉庫請求
 */
export interface StoreRequest {
  /** 代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 類型 */
  type?: StoreType
  /** 地址 */
  address?: string
  /** 電話 */
  phone?: string
  /** Email */
  email?: string
  /** 營業時間 */
  businessHours?: string
  /** 是否為主倉庫/總部 */
  main?: boolean
  /** 是否啟用 */
  active?: boolean
  /** 排序順序 */
  sortOrder?: number
  /** 備註 */
  notes?: string
}

// ================================
// 庫存相關類型
// ================================

/**
 * 庫存資訊
 */
export interface Inventory {
  /** 庫存 ID */
  id: number
  /** 商品 ID */
  productId: number
  /** 商品 SKU */
  productSku: string
  /** 商品名稱 */
  productName: string
  /** 倉庫/門市 ID */
  warehouseId: number
  /** 倉庫/門市名稱 */
  warehouseName: string
  /** 庫存數量 */
  quantity: number
  /** 預留數量 */
  reservedQuantity: number
  /** 可用數量 */
  availableQuantity: number
  /** 最後異動日期 */
  lastMovementDate?: string
}

/** 庫存調整類型 */
export type AdjustmentType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN_IN'
  | 'RETURN_OUT'

/**
 * 庫存調整請求
 */
export interface InventoryAdjustRequest {
  /** 商品 ID */
  productId: number
  /** 倉庫 ID */
  warehouseId: number
  /** 調整類型 */
  adjustmentType: AdjustmentType
  /** 數量 */
  quantity: number
  /** 原因 */
  reason?: string
  /** 參考單號 */
  referenceNo?: string
}

/**
 * 庫存異動記錄
 */
export interface InventoryMovement {
  /** 異動 ID */
  id: number
  /** 商品 ID */
  productId: number
  /** 商品 SKU */
  productSku: string
  /** 商品名稱 */
  productName: string
  /** 倉庫 ID */
  warehouseId: number
  /** 倉庫名稱 */
  warehouseName: string
  /** 異動類型 */
  movementType: AdjustmentType
  /** 數量 */
  quantity: number
  /** 異動前數量 */
  beforeQuantity: number
  /** 異動後數量 */
  afterQuantity: number
  /** 參考單號 */
  referenceNo?: string
  /** 原因 */
  reason?: string
  /** 異動時間 */
  createdAt: string
}

// ================================
// 供應商相關類型
// ================================

/**
 * 供應商資訊
 */
export interface Supplier {
  /** 供應商 ID */
  id: number
  /** 代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 聯絡人 */
  contactPerson?: string
  /** 電話 */
  phone?: string
  /** Email */
  email?: string
  /** 地址 */
  address?: string
  /** 統一編號 */
  taxId?: string
  /** 付款條件 */
  paymentTerms?: string
  /** 銀行帳號 */
  bankAccount?: string
  /** 是否啟用 */
  active: boolean
  /** 備註 */
  notes?: string
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新供應商請求
 */
export interface SupplierRequest {
  /** 代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 聯絡人 */
  contactPerson?: string
  /** 電話 */
  phone?: string
  /** Email */
  email?: string
  /** 地址 */
  address?: string
  /** 統一編號 */
  taxId?: string
  /** 付款條件 */
  paymentTerms?: string
  /** 銀行帳號 */
  bankAccount?: string
  /** 是否啟用 */
  active?: boolean
  /** 備註 */
  notes?: string
}

// ================================
// 促銷相關類型
// ================================

/** 促銷類型 */
export type PromotionType =
  | 'PERCENTAGE_DISCOUNT'
  | 'FIXED_DISCOUNT'
  | 'BUY_X_GET_Y'
  | 'BUNDLE'
  | 'FREE_SHIPPING'

/**
 * 促銷活動資訊
 */
export interface Promotion {
  /** 促銷 ID */
  id: number
  /** 活動名稱 */
  name: string
  /** 活動描述 */
  description?: string
  /** 促銷類型 */
  type: PromotionType
  /** 折扣值 */
  discountValue: number
  /** 開始日期 */
  startDate: string
  /** 結束日期 */
  endDate: string
  /** 最低消費金額 */
  minPurchaseAmount?: number
  /** 最高折扣金額 */
  maxDiscountAmount?: number
  /** 適用商品 ID 列表 */
  applicableProducts?: number[]
  /** 適用分類 ID 列表 */
  applicableCategories?: number[]
  /** 是否啟用 */
  active: boolean
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新促銷活動請求
 */
export interface PromotionRequest {
  /** 活動名稱 */
  name: string
  /** 活動描述 */
  description?: string
  /** 促銷類型 */
  type: PromotionType
  /** 折扣值 */
  discountValue: number
  /** 開始日期 */
  startDate: string
  /** 結束日期 */
  endDate: string
  /** 最低消費金額 */
  minPurchaseAmount?: number
  /** 最高折扣金額 */
  maxDiscountAmount?: number
  /** 適用商品 ID 列表 */
  applicableProducts?: number[]
  /** 適用分類 ID 列表 */
  applicableCategories?: number[]
  /** 是否啟用 */
  active?: boolean
}

// ================================
// 優惠券相關類型
// ================================

/** 優惠券折扣類型 */
export type CouponDiscountType = 'FIXED' | 'PERCENTAGE'

/**
 * 優惠券資訊
 */
export interface Coupon {
  /** 優惠券 ID */
  id: number
  /** 優惠券代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 描述 */
  description?: string
  /** 折扣類型 */
  discountType: CouponDiscountType
  /** 折扣值 */
  discountValue: number
  /** 最低消費金額 */
  minPurchaseAmount?: number
  /** 最大使用次數 */
  maxUsageCount?: number
  /** 每人最大使用次數 */
  maxUsagePerCustomer?: number
  /** 已使用次數 */
  usedCount: number
  /** 開始日期 */
  startDate: string
  /** 結束日期 */
  endDate: string
  /** 是否啟用 */
  active: boolean
  /** 建立時間 */
  createdAt?: string
  /** 更新時間 */
  updatedAt?: string
}

/**
 * 建立/更新優惠券請求
 */
export interface CouponRequest {
  /** 優惠券代碼 */
  code: string
  /** 名稱 */
  name: string
  /** 描述 */
  description?: string
  /** 折扣類型 */
  discountType: CouponDiscountType
  /** 折扣值 */
  discountValue: number
  /** 最低消費金額 */
  minPurchaseAmount?: number
  /** 最大使用次數 */
  maxUsageCount?: number
  /** 每人最大使用次數 */
  maxUsagePerCustomer?: number
  /** 開始日期 */
  startDate: string
  /** 結束日期 */
  endDate: string
  /** 是否啟用 */
  active?: boolean
}

/**
 * 驗證優惠券請求
 */
export interface ValidateCouponRequest {
  /** 優惠券代碼 */
  code: string
  /** 客戶 ID */
  customerId?: number
  /** 訂單金額 */
  orderAmount: number
}

/**
 * 驗證優惠券回應
 */
export interface ValidateCouponResponse {
  /** 是否有效 */
  valid: boolean
  /** 優惠券 ID */
  couponId?: number
  /** 優惠券代碼 */
  code: string
  /** 折扣金額 */
  discountAmount?: number
  /** 訊息 */
  message: string
}

/**
 * 使用優惠券請求
 */
export interface UseCouponRequest {
  /** 優惠券代碼 */
  code: string
  /** 客戶 ID */
  customerId?: number
  /** 訂單 ID */
  orderId: number
}

// ================================
// 報表相關類型
// ================================

/**
 * 儀表板摘要資料
 */
export interface DashboardSummary {
  /** 今日銷售額 */
  todaySales: number
  /** 本月銷售額 */
  monthSales: number
  /** 本年銷售額 */
  yearSales: number
  /** 今日訂單數 */
  todayOrderCount: number
  /** 本月訂單數 */
  monthOrderCount: number
  /** 銷售成長率 */
  salesGrowthRate: number
  /** 總商品數 */
  totalProducts: number
  /** 低庫存商品數 */
  lowStockProducts: number
  /** 缺貨商品數 */
  outOfStockProducts: number
  /** 庫存總價值 */
  inventoryValue: number
  /** 待處理採購單數 */
  pendingPurchaseOrders: number
  /** 本月採購金額 */
  monthPurchaseAmount: number
  /** 總客戶數 */
  totalCustomers: number
  /** 本月新客戶數 */
  newCustomersThisMonth: number
  /** 銷售圖表資料 */
  salesChart: SalesChartData[]
  /** 分類銷售資料 */
  categorySales: CategorySalesData[]
  /** 熱銷商品 */
  topProducts: TopProductData[]
}

/**
 * 銷售圖表資料
 */
export interface SalesChartData {
  /** 日期 */
  date: string
  /** 銷售額 */
  sales: number
  /** 訂單數 */
  orderCount: number
}

/**
 * 分類銷售資料
 */
export interface CategorySalesData {
  /** 分類 ID */
  categoryId: number
  /** 分類名稱 */
  categoryName: string
  /** 銷售額 */
  sales: number
  /** 佔比 */
  percentage: number
}

/**
 * 熱銷商品資料
 */
export interface TopProductData {
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 銷售數量 */
  quantity: number
  /** 銷售金額 */
  sales: number
}

/**
 * 銷售報表查詢參數
 */
export interface SalesReportParams {
  /** 開始日期 */
  startDate: string
  /** 結束日期 */
  endDate: string
  /** 門市 ID */
  storeId?: number
}

/**
 * 利潤分析資料
 */
export interface ProfitAnalysis {
  /** 開始日期 */
  startDate: string
  /** 結束日期 */
  endDate: string
  /** 總營收 */
  totalRevenue: number
  /** 總成本 */
  totalCost: number
  /** 毛利 */
  grossProfit: number
  /** 毛利率 */
  grossProfitMargin: number
  /** 訂單數 */
  orderCount: number
  /** 平均訂單金額 */
  averageOrderValue: number
  /** 平均訂單利潤 */
  averageOrderProfit: number
  /** 每日利潤資料 */
  dailyProfits: DailyProfitData[]
}

/**
 * 每日利潤資料
 */
export interface DailyProfitData {
  /** 日期 */
  date: string
  /** 訂單數 */
  orderCount: number
  /** 營收 */
  revenue: number
  /** 成本 */
  cost: number
  /** 毛利 */
  grossProfit: number
  /** 利潤率 */
  profitMargin: number
}

// ================================
// 系統管理相關類型
// ================================

/**
 * 系統參數
 */
export interface SystemParameter {
  /** 參數類別 */
  category: string
  /** 參數鍵 */
  key: string
  /** 參數值 */
  value: string
  /** 參數描述 */
  description?: string
}

/**
 * 稽核日誌
 */
export interface AuditLog {
  /** 日誌 ID */
  id: number
  /** 使用者 ID */
  userId: number
  /** 使用者名稱 */
  userName: string
  /** 動作類型 */
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
  /** 實體類型 */
  entityType: string
  /** 實體 ID */
  entityId?: number
  /** 修改前數值 */
  oldValue?: string
  /** 修改後數值 */
  newValue?: string
  /** IP 位址 */
  ipAddress?: string
  /** 建立時間 */
  createdAt: string
}

/**
 * 稽核日誌查詢參數
 */
export interface AuditLogQueryParams extends PaginationParams {
  /** 使用者 ID */
  userId?: number
  /** 實體類型 */
  entityType?: string
  /** 動作類型 */
  action?: string
  /** 開始時間 */
  startDate?: string
  /** 結束時間 */
  endDate?: string
}

// ================================
// 報表頁面額外類型
// ================================

/**
 * 銷售報表項目
 */
export interface SalesReportItem {
  /** 日期 */
  date: string
  /** 訂單數 */
  orderCount: number
  /** 銷售額 */
  salesAmount: number
  /** 銷量 */
  quantity: number
  /** 平均客單價 */
  avgOrderAmount: number
  /** 成長率 */
  growth: number
}

/**
 * 利潤報表項目
 */
export interface ProfitReportItem {
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 商品 SKU */
  productSku: string
  /** 銷量 */
  quantity: number
  /** 營收 */
  revenue: number
  /** 成本 */
  cost: number
  /** 利潤 */
  profit: number
  /** 毛利率 */
  profitMargin: number
}

/**
 * 分類利潤
 */
export interface CategoryProfit {
  /** 分類 ID */
  categoryId: number
  /** 分類名稱 */
  categoryName: string
  /** 利潤 */
  profit: number
  /** 毛利率 */
  profitMargin: number
}

/**
 * 系統參數（完整）
 */
export interface SystemParameters {
  // 基本設定
  systemName: string
  companyName: string
  taxId: string
  address: string
  phone: string
  email: string
  // 銷售設定
  defaultTaxRate: number
  priceIncludesTax: boolean
  invoiceType: string
  decimalPlaces: number
  roundingRule: string
  // 會員設定
  pointsPerDollar: number
  pointsRedeemRate: number
  pointsExpiryDays: number
  newMemberPoints: number
  birthdayBonus: number
  // 庫存設定
  lowStockThreshold: number
  allowNegativeStock: boolean
  autoReorderAlert: boolean
  inventoryAdjustApproval: boolean
  // 通知設定
  lowStockNotification: boolean
  newOrderNotification: boolean
  birthdayReminder: boolean
  promotionExpiryReminder: boolean
  notificationEmail: string
}

/**
 * 優惠券使用記錄
 */
export interface CouponUsage {
  /** 記錄 ID */
  id: number
  /** 使用時間 */
  usedAt: string
  /** 訂單編號 */
  orderNo: string
  /** 客戶名稱 */
  customerName: string
  /** 折扣金額 */
  discountAmount: number
}
