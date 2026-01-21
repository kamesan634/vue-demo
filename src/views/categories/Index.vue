<!--
  Categories/Index.vue - 分類管理頁面
  顯示分類樹狀結構，支援 CRUD 操作
-->
<template>
  <div class="page-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">分類管理</h1>
      <div class="page-actions">
        <a-button type="primary" @click="handleAdd(null)">
          <template #icon><PlusOutlined /></template>
          新增分類
        </a-button>
      </div>
    </div>

    <!-- 內容區域 -->
    <div class="content-area">
      <a-row :gutter="16">
        <!-- 分類樹 -->
        <a-col :xs="24" :md="10">
          <a-card title="分類結構" :loading="loading">
            <a-tree
              v-if="categoryTree.length > 0"
              :tree-data="categoryTree"
              :field-names="{ children: 'children', title: 'name', key: 'id' }"
              default-expand-all
              show-line
              @select="handleSelect"
            >
              <template #title="{ name, active }">
                <span>
                  {{ name }}
                  <a-tag v-if="!active" color="default" size="small" class="ml-8">停用</a-tag>
                </span>
              </template>
            </a-tree>
            <a-empty v-else description="暫無分類資料" />
          </a-card>
        </a-col>

        <!-- 分類詳情/表單 -->
        <a-col :xs="24" :md="14">
          <a-card
            :title="formMode === 'edit' ? '編輯分類' : formMode === 'add' ? '新增分類' : '分類詳情'"
          >
            <a-form
              v-if="formMode !== 'view'"
              ref="formRef"
              :model="formState"
              :rules="rules"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 16 }"
              @finish="handleSubmit"
            >
              <!-- 分類代碼 -->
              <a-form-item label="分類代碼" name="code">
                <a-input v-model:value="formState.code" placeholder="請輸入分類代碼" />
              </a-form-item>

              <!-- 分類名稱 -->
              <a-form-item label="分類名稱" name="name">
                <a-input v-model:value="formState.name" placeholder="請輸入分類名稱" />
              </a-form-item>

              <!-- 父分類 -->
              <a-form-item label="父分類" name="parentId">
                <a-tree-select
                  v-model:value="formState.parentId"
                  :tree-data="categoryTree"
                  placeholder="選擇父分類（可選）"
                  allow-clear
                  tree-default-expand-all
                  :field-names="{ children: 'children', label: 'name', value: 'id' }"
                />
              </a-form-item>

              <!-- 描述 -->
              <a-form-item label="描述" name="description">
                <a-textarea
                  v-model:value="formState.description"
                  placeholder="請輸入描述"
                  :rows="3"
                />
              </a-form-item>

              <!-- 排序 -->
              <a-form-item label="排序" name="sortOrder">
                <a-input-number v-model:value="formState.sortOrder" :min="0" placeholder="0" />
              </a-form-item>

              <!-- 狀態 -->
              <a-form-item label="狀態" name="active">
                <a-switch
                  v-model:checked="formState.active"
                  checked-children="啟用"
                  un-checked-children="停用"
                />
              </a-form-item>

              <!-- 按鈕 -->
              <a-form-item :wrapper-col="{ offset: 6, span: 16 }">
                <a-space>
                  <a-button @click="cancelForm">取消</a-button>
                  <a-button type="primary" html-type="submit" :loading="submitting">
                    {{ formMode === 'edit' ? '更新' : '新增' }}
                  </a-button>
                </a-space>
              </a-form-item>
            </a-form>

            <!-- 詳情顯示 -->
            <template v-else>
              <a-descriptions v-if="selectedCategory" :column="1">
                <a-descriptions-item label="分類代碼">{{
                  selectedCategory.code
                }}</a-descriptions-item>
                <a-descriptions-item label="分類名稱">{{
                  selectedCategory.name
                }}</a-descriptions-item>
                <a-descriptions-item label="描述">{{
                  selectedCategory.description || '-'
                }}</a-descriptions-item>
                <a-descriptions-item label="排序">{{
                  selectedCategory.sortOrder
                }}</a-descriptions-item>
                <a-descriptions-item label="狀態">
                  <a-tag :color="selectedCategory.active ? 'success' : 'default'">
                    {{ selectedCategory.active ? '啟用' : '停用' }}
                  </a-tag>
                </a-descriptions-item>
              </a-descriptions>
              <a-empty v-else description="請選擇分類查看詳情" />

              <!-- 操作按鈕 -->
              <div v-if="selectedCategory" class="mt-16">
                <a-space>
                  <a-button type="primary" @click="handleAdd(selectedCategory.id)">
                    <template #icon><PlusOutlined /></template>
                    新增子分類
                  </a-button>
                  <a-button @click="handleEdit">
                    <template #icon><EditOutlined /></template>
                    編輯
                  </a-button>
                  <a-popconfirm
                    title="確定要刪除此分類嗎？"
                    ok-text="確定"
                    cancel-text="取消"
                    @confirm="handleDelete"
                  >
                    <a-button danger>
                      <template #icon><DeleteOutlined /></template>
                      刪除
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </div>
            </template>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 分類管理頁面組件
 * 顯示分類樹狀結構，支援 CRUD 操作
 */
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import {
  getCategoryTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/api/categories'
import type { Category, CategoryRequest } from '@/types'

// ================================
// 狀態
// ================================

/** 載入中狀態 */
const loading = ref(false)

/** 提交中狀態 */
const submitting = ref(false)

/** 分類樹 */
const categoryTree = ref<Category[]>([])

/** 選中的分類 */
const selectedCategory = ref<Category | null>(null)

/** 表單模式：view | add | edit */
const formMode = ref<'view' | 'add' | 'edit'>('view')

/** 表單參照 */
const formRef = ref<FormInstance>()

/** 表單資料 */
const formState = reactive<CategoryRequest>({
  code: '',
  name: '',
  description: '',
  parentId: undefined,
  sortOrder: 0,
  active: true,
})

// ================================
// 表單驗證規則
// ================================

const rules: Record<string, Rule[]> = {
  code: [
    { required: true, message: '請輸入分類代碼', trigger: 'blur' },
    { max: 20, message: '分類代碼長度不能超過 20 個字元', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '請輸入分類名稱', trigger: 'blur' },
    { max: 100, message: '分類名稱長度不能超過 100 個字元', trigger: 'blur' },
  ],
}

// ================================
// 方法
// ================================

/**
 * 載入分類樹
 */
const loadCategoryTree = async (): Promise<void> => {
  loading.value = true
  try {
    categoryTree.value = await getCategoryTree(true)
  } catch (error) {
    console.error('載入分類樹失敗:', error)
    message.error('載入分類樹失敗')
  } finally {
    loading.value = false
  }
}

/**
 * 處理選擇分類
 * @param selectedKeys - 選中的鍵值
 */
const handleSelect = async (selectedKeys: number[]): Promise<void> => {
  if (selectedKeys.length === 0) return

  formMode.value = 'view'
  try {
    selectedCategory.value = await getCategory(selectedKeys[0])
  } catch (error) {
    console.error('載入分類詳情失敗:', error)
  }
}

/**
 * 處理新增分類
 * @param parentId - 父分類 ID
 */
const handleAdd = (parentId: number | null): void => {
  formMode.value = 'add'
  selectedCategory.value = null
  formRef.value?.resetFields()
  formState.code = ''
  formState.name = ''
  formState.description = ''
  formState.parentId = parentId || undefined
  formState.sortOrder = 0
  formState.active = true
}

/**
 * 處理編輯分類
 */
const handleEdit = (): void => {
  if (!selectedCategory.value) return

  formMode.value = 'edit'
  formState.code = selectedCategory.value.code
  formState.name = selectedCategory.value.name
  formState.description = selectedCategory.value.description || ''
  formState.parentId = selectedCategory.value.parentId
  formState.sortOrder = selectedCategory.value.sortOrder
  formState.active = selectedCategory.value.active
}

/**
 * 處理表單提交
 */
const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    if (formMode.value === 'add') {
      await createCategory(formState)
      message.success('新增成功')
    } else if (formMode.value === 'edit' && selectedCategory.value) {
      await updateCategory(selectedCategory.value.id, formState)
      message.success('更新成功')
    }

    await loadCategoryTree()
    formMode.value = 'view'
    selectedCategory.value = null
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 取消表單
 */
const cancelForm = (): void => {
  formMode.value = 'view'
  formRef.value?.resetFields()
}

/**
 * 處理刪除分類
 */
const handleDelete = async (): Promise<void> => {
  if (!selectedCategory.value) return

  try {
    await deleteCategory(selectedCategory.value.id)
    message.success('刪除成功')
    await loadCategoryTree()
    selectedCategory.value = null
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

// ================================
// 生命週期
// ================================

onMounted(() => {
  loadCategoryTree()
})
</script>
