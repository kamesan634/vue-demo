<!--
  Reports/Sales.vue - 銷售報表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">銷售報表</h1>
      <div class="page-actions">
        <a-button type="primary" @click="exportReport"><DownloadOutlined /> 匯出報表</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="日期區間">
          <a-range-picker v-model:value="searchForm.dateRange" format="YYYY-MM-DD" @change="handleSearch" />
        </a-form-item>
        <a-form-item label="門市">
          <a-select v-model:value="searchForm.storeId" placeholder="全部" style="width: 150px" allow-clear :options="stores" :field-names="{ label: 'name', value: 'id' }" @change="handleSearch" />
        </a-form-item>
        <a-form-item label="報表類型">
          <a-select v-model:value="searchForm.groupBy" style="width: 120px" @change="handleSearch">
            <a-select-option value="day">按日</a-select-option>
            <a-select-option value="week">按週</a-select-option>
            <a-select-option value="month">按月</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <!-- 統計摘要 -->
      <a-row :gutter="16" class="mb-16">
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="總銷售額" :value="summary.totalSales" prefix="NT$" :precision="0" :value-style="{ color: '#3f8600' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="訂單數" :value="summary.totalOrders" :value-style="{ color: '#1890ff' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="平均客單價" :value="summary.avgOrderAmount" prefix="NT$" :precision="0" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="毛利率" :value="reportSummary.profitMargin || 0" suffix="%" :value-style="{ color: '#722ed1' }" />
          </a-card>
        </a-col>
      </a-row>

      <!-- 銷售趨勢圖 -->
      <a-card title="銷售趨勢" class="mb-16">
        <v-chart class="chart" :option="salesChartOption" autoresize />
      </a-card>

      <!-- 銷售明細 -->
      <a-card title="銷售明細">
        <a-table :columns="columns" :data-source="salesData" :loading="loading" :pagination="pagination" row-key="date" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'sales'">
              NT$ {{ record.sales?.toLocaleString() }}
            </template>
            <template v-else-if="column.key === 'refunds'">
              NT$ {{ record.refunds?.toLocaleString() }}
            </template>
            <template v-else-if="column.key === 'netSales'">
              NT$ {{ record.netSales?.toLocaleString() }}
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { getSalesReport } from '@/api/reports'
import { getActiveStores } from '@/api/stores'
import type { Store, SalesReportItem } from '@/types'

const loading = ref(false)
const stores = ref<Store[]>([])
const salesData = ref<SalesReportItem[]>([])
const reportSummary = ref({
  totalSales: 0,
  totalOrders: 0,
  avgOrderAmount: 0,
  profitMargin: 0,
})

// 搜尋表單
const searchForm = reactive({
  dateRange: [dayjs().subtract(30, 'day'), dayjs()] as [Dayjs, Dayjs],
  storeId: undefined as number | undefined,
  groupBy: 'day' as 'day' | 'week' | 'month',
})

// 分頁配置
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 筆`,
})

// 表格欄位（根據後端 dailySales 欄位調整）
const columns = [
  { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
  { title: '訂單數', dataIndex: 'orderCount', key: 'orderCount', width: 100 },
  { title: '銷售額', key: 'sales', width: 150 },
  { title: '退款數', dataIndex: 'refundCount', key: 'refundCount', width: 100 },
  { title: '退款額', key: 'refunds', width: 120 },
  { title: '淨銷售額', key: 'netSales', width: 150 },
]

// 統計摘要（直接使用後端計算好的值）
const summary = computed(() => reportSummary.value)

// 銷售趨勢圖配置
const salesChartOption = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
  },
  legend: {
    data: ['銷售額', '訂單數'],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: (salesData.value || []).map((item) => item.date),
  },
  yAxis: [
    {
      type: 'value',
      name: '銷售額',
      axisLabel: { formatter: (val: number) => `${(val / 1000).toFixed(0)}K` },
    },
    {
      type: 'value',
      name: '訂單數',
      splitLine: { show: false },
    },
  ],
  series: [
    {
      name: '銷售額',
      type: 'line',
      smooth: true,
      areaStyle: { opacity: 0.3 },
      data: (salesData.value || []).map((item) => item.sales),
    },
    {
      name: '訂單數',
      type: 'bar',
      yAxisIndex: 1,
      data: (salesData.value || []).map((item) => item.orderCount),
    },
  ],
}))

// 載入門市列表
const loadStores = async (): Promise<void> => {
  try {
    stores.value = await getActiveStores()
  } catch (error) {
    console.error('載入門市列表失敗:', error)
  }
}

// 載入銷售報表
const loadSalesReport = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getSalesReport({
      startDate: searchForm.dateRange[0].format('YYYY-MM-DD'),
      endDate: searchForm.dateRange[1].format('YYYY-MM-DD'),
      storeId: searchForm.storeId,
      groupBy: searchForm.groupBy,
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
    })
    console.log('[Sales Report API Response]', JSON.stringify(response, null, 2))
    // 後端回傳的是單一物件，每日資料在 dailySales 中
    salesData.value = response.dailySales || []
    // 儲存統計摘要（後端已計算好）
    reportSummary.value = {
      totalSales: response.totalSales || 0,
      totalOrders: response.orderCount || 0,
      avgOrderAmount: response.avgOrderAmount || 0,
      profitMargin: response.profitMargin || 0,
    }
    pagination.total = response.dailySales?.length || 0
  } catch (error) {
    console.error('載入銷售報表失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadSalesReport()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadSalesReport()
}

// 匯出報表
const exportReport = (): void => {
  message.info('正在準備匯出報表...')
  // 實際專案中會呼叫 API 下載報表
}

onMounted(() => {
  loadStores()
  loadSalesReport()
})
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}

.chart {
  height: 350px;
}

.text-success {
  color: #52c41a;
}

.text-danger {
  color: #ff4d4f;
}
</style>
