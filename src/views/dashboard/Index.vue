<!--
  Dashboard/Index.vue - 儀表板頁面
  顯示系統概覽、銷售統計和圖表
-->
<template>
  <div class="dashboard-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">儀表板</h1>
      <div class="page-actions">
        <a-button @click="refreshData">
          <template #icon><ReloadOutlined /></template>
          刷新數據
        </a-button>
      </div>
    </div>

    <!-- 載入中狀態 -->
    <a-spin :spinning="loading">
      <!-- 統計卡片 -->
      <a-row :gutter="[16, 16]">
        <!-- 今日銷售額 -->
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="今日銷售額"
              :value="summary.todaySales"
              :precision="0"
              prefix="NT$"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>
                <span class="stat-trend up">
                  <ArrowUpOutlined />
                  {{ summary.salesGrowthRate }}%
                </span>
              </template>
            </a-statistic>
            <div class="stat-footer">較昨日</div>
          </a-card>
        </a-col>

        <!-- 今日訂單數 -->
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="今日訂單數"
              :value="summary.todayOrderCount"
              :value-style="{ color: '#52c41a' }"
            >
              <template #suffix>筆</template>
            </a-statistic>
            <div class="stat-footer">本月累計 {{ summary.monthOrderCount }} 筆</div>
          </a-card>
        </a-col>

        <!-- 低庫存商品 -->
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="低庫存商品"
              :value="summary.lowStockProducts"
              :value-style="{ color: summary.lowStockProducts > 0 ? '#faad14' : '#52c41a' }"
            >
              <template #suffix>項</template>
            </a-statistic>
            <div class="stat-footer">
              <a-button type="link" size="small" @click="goToLowStock">查看詳情</a-button>
            </div>
          </a-card>
        </a-col>

        <!-- 總客戶數 -->
        <a-col :xs="24" :sm="12" :lg="6">
          <a-card class="stat-card">
            <a-statistic
              title="總客戶數"
              :value="summary.totalCustomers"
              :value-style="{ color: '#722ed1' }"
            >
              <template #suffix>人</template>
            </a-statistic>
            <div class="stat-footer">本月新增 {{ summary.newCustomersThisMonth }} 人</div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 圖表區域 -->
      <a-row :gutter="[16, 16]" class="mt-16">
        <!-- 銷售趨勢圖 -->
        <a-col :xs="24" :lg="16">
          <a-card title="銷售趨勢（近7日）">
            <div class="chart-container">
              <v-chart class="chart" :option="salesChartOption" autoresize />
            </div>
          </a-card>
        </a-col>

        <!-- 分類銷售佔比 -->
        <a-col :xs="24" :lg="8">
          <a-card title="分類銷售佔比">
            <div class="chart-container">
              <v-chart class="chart" :option="categoryChartOption" autoresize />
            </div>
          </a-card>
        </a-col>
      </a-row>

      <!-- 熱銷商品和快捷操作 -->
      <a-row :gutter="[16, 16]" class="mt-16">
        <!-- 熱銷商品排行 -->
        <a-col :xs="24" :lg="12">
          <a-card title="熱銷商品 TOP 5">
            <a-table
              :columns="topProductColumns"
              :data-source="summary.topProducts"
              :pagination="false"
              size="small"
              row-key="productId"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'rank'">
                  <a-tag :color="getRankColor(index + 1)">{{ index + 1 }}</a-tag>
                </template>
                <template v-else-if="column.key === 'sales'">
                  NT$ {{ formatNumber(record.sales) }}
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <!-- 快捷操作 -->
        <a-col :xs="24" :lg="12">
          <a-card title="快捷操作">
            <a-row :gutter="[16, 16]">
              <a-col :span="8">
                <a-button type="primary" block @click="goTo('/orders/create')">
                  <template #icon><PlusOutlined /></template>
                  新增訂單
                </a-button>
              </a-col>
              <a-col :span="8">
                <a-button block @click="goTo('/products/create')">
                  <template #icon><PlusOutlined /></template>
                  新增商品
                </a-button>
              </a-col>
              <a-col :span="8">
                <a-button block @click="goTo('/customers/create')">
                  <template #icon><PlusOutlined /></template>
                  新增客戶
                </a-button>
              </a-col>
              <a-col :span="8">
                <a-button block @click="goTo('/inventory/adjust')">
                  <template #icon><SwapOutlined /></template>
                  庫存調整
                </a-button>
              </a-col>
              <a-col :span="8">
                <a-button block @click="goTo('/reports/sales')">
                  <template #icon><BarChartOutlined /></template>
                  銷售報表
                </a-button>
              </a-col>
              <a-col :span="8">
                <a-button block @click="goTo('/promotions/create')">
                  <template #icon><GiftOutlined /></template>
                  新增促銷
                </a-button>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
/**
 * 儀表板頁面組件
 * 顯示系統概覽、銷售統計和圖表
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  ArrowUpOutlined,
  PlusOutlined,
  SwapOutlined,
  BarChartOutlined,
  GiftOutlined,
} from '@ant-design/icons-vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { getDashboardSummary } from '@/api/reports'
import type { DashboardSummary } from '@/types'

// 註冊 ECharts 組件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// ================================
// Router
// ================================

const router = useRouter()

// ================================
// 狀態
// ================================

/** 載入中狀態 */
const loading = ref(false)

/** 儀表板摘要資料 */
const summary = ref<DashboardSummary>({
  todaySales: 0,
  monthSales: 0,
  yearSales: 0,
  todayOrderCount: 0,
  monthOrderCount: 0,
  salesGrowthRate: 0,
  totalProducts: 0,
  lowStockProducts: 0,
  outOfStockProducts: 0,
  inventoryValue: 0,
  pendingPurchaseOrders: 0,
  monthPurchaseAmount: 0,
  totalCustomers: 0,
  newCustomersThisMonth: 0,
  salesChart: [],
  categorySales: [],
  topProducts: [],
})

// ================================
// 表格欄位定義
// ================================

const topProductColumns = [
  { title: '排名', key: 'rank', width: 60 },
  { title: '商品名稱', dataIndex: 'productName', key: 'productName' },
  { title: '銷售數量', dataIndex: 'quantity', key: 'quantity', width: 100 },
  { title: '銷售金額', key: 'sales', width: 120 },
]

// ================================
// 計算屬性 - 圖表配置
// ================================

/** 銷售趨勢圖配置 */
const salesChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: { name: string; value: number; seriesName: string }[]) => {
      const date = params[0].name
      let html = `<div style="font-weight:bold;margin-bottom:8px">${date}</div>`
      params.forEach((param) => {
        const value =
          param.seriesName === '銷售額' ? `NT$ ${formatNumber(param.value)}` : param.value
        html += `<div>${param.seriesName}: ${value}</div>`
      })
      return html
    },
  },
  legend: {
    data: ['銷售額', '訂單數'],
    bottom: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: summary.value.salesChart.map((item) => item.date.slice(5)), // 只顯示月-日
  },
  yAxis: [
    {
      type: 'value',
      name: '銷售額',
      position: 'left',
      axisLabel: {
        formatter: (value: number) => `${(value / 1000).toFixed(0)}K`,
      },
    },
    {
      type: 'value',
      name: '訂單數',
      position: 'right',
    },
  ],
  series: [
    {
      name: '銷售額',
      type: 'line',
      smooth: true,
      data: summary.value.salesChart.map((item) => item.sales),
      itemStyle: { color: '#1890ff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
          ],
        },
      },
    },
    {
      name: '訂單數',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: summary.value.salesChart.map((item) => item.orderCount),
      itemStyle: { color: '#52c41a' },
    },
  ],
}))

/** 分類銷售佔比圖配置 */
const categoryChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: NT$ {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    top: 'middle',
  },
  series: [
    {
      name: '分類銷售',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['65%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontWeight: 'bold',
        },
      },
      data: summary.value.categorySales.map((item) => ({
        value: item.sales,
        name: item.categoryName,
      })),
    },
  ],
}))

// ================================
// 方法
// ================================

/**
 * 載入儀表板資料
 */
const loadData = async (): Promise<void> => {
  loading.value = true
  try {
    summary.value = await getDashboardSummary()
  } catch (error) {
    console.error('載入儀表板資料失敗:', error)
    // 使用預設資料供展示
    summary.value = {
      todaySales: 125000,
      monthSales: 3250000,
      yearSales: 15000000,
      todayOrderCount: 85,
      monthOrderCount: 2100,
      salesGrowthRate: 15.5,
      totalProducts: 500,
      lowStockProducts: 12,
      outOfStockProducts: 3,
      inventoryValue: 2500000,
      pendingPurchaseOrders: 5,
      monthPurchaseAmount: 800000,
      totalCustomers: 1500,
      newCustomersThisMonth: 45,
      salesChart: [
        { date: '2024-01-14', sales: 115000, orderCount: 75 },
        { date: '2024-01-15', sales: 125000, orderCount: 85 },
        { date: '2024-01-16', sales: 98000, orderCount: 68 },
        { date: '2024-01-17', sales: 142000, orderCount: 92 },
        { date: '2024-01-18', sales: 108000, orderCount: 72 },
        { date: '2024-01-19', sales: 156000, orderCount: 105 },
        { date: '2024-01-20', sales: 125000, orderCount: 85 },
      ],
      categorySales: [
        { categoryId: 1, categoryName: '飲料', sales: 50000, percentage: 40 },
        { categoryId: 2, categoryName: '零食', sales: 30000, percentage: 24 },
        { categoryId: 3, categoryName: '3C產品', sales: 25000, percentage: 20 },
        { categoryId: 4, categoryName: '日用品', sales: 20000, percentage: 16 },
      ],
      topProducts: [
        { productId: 1, productName: '咖啡豆 250g', quantity: 150, sales: 37500 },
        { productId: 2, productName: 'iPhone 15 保護殼', quantity: 120, sales: 23880 },
        { productId: 3, productName: '礦泉水 (24入)', quantity: 100, sales: 15000 },
        { productId: 4, productName: '巧克力餅乾', quantity: 95, sales: 9500 },
        { productId: 5, productName: 'USB 充電線', quantity: 80, sales: 7920 },
      ],
    }
  } finally {
    loading.value = false
  }
}

/**
 * 刷新資料
 */
const refreshData = async (): Promise<void> => {
  await loadData()
  message.success('資料已刷新')
}

/**
 * 跳轉到指定頁面
 * @param path - 路徑
 */
const goTo = (path: string): void => {
  router.push(path)
}

/**
 * 跳轉到低庫存頁面
 */
const goToLowStock = (): void => {
  router.push('/inventory/low-stock')
}

/**
 * 取得排名顏色
 * @param rank - 排名
 * @returns 顏色字串
 */
const getRankColor = (rank: number): string => {
  const colors: Record<number, string> = {
    1: 'gold',
    2: 'silver',
    3: 'orange',
  }
  return colors[rank] || 'default'
}

/**
 * 格式化數字（加入千分位）
 * @param num - 數字
 * @returns 格式化後的字串
 */
const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-TW')
}

// ================================
// 生命週期
// ================================

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
/* 儀表板容器 */
.dashboard-container {
  padding: 0;
}

/* 統計卡片 */
.stat-card {
  .stat-trend {
    font-size: 12px;
    margin-left: 8px;

    &.up {
      color: #52c41a;
    }

    &.down {
      color: #f5222d;
    }
  }

  .stat-footer {
    margin-top: 8px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }
}

/* 圖表容器 */
.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}
</style>
