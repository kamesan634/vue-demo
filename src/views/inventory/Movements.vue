<!--
  Inventory/Movements.vue - 庫存異動記錄頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">庫存異動記錄</h1>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
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
        <a-form-item label="商品">
          <a-select
            v-model:value="searchForm.productId"
            placeholder="全部"
            style="width: 200px"
            allow-clear
            show-search
            option-filter-prop="label"
            :options="products"
            :field-names="{ label: 'name', value: 'id' }"
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item label="異動類型">
          <a-select
            v-model:value="searchForm.movementType"
            placeholder="全部"
            style="width: 120px"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="PURCHASE_IN">進貨入庫</a-select-option>
            <a-select-option value="SALES_OUT">銷售出庫</a-select-option>
            <a-select-option value="RETURN_IN">退貨入庫</a-select-option>
            <a-select-option value="TRANSFER_IN">調撥入庫</a-select-option>
            <a-select-option value="TRANSFER_OUT">調撥出庫</a-select-option>
            <a-select-option value="ADJUST_IN">盤盈</a-select-option>
            <a-select-option value="ADJUST_OUT">盤虧</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="日期區間">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            :allow-clear="false"
            @change="handleSearch"
          />
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="movements"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'movementType'">
            <a-tag :color="getMovementTypeColor(record.movementType)">{{
              record.movementTypeDescription
            }}</a-tag>
          </template>
          <template v-else-if="column.key === 'quantity'">
            <span :class="record.isInbound ? 'text-success' : 'text-danger'">
              {{ record.quantityChange }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { getInventoryMovements } from '@/api/inventory'
import { getActiveStores } from '@/api/stores'
import { getProducts } from '@/api/products'
import type { InventoryMovement, Store, Product } from '@/types'

const loading = ref(false)
const movements = ref<InventoryMovement[]>([])
const warehouses = ref<Store[]>([])
const products = ref<Product[]>([])

// 搜尋表單（startDate/endDate 為後端必填，預設近 30 天）
const searchForm = reactive({
  warehouseId: undefined as number | undefined,
  productId: undefined as number | undefined,
  movementType: undefined as string | undefined,
  dateRange: [dayjs().subtract(30, 'day'), dayjs()] as [Dayjs, Dayjs],
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
  { title: '異動日期', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '商品編號', dataIndex: 'productCode', key: 'productCode', width: 120 },
  { title: '商品名稱', dataIndex: 'productName', key: 'productName' },
  { title: '倉庫/門市', dataIndex: 'warehouseName', key: 'warehouseName', width: 130 },
  { title: '異動類型', key: 'movementType', width: 100 },
  { title: '異動數量', key: 'quantity', width: 100 },
  { title: '異動後庫存', dataIndex: 'afterQuantity', key: 'afterQuantity', width: 110 },
  { title: '備註', dataIndex: 'remark', key: 'remark', ellipsis: true },
  { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 100 },
]

// 取得異動類型顏色
const getMovementTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    PURCHASE_IN: 'success', // 進貨入庫
    RETURN_IN: 'success', // 退貨入庫
    TRANSFER_IN: 'processing', // 調撥入庫
    ADJUST_IN: 'warning', // 盤盈
    SALES_OUT: 'error', // 銷售出庫
    TRANSFER_OUT: 'processing', // 調撥出庫
    ADJUST_OUT: 'warning', // 盤虧
    DAMAGE_OUT: 'error', // 損耗出庫
  }
  return colors[type] || 'default'
}

// 載入基礎資料
const loadBaseData = async (): Promise<void> => {
  try {
    const [warehousesData, productsData] = await Promise.all([
      getActiveStores(),
      getProducts({ size: 1000 }),
    ])
    warehouses.value = warehousesData
    products.value = productsData.content
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
  }
}

// 載入異動記錄
const loadMovements = async (): Promise<void> => {
  loading.value = true
  try {
    // startDate/endDate 為後端必填參數
    const params: Record<string, unknown> = {
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
      startDate: searchForm.dateRange[0].format('YYYY-MM-DD'),
      endDate: searchForm.dateRange[1].format('YYYY-MM-DD'),
    }
    if (searchForm.warehouseId) params.warehouseId = searchForm.warehouseId
    if (searchForm.productId) params.productId = searchForm.productId
    if (searchForm.movementType) params.movementType = searchForm.movementType

    const response = await getInventoryMovements(params)
    console.log('[Movements API Response]', JSON.stringify(response, null, 2))
    movements.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入異動記錄失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadMovements()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadMovements()
}

onMounted(() => {
  loadBaseData()
  loadMovements()
})
</script>

<style scoped>
.text-success {
  color: #52c41a;
  font-weight: 500;
}

.text-danger {
  color: #ff4d4f;
  font-weight: 500;
}
</style>
