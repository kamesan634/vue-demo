<!--
  Stores/List.vue - 門市/倉庫列表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">門市/倉庫列表</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate"><PlusOutlined /> 新增</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="類型">
          <a-select
            v-model:value="searchForm.type"
            placeholder="全部"
            style="width: 120px"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="STORE">門市</a-select-option>
            <a-select-option value="WAREHOUSE">倉庫</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="stores"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === 'STORE' ? 'blue' : 'green'">{{ record.typeName }}</a-tag>
          </template>
          <template v-else-if="column.key === 'main'">
            <a-tag v-if="record.main" color="gold">主要</a-tag>
          </template>
          <template v-else-if="column.key === 'active'">
            <a-tag :color="record.active ? 'success' : 'default'">{{
              record.active ? '啟用' : '停用'
            }}</a-tag>
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
import { getStores, deleteStore } from '@/api/stores'
import type { Store, StoreType } from '@/types'

const router = useRouter()
const loading = ref(false)
const stores = ref<Store[]>([])
const searchForm = reactive({ type: undefined as StoreType | undefined })

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 筆`,
})

const columns = [
  { title: '代碼', dataIndex: 'code', key: 'code', width: 100 },
  { title: '名稱', dataIndex: 'name', key: 'name' },
  { title: '類型', key: 'type', width: 80 },
  { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
  { title: '電話', dataIndex: 'phone', key: 'phone', width: 130 },
  { title: '主要', key: 'main', width: 70 },
  { title: '狀態', key: 'active', width: 80 },
  { title: '操作', key: 'actions', width: 120 },
]

const loadStores = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getStores({
      page: (pagination.current || 1) - 1,
      size: pagination.pageSize,
      type: searchForm.type,
    }) // Spring Data 分頁從 0 開始
    stores.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入列表失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (): void => {
  pagination.current = 1
  loadStores()
}

const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadStores()
}

const goToCreate = (): void => router.push('/stores/create')
const goToEdit = (id: number): void => router.push(`/stores/${id}/edit`)

const handleDelete = async (id: number): Promise<void> => {
  try {
    await deleteStore(id)
    message.success('刪除成功')
    loadStores()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

onMounted(() => loadStores())
</script>
