<!--
  Units/Index.vue - 單位管理頁面
  顯示單位列表，支援 CRUD 操作
-->
<template>
  <div class="page-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">單位管理</h1>
      <div class="page-actions">
        <a-button type="primary" @click="handleAdd">
          <template #icon><PlusOutlined /></template>
          新增單位
        </a-button>
      </div>
    </div>

    <!-- 表格區域 -->
    <div class="content-area">
      <a-table
        :columns="columns"
        :data-source="units"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <!-- 狀態 -->
          <template v-if="column.key === 'active'">
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
                title="確定要刪除此單位嗎？"
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
      :title="editingUnit ? '編輯單位' : '新增單位'"
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
        <a-form-item label="單位代碼" name="code">
          <a-input
            v-model:value="formState.code"
            placeholder="請輸入單位代碼"
            :disabled="!!editingUnit"
          />
        </a-form-item>
        <a-form-item label="單位名稱" name="name">
          <a-input v-model:value="formState.name" placeholder="請輸入單位名稱" />
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
 * 單位管理頁面組件
 */
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/api/units'
import type { Unit, UnitRequest } from '@/types'

// ================================
// 狀態
// ================================

const loading = ref(false)
const units = ref<Unit[]>([])
const modalVisible = ref(false)
const editingUnit = ref<Unit | null>(null)
const formRef = ref<FormInstance>()

const formState = reactive<UnitRequest>({
  code: '',
  name: '',
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
  { title: '單位代碼', dataIndex: 'code', key: 'code', width: 150 },
  { title: '單位名稱', dataIndex: 'name', key: 'name' },
  { title: '狀態', key: 'active', width: 100 },
  { title: '操作', key: 'actions', width: 150 },
]

// ================================
// 驗證規則
// ================================

const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '請輸入單位代碼', trigger: 'blur' },
    { max: 20, message: '單位代碼長度不能超過 20 個字元', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '請輸入單位名稱', trigger: 'blur' },
    { max: 50, message: '單位名稱長度不能超過 50 個字元', trigger: 'blur' },
  ],
}

// ================================
// 方法
// ================================

const loadUnits = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getUnits({
      page: (pagination.current || 1) - 1,
      size: pagination.pageSize,
    }) // Spring Data 分頁從 0 開始
    units.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入單位列表失敗:', error)
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 20
  loadUnits()
}

const handleAdd = (): void => {
  editingUnit.value = null
  formState.code = ''
  formState.name = ''
  formState.active = true
  modalVisible.value = true
}

const handleEdit = (unit: Record<string, unknown>): void => {
  editingUnit.value = unit as unknown as Unit
  formState.code = unit.code as string
  formState.name = unit.name as string
  formState.active = unit.active as boolean
  modalVisible.value = true
}

const handleSubmit = async (): Promise<void> => {
  try {
    await formRef.value?.validate()

    if (editingUnit.value) {
      await updateUnit(editingUnit.value.id, formState)
      message.success('更新成功')
    } else {
      await createUnit(formState)
      message.success('新增成功')
    }

    modalVisible.value = false
    loadUnits()
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
    await deleteUnit(id)
    message.success('刪除成功')
    loadUnits()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

// ================================
// 生命週期
// ================================

onMounted(() => {
  loadUnits()
})
</script>
