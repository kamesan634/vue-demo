<!--
  Inventory/LowStock.vue - 低庫存警示頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">低庫存警示</h1>
      <div class="page-actions">
        <a-button type="primary" @click="exportReport"><DownloadOutlined /> 匯出報表</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="低庫存閾值">
          <a-input-number
            v-model:value="searchForm.threshold"
            :min="1"
            :max="1000"
            style="width: 100px"
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item label="倉庫/門市">
          <a-select
            v-model:value="searchForm.warehouseId"
            placeholder="全部"
            style="width: 150px"
            allow-clear
            :options="warehouses"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleSearch"
          />
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <!-- 統計卡片 -->
      <a-row :gutter="16" class="mb-16">
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic
              title="嚴重缺貨"
              :value="criticalCount"
              :value-style="{ color: '#cf1322' }"
            >
              <template #suffix>項</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic title="庫存警告" :value="warningCount" :value-style="{ color: '#faad14' }">
              <template #suffix>項</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic
              title="零庫存商品"
              :value="zeroStockCount"
              :value-style="{ color: '#595959' }"
            >
              <template #suffix>項</template>
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="12" :md="6">
          <a-card>
            <a-statistic
              title="需補貨總數"
              :value="totalReorderQuantity"
              :value-style="{ color: '#1890ff' }"
            >
              <template #suffix>件</template>
            </a-statistic>
          </a-card>
        </a-col>
      </a-row>

      <!-- 低庫存列表 -->
      <a-table
        :columns="columns"
        :data-source="lowStockItems"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'alertLevel'">
            <a-tag :color="record.quantity <= 10 ? 'error' : 'warning'">
              {{ record.quantity <= 10 ? '嚴重' : '警告' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'quantity'">
            <span
              :class="
                record.quantity === 0
                  ? 'zero-stock'
                  : record.quantity <= 10
                    ? 'critical-stock'
                    : 'warning-stock'
              "
            >
              {{ record.quantity }}
            </span>
          </template>
          <template v-else-if="column.key === 'reorderQuantity'">
            <span class="reorder-quantity">{{ record.safetyStock - record.quantity }}</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-button type="link" size="small" @click="goToAdjust(record)">補貨調整</a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import { getLowStockItems } from '@/api/inventory'
import { getActiveStores } from '@/api/stores'
import type { Inventory, Store } from '@/types'

const router = useRouter()
const loading = ref(false)
const lowStockItems = ref<Inventory[]>([])
const warehouses = ref<Store[]>([])

// 搜尋表單（threshold 為後端必填，預設 50）
const searchForm = reactive({
  threshold: 50,
  warehouseId: undefined as number | undefined,
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
  { title: '警示程度', key: 'alertLevel', width: 100 },
  { title: '商品編號', dataIndex: 'productCode', key: 'productCode', width: 120 },
  { title: '商品名稱', dataIndex: 'productName', key: 'productName' },
  { title: '倉庫/門市', dataIndex: 'warehouseName', key: 'warehouseName', width: 130 },
  { title: '目前庫存', key: 'quantity', width: 100 },
  { title: '安全庫存', dataIndex: 'safetyStock', key: 'safetyStock', width: 100 },
  { title: '建議補貨量', key: 'reorderQuantity', width: 110 },
  { title: '操作', key: 'actions', width: 100 },
]

// 統計數據
const criticalCount = computed(
  () => lowStockItems.value.filter((item) => item.quantity <= 10).length
)
const warningCount = computed(
  () => lowStockItems.value.filter((item) => item.quantity > 10 && item.quantity <= 50).length
)
const zeroStockCount = computed(
  () => lowStockItems.value.filter((item) => item.quantity === 0).length
)
const totalReorderQuantity = computed(() =>
  lowStockItems.value.reduce(
    (sum, item) => sum + Math.max(0, (item.safetyStock || 50) - item.quantity),
    0
  )
)

// 載入倉庫列表
const loadWarehouses = async (): Promise<void> => {
  try {
    warehouses.value = await getActiveStores()
  } catch (error) {
    console.error('載入倉庫列表失敗:', error)
  }
}

// 載入低庫存商品
const loadLowStockItems = async (): Promise<void> => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      threshold: searchForm.threshold, // 必填參數
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
    }
    if (searchForm.warehouseId) params.warehouseId = searchForm.warehouseId

    const response = await getLowStockItems(params)
    console.log('[LowStock API Response]', JSON.stringify(response, null, 2))
    lowStockItems.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入低庫存商品失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadLowStockItems()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadLowStockItems()
}

// 前往庫存調整
const goToAdjust = (record: Record<string, unknown>): void => {
  router.push({
    path: '/inventory/adjust',
    query: { warehouseId: String(record.warehouseId), productId: String(record.productId) },
  })
}

// 匯出報表
const exportReport = (): void => {
  message.info('正在準備匯出報表...')
  // 實際專案中會呼叫 API 下載報表
}

onMounted(() => {
  loadWarehouses()
  loadLowStockItems()
})
</script>

<style scoped>
.zero-stock {
  color: #595959;
  font-weight: bold;
}

.critical-stock {
  color: #cf1322;
  font-weight: bold;
}

.warning-stock {
  color: #faad14;
  font-weight: bold;
}

.reorder-quantity {
  color: #1890ff;
  font-weight: 500;
}

.mb-16 {
  margin-bottom: 16px;
}
</style>
