<!--
  Reports/Profit.vue - 利潤報表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">利潤報表</h1>
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
        <a-form-item label="分類">
          <a-tree-select v-model:value="searchForm.categoryId" :tree-data="categories" :field-names="{ label: 'name', value: 'id', children: 'children' }" placeholder="全部" allow-clear style="width: 200px" @change="handleSearch" />
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <!-- 統計摘要 -->
      <a-row :gutter="16" class="mb-16">
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="總銷售額" :value="summary.totalRevenue" prefix="NT$" :precision="0" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="總成本" :value="summary.totalCost" prefix="NT$" :precision="0" :value-style="{ color: '#cf1322' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="毛利" :value="summary.totalProfit" prefix="NT$" :precision="0" :value-style="{ color: '#3f8600' }" />
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="毛利率" :value="summary.profitMargin" suffix="%" :precision="1" :value-style="{ color: summary.profitMargin >= 30 ? '#3f8600' : '#faad14' }" />
          </a-card>
        </a-col>
      </a-row>

      <!-- 利潤分析圖 -->
      <a-row :gutter="16" class="mb-16">
        <a-col :xs="24" :lg="12">
          <a-card title="利潤趨勢">
            <v-chart class="chart" :option="profitTrendChartOption" autoresize />
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-card title="分類利潤佔比">
            <v-chart class="chart" :option="categoryProfitChartOption" autoresize />
          </a-card>
        </a-col>
      </a-row>

      <!-- 商品利潤排行 -->
      <a-card title="商品利潤排行">
        <a-table :columns="columns" :data-source="profitData" :loading="loading" :pagination="pagination" row-key="productId" @change="handleTableChange">
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'revenue'">
              NT$ {{ record.revenue?.toLocaleString() }}
            </template>
            <template v-else-if="column.key === 'cost'">
              NT$ {{ record.cost?.toLocaleString() }}
            </template>
            <template v-else-if="column.key === 'profit'">
              <span :class="record.profit >= 0 ? 'text-success' : 'text-danger'">
                NT$ {{ record.profit?.toLocaleString() }}
              </span>
            </template>
            <template v-else-if="column.key === 'profitMargin'">
              <a-progress :percent="record.profitMargin" :stroke-color="getProfitMarginColor(record.profitMargin)" size="small" style="width: 100px" />
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
import { getProfitReport } from '@/api/reports'
import { getActiveStores } from '@/api/stores'
import { getCategoryTree } from '@/api/categories'
import type { Store, Category, ProfitReportItem, CategoryProfit } from '@/types'

const loading = ref(false)
const stores = ref<Store[]>([])
const categories = ref<Category[]>([])
const profitData = ref<ProfitReportItem[]>([])
const categoryProfitData = ref<CategoryProfit[]>([])
const reportSummary = ref({
  totalRevenue: 0,
  totalCost: 0,
  totalProfit: 0,
  profitMargin: 0,
})

// 搜尋表單
const searchForm = reactive({
  dateRange: [dayjs().subtract(30, 'day'), dayjs()] as [Dayjs, Dayjs],
  storeId: undefined as number | undefined,
  categoryId: undefined as number | undefined,
})

// 分頁配置
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 筆`,
})

// 表格欄位
const columns = [
  { title: '商品名稱', dataIndex: 'productName', key: 'productName' },
  { title: 'SKU', dataIndex: 'productSku', key: 'productSku', width: 120 },
  { title: '銷量', dataIndex: 'quantity', key: 'quantity', width: 80 },
  { title: '營收', key: 'revenue', width: 130 },
  { title: '成本', key: 'cost', width: 130 },
  { title: '利潤', key: 'profit', width: 130 },
  { title: '毛利率', key: 'profitMargin', width: 150 },
]

// 統計摘要（直接使用後端計算好的值）
const summary = computed(() => reportSummary.value)

// 利潤趨勢圖配置
const profitTrendChartOption = computed<EChartsOption>(() => {
  const data = profitData.value || []
  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['營收', '成本', '利潤'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.slice(0, 10).map((item) => item.productName?.substring(0, 8) || ''),
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (val: number) => `${(val / 1000).toFixed(0)}K` },
    },
    series: [
      {
        name: '營收',
        type: 'bar',
        stack: 'total',
        emphasis: { focus: 'series' },
        data: data.slice(0, 10).map((item) => item.revenue),
      },
      {
        name: '成本',
        type: 'bar',
        stack: 'cost',
        emphasis: { focus: 'series' },
        data: data.slice(0, 10).map((item) => item.cost),
      },
      {
        name: '利潤',
        type: 'line',
        emphasis: { focus: 'series' },
        data: data.slice(0, 10).map((item) => item.profit),
      },
    ],
  }
})

// 分類利潤佔比圖
const categoryProfitChartOption = computed<EChartsOption>(() => {
  const data = categoryProfitData.value || []
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: NT$ {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: '分類利潤',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        labelLine: { show: false },
        data: data.map((item) => ({
          value: item.profit,
          name: item.categoryName,
        })),
      },
    ],
  }
})

// 取得毛利率顏色
const getProfitMarginColor = (margin: number): string => {
  if (margin >= 40) return '#52c41a'
  if (margin >= 25) return '#1890ff'
  if (margin >= 10) return '#faad14'
  return '#ff4d4f'
}

// 載入基礎資料
const loadBaseData = async (): Promise<void> => {
  try {
    const [storesData, categoriesData] = await Promise.all([getActiveStores(), getCategoryTree()])
    stores.value = storesData
    categories.value = categoriesData
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
  }
}

// 載入利潤報表
const loadProfitReport = async (): Promise<void> => {
  loading.value = true
  try {
    const params = {
      startDate: searchForm.dateRange[0].format('YYYY-MM-DD'),
      endDate: searchForm.dateRange[1].format('YYYY-MM-DD'),
      storeId: searchForm.storeId,
    }
    const response = await getProfitReport(params)
    console.log('[Profit Report API Response]', JSON.stringify(response, null, 2))
    // 從 profit-analysis 回應中取得資料
    profitData.value = response.topProfitProducts || []
    categoryProfitData.value = response.categoryProfits || []
    pagination.total = response.topProfitProducts?.length || 0
    // 更新統計摘要
    reportSummary.value = {
      totalRevenue: response.totalRevenue || 0,
      totalCost: response.totalCost || 0,
      totalProfit: response.grossProfit || 0,
      profitMargin: response.grossProfitMargin || 0,
    }
  } catch (error) {
    console.error('載入利潤報表失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadProfitReport()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadProfitReport()
}

// 匯出報表
const exportReport = (): void => {
  message.info('正在準備匯出報表...')
}

onMounted(() => {
  loadBaseData()
  loadProfitReport()
})
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}

.chart {
  height: 300px;
}

.text-success {
  color: #52c41a;
}

.text-danger {
  color: #ff4d4f;
}
</style>
