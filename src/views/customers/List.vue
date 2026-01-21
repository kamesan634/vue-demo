<!--
  Customers/List.vue - 客戶列表頁面
  顯示客戶列表，支援搜尋、分頁和 CRUD 操作
-->
<template>
  <div class="page-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">客戶列表</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate">
          <template #icon><PlusOutlined /></template>
          新增客戶
        </a-button>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-form-item label="關鍵字">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="姓名、電話、會員編號"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit">
              <template #icon><SearchOutlined /></template>
              搜尋
            </a-button>
            <a-button @click="resetSearch">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格區域 -->
    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="customers"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 會員編號 -->
          <template v-if="column.key === 'memberNo'">
            <a-typography-text copyable>{{ record.memberNo }}</a-typography-text>
          </template>

          <!-- 會員等級 -->
          <template v-else-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level?.code)">
              {{ record.level?.name || '一般' }}
            </a-tag>
          </template>

          <!-- 累計消費 -->
          <template v-else-if="column.key === 'totalSpent'">
            NT$ {{ record.totalSpent?.toLocaleString() || 0 }}
          </template>

          <!-- 狀態 -->
          <template v-else-if="column.key === 'active'">
            <a-tag :color="record.active ? 'success' : 'default'">
              {{ record.active ? '啟用' : '停用' }}
            </a-tag>
          </template>

          <!-- 操作 -->
          <template v-else-if="column.key === 'actions'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="goToDetail(record.id)"> 詳情 </a-button>
              <a-button type="link" size="small" @click="goToEdit(record.id)"> 編輯 </a-button>
              <a-popconfirm title="確定要刪除此客戶嗎？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger> 刪除 </a-button>
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
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getCustomers, searchCustomers, deleteCustomer } from '@/api/customers'
import type { Customer } from '@/types'

const router = useRouter()
const loading = ref(false)
const customers = ref<Customer[]>([])
const searchForm = reactive({ keyword: '' })

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 筆`,
})

const columns = [
  { title: '會員編號', key: 'memberNo', width: 150 },
  { title: '姓名', dataIndex: 'name', key: 'name', width: 120 },
  { title: '電話', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '等級', key: 'level', width: 100 },
  { title: '點數', dataIndex: 'totalPoints', key: 'totalPoints', width: 100 },
  { title: '累計消費', key: 'totalSpent', width: 130 },
  { title: '狀態', key: 'active', width: 80 },
  { title: '操作', key: 'actions', width: 180 },
]

const loadCustomers = async (): Promise<void> => {
  loading.value = true
  try {
    let response
    const pageParam = (pagination.current || 1) - 1 // Spring Data 分頁從 0 開始
    if (searchForm.keyword) {
      response = await searchCustomers(searchForm.keyword, {
        page: pageParam,
        size: pagination.pageSize,
      })
    } else {
      response = await getCustomers({ page: pageParam, size: pagination.pageSize })
    }
    customers.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入客戶列表失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (): void => {
  pagination.current = 1
  loadCustomers()
}

const resetSearch = (): void => {
  searchForm.keyword = ''
  pagination.current = 1
  loadCustomers()
}

const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 20
  loadCustomers()
}

const goToCreate = (): void => router.push('/customers/create')
const goToDetail = (id: number): void => router.push(`/customers/${id}/detail`)
const goToEdit = (id: number): void => router.push(`/customers/${id}/edit`)

const handleDelete = async (id: number): Promise<void> => {
  try {
    await deleteCustomer(id)
    message.success('刪除成功')
    loadCustomers()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

const getLevelColor = (code: string): string => {
  const colors: Record<string, string> = { VIP: 'gold', GOLD: 'orange', SILVER: 'default' }
  return colors[code] || 'blue'
}

onMounted(() => loadCustomers())
</script>
