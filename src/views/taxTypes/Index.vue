<!--
  TaxTypes/Index.vue - 稅別管理頁面
  顯示稅別列表，支援 CRUD 操作
-->
<template>
  <div class="page-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">稅別管理</h1>
      <div class="page-actions">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增稅別
        </a-button>
      </div>
    </div>

    <!-- 表格區域 -->
    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="taxTypes"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 稅率 -->
          <template v-if="column.key === 'rate'"> {{ record.rate }}% </template>

          <!-- 預設 -->
          <template v-else-if="column.key === 'isDefault'">
            <a-tag v-if="record.isDefault" color="blue">預設</a-tag>
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
              <a-button type="link" size="small" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                編輯
              </a-button>
              <a-popconfirm
                title="確定要刪除此稅別嗎？"
                ok-text="確定"
                cancel-text="取消"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="link" size="small" danger>
                  <template #icon><DeleteOutlined /></template>
                  刪除
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 新增/編輯彈窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="editingTaxType ? '編輯稅別' : '新增稅別'"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="稅別代碼" name="code">
          <a-input
            v-model:value="formState.code"
            placeholder="請輸入稅別代碼"
            :disabled="!!editingTaxType"
          />
        </a-form-item>
        <a-form-item label="稅別名稱" name="name">
          <a-input v-model:value="formState.name" placeholder="請輸入稅別名稱" />
        </a-form-item>
        <a-form-item label="稅率 (%)" name="rate">
          <a-input-number
            v-model:value="formState.rate"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="5.00"
            style="width: 150px"
          />
        </a-form-item>
        <a-form-item label="設為預設" name="isDefault">
          <a-switch v-model:checked="formState.isDefault" />
        </a-form-item>
        <a-form-item label="狀態" name="active">
          <a-switch
            v-model:checked="formState.active"
            checked-children="啟用"
            un-checked-children="停用"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
/**
 * 稅別管理頁面組件
 */
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getTaxTypes, createTaxType, updateTaxType, deleteTaxType } from '@/api/taxTypes'
import type { TaxType, TaxTypeRequest } from '@/types'

// ================================
// 狀態
// ================================

const loading = ref(false)
const taxTypes = ref<TaxType[]>([])
const modalVisible = ref(false)
const editingTaxType = ref<TaxType | null>(null)
const formRef = ref<FormInstance>()

const formState = reactive<TaxTypeRequest>({
  code: '',
  name: '',
  rate: 5,
  isDefault: false,
  active: true,
})

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total) => `共 ${total} 筆`,
})

// ================================
// 表格欄位
// ================================

const columns = [
  { title: '稅別代碼', dataIndex: 'code', key: 'code', width: 120 },
  { title: '稅別名稱', dataIndex: 'name', key: 'name' },
  { title: '稅率', key: 'rate', width: 100 },
  { title: '預設', key: 'isDefault', width: 80 },
  { title: '狀態', key: 'active', width: 80 },
  { title: '操作', key: 'actions', width: 150 },
]

// ================================
// 驗證規則
// ================================

const rules: Record<string, Rule[]> = {
  code: [{ required: true, message: '請輸入稅別代碼', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入稅別名稱', trigger: 'blur' }],
  rate: [{ required: true, message: '請輸入稅率', trigger: 'blur' }],
}

// ================================
// 方法
// ================================

const loadTaxTypes = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getTaxTypes({
      page: (pagination.current || 1) - 1,
      size: pagination.pageSize,
    }) // Spring Data 分頁從 0 開始
    taxTypes.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入稅別列表失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 20
  loadTaxTypes()
}

const handleAdd = (): void => {
  editingTaxType.value = null
  formState.code = ''
  formState.name = ''
  formState.rate = 5
  formState.isDefault = false
  formState.active = true
  modalVisible.value = true
}

const handleEdit = (taxType: TaxType): void => {
  editingTaxType.value = taxType
  formState.code = taxType.code
  formState.name = taxType.name
  formState.rate = taxType.rate
  formState.isDefault = taxType.isDefault
  formState.active = taxType.active
  modalVisible.value = true
}

const handleSubmit = async (): Promise<void> => {
  try {
    await formRef.value?.validate()

    if (editingTaxType.value) {
      await updateTaxType(editingTaxType.value.id, formState)
      message.success('更新成功')
    } else {
      await createTaxType(formState)
      message.success('新增成功')
    }

    modalVisible.value = false
    loadTaxTypes()
  } catch (error) {
    console.error('提交失敗:', error)
  }
}

const handleCancel = (): void => {
  modalVisible.value = false
  formRef.value?.resetFields()
}

const handleDelete = async (id: number): Promise<void> => {
  try {
    await deleteTaxType(id)
    message.success('刪除成功')
    loadTaxTypes()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

// ================================
// 生命週期
// ================================

onMounted(() => {
  loadTaxTypes()
})
</script>
