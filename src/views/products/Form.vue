<!--
  Products/Form.vue - 商品表單頁面
  用於新增和編輯商品
-->
<template>
  <div class="page-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '編輯商品' : '新增商品' }}</h1>
      <div class="page-actions">
        <a-button @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          返回
        </a-button>
      </div>
    </div>

    <!-- 表單區域 -->
    <div class="content-area">
      <a-spin :spinning="loading">
        <a-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 14 }"
          class="form-container"
          @finish="handleSubmit"
        >
          <!-- 基本資訊 -->
          <a-divider orientation="left">基本資訊</a-divider>

          <!-- SKU -->
          <a-form-item label="SKU 貨號" name="sku">
            <a-input
              v-model:value="formState.sku"
              placeholder="請輸入商品貨號"
              :disabled="isEdit"
            />
          </a-form-item>

          <!-- 商品名稱 -->
          <a-form-item label="商品名稱" name="name">
            <a-input v-model:value="formState.name" placeholder="請輸入商品名稱" />
          </a-form-item>

          <!-- 商品描述 -->
          <a-form-item label="商品描述" name="description">
            <a-textarea
              v-model:value="formState.description"
              placeholder="請輸入商品描述"
              :rows="3"
            />
          </a-form-item>

          <!-- 分類 -->
          <a-form-item label="商品分類" name="categoryId">
            <a-tree-select
              v-model:value="formState.categoryId"
              :tree-data="categoryTree"
              placeholder="請選擇分類"
              allow-clear
              tree-default-expand-all
              :field-names="{ children: 'children', label: 'name', value: 'id' }"
            />
          </a-form-item>

          <!-- 單位 -->
          <a-form-item label="計量單位" name="unitId">
            <a-select
              v-model:value="formState.unitId"
              placeholder="請選擇單位"
              :options="units"
              :field-names="{ label: 'name', value: 'id' }"
            />
          </a-form-item>

          <!-- 稅別 -->
          <a-form-item label="稅別" name="taxTypeId">
            <a-select
              v-model:value="formState.taxTypeId"
              placeholder="請選擇稅別"
              :options="taxTypes"
              :field-names="{ label: 'name', value: 'id' }"
            />
          </a-form-item>

          <!-- 價格資訊 -->
          <a-divider orientation="left">價格資訊</a-divider>

          <!-- 成本價 -->
          <a-form-item label="成本價" name="costPrice">
            <a-input-number
              v-model:value="formState.costPrice"
              :min="0"
              :precision="2"
              placeholder="0.00"
              style="width: 200px"
            >
              <template #addonBefore>NT$</template>
            </a-input-number>
          </a-form-item>

          <!-- 售價 -->
          <a-form-item label="售價" name="sellingPrice">
            <a-input-number
              v-model:value="formState.sellingPrice"
              :min="0"
              :precision="2"
              placeholder="0.00"
              style="width: 200px"
            >
              <template #addonBefore>NT$</template>
            </a-input-number>
          </a-form-item>

          <!-- 毛利資訊 -->
          <a-form-item label="毛利資訊">
            <a-space>
              <a-tag color="blue">
                毛利: NT$ {{ grossProfit.toFixed(2) }}
              </a-tag>
              <a-tag :color="grossProfitMargin >= 30 ? 'success' : grossProfitMargin >= 15 ? 'warning' : 'error'">
                毛利率: {{ grossProfitMargin.toFixed(1) }}%
              </a-tag>
            </a-space>
          </a-form-item>

          <!-- 庫存資訊 -->
          <a-divider orientation="left">庫存設定</a-divider>

          <!-- 條碼 -->
          <a-form-item label="主要條碼" name="barcode">
            <a-input v-model:value="formState.barcode" placeholder="請輸入條碼" />
          </a-form-item>

          <!-- 安全庫存 -->
          <a-form-item label="安全庫存量" name="safetyStock">
            <a-input-number
              v-model:value="formState.safetyStock"
              :min="0"
              placeholder="0"
              style="width: 200px"
            />
          </a-form-item>

          <!-- 狀態 -->
          <a-form-item label="狀態" name="active">
            <a-switch v-model:checked="formState.active" checked-children="啟用" un-checked-children="停用" />
          </a-form-item>

          <!-- 按鈕 -->
          <div class="form-actions">
            <a-button @click="goBack">取消</a-button>
            <a-button type="primary" html-type="submit" :loading="submitting">
              {{ isEdit ? '更新' : '新增' }}
            </a-button>
          </div>
        </a-form>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 商品表單頁面組件
 * 用於新增和編輯商品
 */
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { getProduct, createProduct, updateProduct } from '@/api/products'
import { getCategoryTree } from '@/api/categories'
import { getActiveUnits } from '@/api/units'
import { getActiveTaxTypes } from '@/api/taxTypes'
import type { ProductRequest, Category, Unit, TaxType } from '@/types'

// ================================
// Router
// ================================

const router = useRouter()
const route = useRoute()

// ================================
// 狀態
// ================================

/** 是否為編輯模式 */
const isEdit = computed(() => !!route.params.id)

/** 商品 ID */
const productId = computed(() => Number(route.params.id))

/** 載入中狀態 */
const loading = ref(false)

/** 提交中狀態 */
const submitting = ref(false)

/** 表單參照 */
const formRef = ref<FormInstance>()

/** 分類樹 */
const categoryTree = ref<Category[]>([])

/** 單位列表 */
const units = ref<Unit[]>([])

/** 稅別列表 */
const taxTypes = ref<TaxType[]>([])

/** 表單資料 */
const formState = reactive<ProductRequest>({
  sku: '',
  name: '',
  description: '',
  categoryId: undefined,
  unitId: 0,
  taxTypeId: 0,
  costPrice: 0,
  sellingPrice: 0,
  barcode: '',
  safetyStock: 0,
  active: true,
  barcodes: [],
})

// ================================
// 計算屬性
// ================================

/** 毛利 */
const grossProfit = computed(() => {
  return (formState.sellingPrice || 0) - (formState.costPrice || 0)
})

/** 毛利率 */
const grossProfitMargin = computed(() => {
  if (!formState.sellingPrice) return 0
  return (grossProfit.value / formState.sellingPrice) * 100
})

// ================================
// 表單驗證規則
// ================================

const rules: Record<string, Rule[]> = {
  sku: [
    { required: true, message: '請輸入 SKU 貨號', trigger: 'blur' },
    { max: 50, message: 'SKU 長度不能超過 50 個字元', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '請輸入商品名稱', trigger: 'blur' },
    { max: 200, message: '商品名稱長度不能超過 200 個字元', trigger: 'blur' },
  ],
  unitId: [{ required: true, message: '請選擇計量單位', trigger: 'change' }],
  taxTypeId: [{ required: true, message: '請選擇稅別', trigger: 'change' }],
  sellingPrice: [{ required: true, message: '請輸入售價', trigger: 'blur' }],
}

// ================================
// 方法
// ================================

/**
 * 載入基礎資料
 */
const loadBaseData = async (): Promise<void> => {
  try {
    const [categoriesData, unitsData, taxTypesData] = await Promise.all([
      getCategoryTree(),
      getActiveUnits(),
      getActiveTaxTypes(),
    ])

    categoryTree.value = categoriesData
    units.value = unitsData
    taxTypes.value = taxTypesData
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
    message.error('載入基礎資料失敗')
  }
}

/**
 * 載入商品資料（編輯模式）
 */
const loadProduct = async (): Promise<void> => {
  if (!isEdit.value) return

  loading.value = true
  try {
    const product = await getProduct(productId.value)

    // 填充表單
    formState.sku = product.sku
    formState.name = product.name
    formState.description = product.description || ''
    formState.categoryId = product.category?.id
    formState.unitId = product.unit.id
    formState.taxTypeId = product.taxType.id
    formState.costPrice = product.costPrice
    formState.sellingPrice = product.sellingPrice
    formState.barcode = product.barcode || ''
    formState.safetyStock = product.safetyStock
    formState.active = product.active
    formState.barcodes = product.barcodes || []
  } catch (error) {
    console.error('載入商品資料失敗:', error)
    message.error('載入商品資料失敗')
    router.push('/products/list')
  } finally {
    loading.value = false
  }
}

/**
 * 處理表單提交
 */
const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateProduct(productId.value, formState)
      message.success('更新成功')
    } else {
      await createProduct(formState)
      message.success('新增成功')
    }
    router.push('/products/list')
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

/**
 * 返回列表頁
 */
const goBack = (): void => {
  router.push('/products/list')
}

// ================================
// 生命週期
// ================================

onMounted(async () => {
  await loadBaseData()
  await loadProduct()
})
</script>
