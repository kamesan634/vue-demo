<!--
  Inventory/List.vue - 庫存查詢頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">庫存查詢</h1>
    </div>

    <div class="content-area">
      <a-table :columns="columns" :data-source="inventory" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'quantity'">
            <a-tag :color="record.availableQuantity <= 10 ? 'error' : record.availableQuantity <= 50 ? 'warning' : 'success'">
              {{ record.quantity }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'available'">
            {{ record.availableQuantity }} (預留: {{ record.reservedQuantity }})
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { getAllInventory } from '@/api/inventory'
import type { Inventory } from '@/types'

const loading = ref(false)
const inventory = ref<Inventory[]>([])

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 筆`,
})

const columns = [
  { title: '商品編號', dataIndex: 'productCode', key: 'productCode', width: 130 },
  { title: '商品名稱', dataIndex: 'productName', key: 'productName' },
  { title: '倉庫/門市', dataIndex: 'warehouseName', key: 'warehouseName', width: 130 },
  { title: '庫存數量', key: 'quantity', width: 100 },
  { title: '可用數量', key: 'available', width: 150 },
  { title: '最後異動', dataIndex: 'lastMovementDate', key: 'lastMovementDate', width: 160 },
]

const loadInventory = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getAllInventory({ page: (pagination.current || 1) - 1, size: pagination.pageSize }) // Spring Data 分頁從 0 開始
    console.log('[Inventory API Response]', JSON.stringify(response, null, 2))
    inventory.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入庫存失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadInventory()
}

onMounted(() => loadInventory())
</script>
