<!--
  Products/List.vue - 商品列表頁面
  顯示商品列表，支援搜尋、分頁和 CRUD 操作
-->
<template>
  <div class="page-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">商品列表</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate">
          <template #icon><PlusOutlined /></template>
          新增商品
        </a-button>
      </div>
    </div>

    <!-- 搜尋區域 -->
    <div class="search-area">
      <a-form layout="inline" :model="searchForm" @finish="handleSearch">
        <a-form-item label="關鍵字">
          <a-input
            v-model:value="searchForm.keyword"
            placeholder="商品名稱、SKU、條碼"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="狀態">
          <a-select
            v-model:value="searchForm.activeOnly"
            placeholder="請選擇"
            style="width: 120px"
            allow-clear
          >
            <a-select-option :value="true">啟用</a-select-option>
            <a-select-option :value="false">停用</a-select-option>
          </a-select>
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
        :data-source="products"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <!-- SKU -->
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'sku'">
            <a-typography-text copyable>{{ record.sku }}</a-typography-text>
          </template>

          <!-- 分類 -->
          <template v-else-if="column.key === 'category'">
            <a-tag v-if="record.category" color="blue">
              {{ record.category.name }}
            </a-tag>
            <span v-else class="text-muted">未分類</span>
          </template>

          <!-- 價格 -->
          <template v-else-if="column.key === 'price'">
            <div>
              <div>成本: NT$ {{ record.costPrice?.toLocaleString() || 0 }}</div>
              <div class="text-primary">
                售價: NT$ {{ record.sellingPrice?.toLocaleString() || 0 }}
              </div>
            </div>
          </template>

          <!-- 毛利率 -->
          <template v-else-if="column.key === 'margin'">
            <a-tag :color="getMarginColor(record.grossProfitMargin)">
              {{ record.grossProfitMargin?.toFixed(1) || 0 }}%
            </a-tag>
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
              <a-button type="link" size="small" @click="goToEdit(record.id)">
                <template #icon><EditOutlined /></template>
                編輯
              </a-button>
              <a-popconfirm
                title="確定要刪除此商品嗎？"
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
  </div>
</template>

<script setup lang="ts">
/**
 * 商品列表頁面組件
 * 顯示商品列表，支援搜尋、分頁和 CRUD 操作
 */
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import { getProducts, searchProducts, deleteProduct } from '@/api/products'
import type { Product } from '@/types'

// ================================
// Router
// ================================

const router = useRouter()

// ================================
// 狀態
// ================================

/** 載入中狀態 */
const loading = ref(false)

/** 商品列表 */
const products = ref<Product[]>([])

/** 搜尋表單 */
const searchForm = reactive({
  keyword: '',
  activeOnly: undefined as boolean | undefined,
})

/** 分頁設定 */
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 筆`,
})

// ================================
// 表格欄位定義
// ================================

const columns = [
  { title: 'SKU', key: 'sku', dataIndex: 'sku', width: 150 },
  { title: '商品名稱', dataIndex: 'name', key: 'name', ellipsis: true },
  { title: '分類', key: 'category', width: 120 },
  { title: '單位', dataIndex: ['unit', 'name'], key: 'unit', width: 80 },
  { title: '價格', key: 'price', width: 150 },
  { title: '毛利率', key: 'margin', width: 100 },
  { title: '狀態', key: 'active', width: 80 },
  { title: '操作', key: 'actions', width: 150, fixed: 'right' as const },
]

// ================================
// 方法
// ================================

/**
 * 載入商品列表
 */
const loadProducts = async (): Promise<void> => {
  loading.value = true
  try {
    const params = {
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
      activeOnly: searchForm.activeOnly,
    }

    let response
    if (searchForm.keyword) {
      response = await searchProducts(searchForm.keyword, params)
    } else {
      response = await getProducts(params)
    }

    products.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入商品列表失敗:', error)
    message.error('載入商品列表失敗')
  } finally {
    loading.value = false
  }
}

/**
 * 處理搜尋
 */
const handleSearch = (): void => {
  pagination.current = 1
  loadProducts()
}

/**
 * 重置搜尋
 */
const resetSearch = (): void => {
  searchForm.keyword = ''
  searchForm.activeOnly = undefined
  pagination.current = 1
  loadProducts()
}

/**
 * 處理表格變更（分頁、排序）
 * @param pag - 分頁設定
 */
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 20
  loadProducts()
}

/**
 * 跳轉到新增頁面
 */
const goToCreate = (): void => {
  router.push('/products/create')
}

/**
 * 跳轉到編輯頁面
 * @param id - 商品 ID
 */
const goToEdit = (id: number): void => {
  router.push(`/products/${id}/edit`)
}

/**
 * 處理刪除
 * @param id - 商品 ID
 */
const handleDelete = async (id: number): Promise<void> => {
  try {
    await deleteProduct(id)
    message.success('刪除成功')
    loadProducts()
  } catch (error) {
    console.error('刪除商品失敗:', error)
  }
}

/**
 * 取得毛利率顏色
 * @param margin - 毛利率
 * @returns 顏色字串
 */
const getMarginColor = (margin: number): string => {
  if (margin >= 30) return 'success'
  if (margin >= 15) return 'warning'
  return 'error'
}

// ================================
// 生命週期
// ================================

onMounted(() => {
  loadProducts()
})
</script>
