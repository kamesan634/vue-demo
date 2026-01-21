<!--
  Orders/List.vue - 訂單列表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">訂單列表</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate">
          <template #icon><PlusOutlined /></template>
          新增訂單
        </a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-form-item label="訂單編號">
          <a-input
            v-model:value="searchForm.orderNoKeyword"
            placeholder="訂單編號"
            allow-clear
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="狀態">
          <a-select
            v-model:value="searchForm.status"
            placeholder="請選擇"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="PENDING">待處理</a-select-option>
            <a-select-option value="PAID">已付款</a-select-option>
            <a-select-option value="CANCELLED">已取消</a-select-option>
            <a-select-option value="REFUNDED">已退款</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="日期範圍">
          <a-range-picker v-model:value="dateRange" style="width: 250px" />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit"><SearchOutlined /> 搜尋</a-button>
            <a-button @click="resetSearch"><ReloadOutlined /> 重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="orders"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'orderNo'">
            <a-typography-text copyable>{{ record.orderNo }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'totalAmount'">
            <span class="text-primary">NT$ {{ record.totalAmount?.toLocaleString() }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ record.statusDescription }}</a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="goToDetail(record.id)">詳情</a-button>
              <a-popconfirm
                v-if="record.status === 'PENDING'"
                title="確定要取消此訂單嗎？"
                @confirm="handleCancel(record.id)"
              >
                <a-button type="link" size="small" danger>取消</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getOrders, cancelOrder } from '@/api/orders'
import type { Order, OrderStatus } from '@/types'

const router = useRouter()
const loading = ref(false)
const orders = ref<Order[]>([])
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

const searchForm = reactive({
  orderNoKeyword: '',
  status: undefined as OrderStatus | undefined,
})

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 筆`,
})

const columns = [
  { title: '訂單編號', key: 'orderNo', width: 160 },
  { title: '門市', dataIndex: 'storeName', key: 'storeName', width: 120 },
  { title: '客戶', dataIndex: 'customerName', key: 'customerName', width: 100 },
  { title: '訂單日期', dataIndex: 'orderDate', key: 'orderDate', width: 110 },
  { title: '總金額', key: 'totalAmount', width: 120 },
  { title: '狀態', key: 'status', width: 90 },
  { title: '操作', key: 'actions', width: 120 },
]

const loadOrders = async (): Promise<void> => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
      ...searchForm,
    }
    if (dateRange.value) {
      params.startDate = dateRange.value[0].format('YYYY-MM-DD')
      params.endDate = dateRange.value[1].format('YYYY-MM-DD')
    }
    const response = await getOrders(params)
    console.log('[Orders API Response]', JSON.stringify(response, null, 2))
    orders.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入訂單列表失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (): void => {
  pagination.current = 1
  loadOrders()
}

const resetSearch = (): void => {
  searchForm.orderNoKeyword = ''
  searchForm.status = undefined
  dateRange.value = null
  pagination.current = 1
  loadOrders()
}

const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 20
  loadOrders()
}

const goToCreate = (): void => router.push('/orders/create')
const goToDetail = (id: number): void => router.push(`/orders/${id}/detail`)

const handleCancel = async (id: number): Promise<void> => {
  try {
    await cancelOrder(id)
    message.success('訂單已取消')
    loadOrders()
  } catch (error) {
    console.error('取消訂單失敗:', error)
  }
}

const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    PENDING: 'processing',
    PAID: 'success',
    CANCELLED: 'default',
    REFUNDED: 'warning',
  }
  return colors[status] || 'default'
}

onMounted(() => loadOrders())
</script>
