/**
 * 報表 API
 * 處理儀表板和各類報表資料查詢
 */
import { get } from '@/utils/request'
import type { DashboardSummary, ProfitAnalysis, SalesReportParams } from '@/types'

/** 年對年比較資料 */
interface YearOverYearComparison {
  /** 年份 */
  year: number
  /** 月份 */
  month: number
  /** 本期銷售額 */
  currentPeriodSales: number
  /** 去年同期銷售額 */
  previousYearSales: number
  /** 成長金額 */
  growthAmount: number
  /** 成長率 */
  growthRate: number
}

/** 月對月比較資料 */
interface MonthOverMonthComparison {
  /** 年份 */
  year: number
  /** 月份 */
  month: number
  /** 本月銷售額 */
  currentMonthSales: number
  /** 上月銷售額 */
  previousMonthSales: number
  /** 成長金額 */
  growthAmount: number
  /** 成長率 */
  growthRate: number
}

/**
 * 取得儀表板摘要資料
 * @returns 儀表板摘要資料
 */
export const getDashboardSummary = (): Promise<DashboardSummary> => {
  return get<DashboardSummary>('/dashboard/summary')
}

/** 銷售報表回應類型 */
export interface SalesReportResponse {
  /** 每日銷售資料列表 */
  dailySales?: SalesReportItem[]
  /** 分頁內容 */
  content?: SalesReportItem[]
  /** 總筆數 */
  totalElements?: number
  /** 總銷售額 */
  totalSales?: number
  /** 訂單總數 */
  orderCount?: number
  /** 平均客單價 */
  avgOrderAmount?: number
  /** 利潤率 */
  profitMargin?: number
}

/**
 * 取得銷售報表（分頁）
 * @param params - 查詢參數
 * @returns 銷售報表資料
 */
export const getSalesReport = (params: Record<string, unknown>): Promise<SalesReportResponse> => {
  return get<SalesReportResponse>('/reports/sales', params)
}

/** 銷售報表項目 */
export interface SalesReportItem {
  date: string
  orderCount: number
  salesAmount: number
  quantity: number
  avgOrderAmount: number
  growth: number
}

/** 利潤分析回應 */
export interface ProfitAnalysisResponse {
  startDate: string
  endDate: string
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossProfitMargin: number
  orderCount: number
  averageOrderValue: number
  averageOrderProfit: number
  dailyProfits: {
    date: string
    orderCount: number
    revenue: number
    cost: number
    grossProfit: number
    profitMargin: number
  }[]
  categoryProfits: CategoryProfit[]
  topProfitProducts: ProfitReportItem[]
  bottomProfitProducts: ProfitReportItem[]
}

/**
 * 取得利潤分析報表
 * @param params - 查詢參數
 * @returns 利潤分析資料
 */
export const getProfitReport = (
  params: Record<string, unknown>
): Promise<ProfitAnalysisResponse> => {
  return get<ProfitAnalysisResponse>('/reports/profit-analysis', params)
}

/** 利潤報表項目 */
export interface ProfitReportItem {
  productId: number
  productName: string
  productSku: string
  quantity: number
  revenue: number
  cost: number
  profit: number
  profitMargin: number
}

/** 分類利潤 */
export interface CategoryProfit {
  categoryId: number
  categoryName: string
  profit: number
  profitMargin: number
}

/**
 * 取得利潤分析
 * @param params - 查詢參數
 * @returns 利潤分析資料
 */
export const getProfitAnalysis = (params: SalesReportParams): Promise<ProfitAnalysis> => {
  return get<ProfitAnalysis>(
    '/reports/profit-analysis',
    params as unknown as Record<string, unknown>
  )
}

/**
 * 取得年對年比較
 * @param year - 年份
 * @param month - 月份
 * @returns 年對年比較資料
 */
export const getYearOverYearComparison = (
  year: number,
  month: number
): Promise<YearOverYearComparison> => {
  return get<YearOverYearComparison>('/reports/comparison/yoy', { year, month })
}

/**
 * 取得月對月比較
 * @param year - 年份
 * @param month - 月份
 * @returns 月對月比較資料
 */
export const getMonthOverMonthComparison = (
  year: number,
  month: number
): Promise<MonthOverMonthComparison> => {
  return get<MonthOverMonthComparison>('/reports/comparison/mom', { year, month })
}
