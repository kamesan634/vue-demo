<!--
  Promotions/List.vue - 促銷活動列表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">促銷活動管理</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate"><PlusOutlined /> 新增</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="促銷類型">
          <a-select v-model:value="searchForm.type" placeholder="全部" style="width: 140px" allow-clear @change="handleSearch">
            <a-select-option value="DISCOUNT">折扣</a-select-option>
            <a-select-option value="BUY_X_GET_Y">買X送Y</a-select-option>
            <a-select-option value="BUNDLE">組合優惠</a-select-option>
            <a-select-option value="FLASH_SALE">限時特賣</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="狀態">
          <a-select v-model:value="searchForm.status" placeholder="全部" style="width: 100px" allow-clear @change="handleSearch">
            <a-select-option value="ACTIVE">進行中</a-select-option>
            <a-select-option value="SCHEDULED">未開始</a-select-option>
            <a-select-option value="ENDED">已結束</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table :columns="columns" :data-source="promotions" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">{{ record.typeDescription }}</a-tag>
          </template>
          <template v-else-if="column.key === 'period'">
            <div>{{ formatDate(record.startDate) }}</div>
            <div class="text-secondary">~ {{ formatDate(record.endDate) }}</div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record)">{{ getStatusText(record) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="goToEdit(record.id)">編輯</a-button>
              <a-popconfirm title="確定要刪除嗎？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>刪除</a-button>
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
import { PlusOutlined } from '@ant-design/icons-vue'
import { getPromotions, deletePromotion } from '@/api/promotions'
import type { Promotion } from '@/types'

const router = useRouter()
const loading = ref(false)
const promotions = ref<Promotion[]>([])

// 搜尋表單
const searchForm = reactive({
  type: undefined as string | undefined,
  status: undefined as string | undefined,
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
  { title: '名稱', dataIndex: 'name', key: 'name' },
  { title: '類型', key: 'type', width: 120 },
  { title: '活動期間', key: 'period', width: 180 },
  { title: '折扣值', dataIndex: 'discountValue', key: 'discountValue', width: 100 },
  { title: '狀態', key: 'status', width: 100 },
  { title: '操作', key: 'actions', width: 120 },
]

// 取得類型顏色
const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    DISCOUNT: 'blue',
    BUY_X_GET_Y: 'green',
    BUNDLE: 'purple',
    FLASH_SALE: 'orange',
  }
  return colors[type] || 'default'
}

// 取得狀態顏色
const getStatusColor = (record: Promotion): string => {
  if (record.ongoing) return 'success'
  if (record.upcoming) return 'processing'
  if (record.expired) return 'default'
  return 'default'
}

// 取得狀態文字
const getStatusText = (record: Promotion): string => {
  if (record.ongoing) return '進行中'
  if (record.upcoming) return '即將開始'
  if (record.expired) return '已結束'
  return '未知'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10) // 只取 YYYY-MM-DD
}

// 載入促銷列表
const loadPromotions = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getPromotions({
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
      type: searchForm.type,
      status: searchForm.status,
    })
    console.log('[Promotions API Response]', JSON.stringify(response, null, 2))
    promotions.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入促銷活動失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadPromotions()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadPromotions()
}

// 頁面跳轉
const goToCreate = (): void => router.push('/promotions/create')
const goToEdit = (id: number): void => router.push(`/promotions/${id}/edit`)

// 處理刪除
const handleDelete = async (id: number): Promise<void> => {
  try {
    await deletePromotion(id)
    message.success('刪除成功')
    loadPromotions()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

onMounted(() => loadPromotions())
</script>

<style scoped>
.text-secondary {
  color: #8c8c8c;
  font-size: 12px;
}
</style>
