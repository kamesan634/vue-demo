<!--
  Inventory/Adjust.vue - 庫存調整頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">庫存調整</h1>
    </div>

    <div class="content-area">
      <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container" @finish="handleSubmit">
        <a-form-item label="倉庫/門市" name="warehouseId">
          <a-select v-model:value="formState.warehouseId" placeholder="請選擇倉庫/門市" :options="warehouses" :field-names="{ label: 'name', value: 'id' }" />
        </a-form-item>
        <a-form-item label="商品" name="productId">
          <a-select v-model:value="formState.productId" placeholder="請選擇商品" :options="products" :field-names="{ label: 'name', value: 'id' }" show-search option-filter-prop="label" @change="handleProductChange" />
        </a-form-item>
        <a-form-item label="目前庫存">
          <a-input-number :value="currentStock" disabled style="width: 150px" />
        </a-form-item>
        <a-form-item label="調整類型" name="adjustmentType">
          <a-radio-group v-model:value="formState.adjustmentType">
            <a-radio value="IN">入庫（增加）</a-radio>
            <a-radio value="OUT">出庫（減少）</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="調整數量" name="quantity">
          <a-input-number v-model:value="formState.quantity" :min="1" placeholder="請輸入數量" style="width: 150px" />
        </a-form-item>
        <a-form-item label="調整後庫存">
          <a-input-number :value="adjustedStock" disabled style="width: 150px" />
        </a-form-item>
        <a-form-item label="原因" name="reason">
          <a-select v-model:value="formState.reason" placeholder="請選擇原因">
            <a-select-option value="盤點調整">盤點調整</a-select-option>
            <a-select-option value="損耗報廢">損耗報廢</a-select-option>
            <a-select-option value="退貨入庫">退貨入庫</a-select-option>
            <a-select-option value="調撥轉移">調撥轉移</a-select-option>
            <a-select-option value="其他">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="備註" name="notes">
          <a-textarea v-model:value="formState.notes" :rows="3" placeholder="請輸入備註說明" />
        </a-form-item>

        <div class="form-actions">
          <a-button @click="resetForm">重置</a-button>
          <a-button type="primary" html-type="submit" :loading="submitting">確認調整</a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, Rule } from 'ant-design-vue/es/form'
import { adjustInventory, getProductInventory } from '@/api/inventory'
import { getActiveStores } from '@/api/stores'
import { getProducts } from '@/api/products'
import type { Store, Product } from '@/types'

const formRef = ref<FormInstance>()
const submitting = ref(false)
const warehouses = ref<Store[]>([])
const products = ref<Product[]>([])
const currentStock = ref<number>(0)

// 表單狀態
const formState = reactive({
  warehouseId: undefined as number | undefined,
  productId: undefined as number | undefined,
  adjustmentType: 'IN' as 'IN' | 'OUT',
  quantity: 1,
  reason: '',
  notes: '',
})

// 表單驗證規則
const rules: Record<string, Rule[]> = {
  warehouseId: [{ required: true, message: '請選擇倉庫/門市', trigger: 'change' }],
  productId: [{ required: true, message: '請選擇商品', trigger: 'change' }],
  quantity: [{ required: true, message: '請輸入調整數量', trigger: 'blur' }],
  reason: [{ required: true, message: '請選擇原因', trigger: 'change' }],
}

// 計算調整後庫存
const adjustedStock = computed(() => {
  if (formState.adjustmentType === 'IN') {
    return currentStock.value + (formState.quantity || 0)
  } else {
    return Math.max(0, currentStock.value - (formState.quantity || 0))
  }
})

// 載入基礎資料
const loadBaseData = async (): Promise<void> => {
  try {
    const [warehousesData, productsData] = await Promise.all([getActiveStores(), getProducts({ size: 1000 })])
    warehouses.value = warehousesData
    products.value = productsData.content
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
  }
}

// 處理商品變更，載入當前庫存
const handleProductChange = async (productId: number): Promise<void> => {
  if (!formState.warehouseId || !productId) {
    currentStock.value = 0
    return
  }
  try {
    const inventory = await getProductInventory(productId, formState.warehouseId)
    currentStock.value = inventory?.quantity || 0
  } catch {
    currentStock.value = 0
  }
}

// 提交表單
const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    await adjustInventory({
      warehouseId: formState.warehouseId!,
      productId: formState.productId!,
      adjustmentType: formState.adjustmentType,
      quantity: formState.quantity,
      reason: formState.reason,
      notes: formState.notes,
    })
    message.success('庫存調整成功')
    resetForm()
  } catch (error) {
    console.error('庫存調整失敗:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表單
const resetForm = (): void => {
  formRef.value?.resetFields()
  currentStock.value = 0
}

onMounted(() => loadBaseData())
</script>
