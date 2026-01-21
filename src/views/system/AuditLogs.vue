<!--
  System/AuditLogs.vue - 稽核日誌頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">稽核日誌</h1>
      <div class="page-actions">
        <a-button type="primary" @click="exportLogs"><DownloadOutlined /> 匯出日誌</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="操作類型">
          <a-select
            v-model:value="searchForm.action"
            placeholder="全部"
            style="width: 120px"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="CREATE">新增</a-select-option>
            <a-select-option value="UPDATE">修改</a-select-option>
            <a-select-option value="DELETE">刪除</a-select-option>
            <a-select-option value="LOGIN">登入</a-select-option>
            <a-select-option value="LOGOUT">登出</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="資源類型">
          <a-select
            v-model:value="searchForm.entityType"
            placeholder="全部"
            style="width: 120px"
            allow-clear
            @change="handleSearch"
          >
            <a-select-option value="PRODUCT">商品</a-select-option>
            <a-select-option value="ORDER">訂單</a-select-option>
            <a-select-option value="CUSTOMER">客戶</a-select-option>
            <a-select-option value="INVENTORY">庫存</a-select-option>
            <a-select-option value="USER">使用者</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作人員">
          <a-input
            v-model:value="searchForm.username"
            placeholder="輸入使用者名稱"
            allow-clear
            style="width: 150px"
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="日期區間">
          <a-range-picker
            v-model:value="searchForm.dateRange"
            format="YYYY-MM-DD"
            @change="handleSearch"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 搜尋</a-button>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="logs"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-tag :color="getActionColor(record.action)">{{ record.actionName }}</a-tag>
          </template>
          <template v-else-if="column.key === 'entityType'">
            <a-tag>{{ record.entityTypeName }}</a-tag>
          </template>
          <template v-else-if="column.key === 'changes'">
            <a-button
              v-if="record.oldValue || record.newValue"
              type="link"
              size="small"
              @click="showChanges(record)"
            >
              查看變更
            </a-button>
            <span v-else class="text-secondary">-</span>
          </template>
          <template v-else-if="column.key === 'ipAddress'">
            <a-typography-text copyable :content="record.ipAddress">{{
              record.ipAddress
            }}</a-typography-text>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 變更詳情 Modal -->
    <a-modal v-model:open="changesModalVisible" title="變更詳情" :footer="null" width="800px">
      <a-row :gutter="16">
        <a-col :span="12">
          <h4>修改前</h4>
          <pre class="json-view">{{ formatJson(selectedLog?.oldValue) }}</pre>
        </a-col>
        <a-col :span="12">
          <h4>修改後</h4>
          <pre class="json-view">{{ formatJson(selectedLog?.newValue) }}</pre>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'
import { getAuditLogs } from '@/api/system'
import type { AuditLog } from '@/types'

const loading = ref(false)
const logs = ref<AuditLog[]>([])

// 搜尋表單
const searchForm = reactive({
  action: undefined as string | undefined,
  entityType: undefined as string | undefined,
  username: '',
  dateRange: undefined as [Dayjs, Dayjs] | undefined,
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
  { title: '時間', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
  { title: '操作類型', key: 'action', width: 100 },
  { title: '資源類型', key: 'entityType', width: 100 },
  { title: '資源 ID', dataIndex: 'entityId', key: 'entityId', width: 100 },
  { title: '操作描述', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '操作人員', dataIndex: 'username', key: 'username', width: 120 },
  { title: 'IP 位址', key: 'ipAddress', width: 140 },
  { title: '變更', key: 'changes', width: 100 },
]

// 變更詳情
const changesModalVisible = ref(false)
const selectedLog = ref<AuditLog | null>(null)

// 取得操作類型顏色
const getActionColor = (action: string): string => {
  const colors: Record<string, string> = {
    CREATE: 'success',
    UPDATE: 'processing',
    DELETE: 'error',
    LOGIN: 'blue',
    LOGOUT: 'default',
  }
  return colors[action] || 'default'
}

// 格式化 JSON
const formatJson = (value: string | null | undefined): string => {
  if (!value) return '-'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

// 載入稽核日誌
const loadLogs = async (): Promise<void> => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
    }
    if (searchForm.action) params.action = searchForm.action
    if (searchForm.entityType) params.entityType = searchForm.entityType
    if (searchForm.username) params.username = searchForm.username
    if (searchForm.dateRange) {
      params.startDate = searchForm.dateRange[0].format('YYYY-MM-DD')
      params.endDate = searchForm.dateRange[1].format('YYYY-MM-DD')
    }

    const response = await getAuditLogs(params)
    logs.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入稽核日誌失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadLogs()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadLogs()
}

// 顯示變更詳情
const showChanges = (log: AuditLog): void => {
  selectedLog.value = log
  changesModalVisible.value = true
}

// 匯出日誌
const exportLogs = (): void => {
  message.info('正在準備匯出日誌...')
}

onMounted(() => loadLogs())
</script>

<style scoped>
.text-secondary {
  color: #8c8c8c;
}

.json-view {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  max-height: 400px;
  overflow: auto;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
