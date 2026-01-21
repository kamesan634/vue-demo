<!--
  Suppliers/List.vue - 供應商列表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">供應商管理</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate"><PlusOutlined /> 新增</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="關鍵字">
          <a-input v-model:value="searchForm.keyword" placeholder="名稱/代碼/聯絡人" allow-clear style="width: 200px" @press-enter="handleSearch" />
        </a-form-item>
        <a-form-item label="狀態">
          <a-select v-model:value="searchForm.active" placeholder="全部" style="width: 100px" allow-clear @change="handleSearch">
            <a-select-option :value="true">啟用</a-select-option>
            <a-select-option :value="false">停用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 搜尋</a-button>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table :columns="columns" :data-source="suppliers" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'contact'">
            <div>{{ record.contactPerson }}</div>
            <div class="text-secondary">{{ record.phone }}</div>
          </template>
          <template v-else-if="column.key === 'paymentTerms'">
            <a-tag>{{ record.paymentTerms || '-' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'active'">
            <a-tag :color="record.isActive ? 'success' : 'default'">{{ record.isActive ? '啟用' : '停用' }}</a-tag>
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
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { getSuppliers, deleteSupplier } from '@/api/suppliers'
import type { Supplier } from '@/types'

const router = useRouter()
const loading = ref(false)
const suppliers = ref<Supplier[]>([])

// 搜尋表單
const searchForm = reactive({
  keyword: '',
  active: undefined as boolean | undefined,
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
  { title: '代碼', dataIndex: 'code', key: 'code', width: 100 },
  { title: '名稱', dataIndex: 'name', key: 'name' },
  { title: '聯絡人', key: 'contact', width: 150 },
  { title: 'Email', dataIndex: 'email', key: 'email', width: 180, ellipsis: true },
  { title: '付款條件', key: 'paymentTerms', width: 120 },
  { title: '狀態', key: 'active', width: 80 },
  { title: '操作', key: 'actions', width: 120 },
]

// 載入供應商列表
const loadSuppliers = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getSuppliers({
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      active: searchForm.active,
    })
    console.log('[Suppliers API Response]', JSON.stringify(response, null, 2))
    suppliers.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入供應商失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadSuppliers()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadSuppliers()
}

// 頁面跳轉
const goToCreate = (): void => router.push('/suppliers/create')
const goToEdit = (id: number): void => router.push(`/suppliers/${id}/edit`)

// 處理刪除
const handleDelete = async (id: number): Promise<void> => {
  try {
    await deleteSupplier(id)
    message.success('刪除成功')
    loadSuppliers()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

onMounted(() => loadSuppliers())
</script>

<style scoped>
.text-secondary {
  color: #8c8c8c;
  font-size: 12px;
}
</style>
