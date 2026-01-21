<!--
  Promotions/Form.vue - 促銷活動表單頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '編輯促銷活動' : '新增促銷活動' }}</h1>
      <div class="page-actions">
        <a-button @click="goBack"><ArrowLeftOutlined /> 返回</a-button>
      </div>
    </div>

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
          <a-card title="基本資訊" class="mb-16">
            <a-form-item label="活動名稱" name="name">
              <a-input v-model:value="formState.name" placeholder="請輸入活動名稱" />
            </a-form-item>
            <a-form-item label="活動描述" name="description">
              <a-textarea
                v-model:value="formState.description"
                :rows="3"
                placeholder="請輸入活動描述"
              />
            </a-form-item>
            <a-form-item label="促銷類型" name="type">
              <a-select v-model:value="formState.type" placeholder="請選擇促銷類型">
                <a-select-option value="DISCOUNT">折扣</a-select-option>
                <a-select-option value="BUY_X_GET_Y">買X送Y</a-select-option>
                <a-select-option value="BUNDLE">組合優惠</a-select-option>
                <a-select-option value="FLASH_SALE">限時特賣</a-select-option>
              </a-select>
            </a-form-item>
          </a-card>

          <a-card title="折扣設定" class="mb-16">
            <a-form-item label="折扣類型" name="discountType">
              <a-radio-group v-model:value="formState.discountType">
                <a-radio value="PERCENTAGE">百分比折扣</a-radio>
                <a-radio value="FIXED">固定金額</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="折扣值" name="discountValue">
              <a-input-number
                v-model:value="formState.discountValue"
                :min="0"
                :max="formState.discountType === 'PERCENTAGE' ? 100 : 999999"
                :precision="formState.discountType === 'PERCENTAGE' ? 0 : 2"
                style="width: 150px"
              />
              <span class="ml-8">{{ formState.discountType === 'PERCENTAGE' ? '%' : '元' }}</span>
            </a-form-item>
            <a-form-item label="最低消費" name="minPurchaseAmount">
              <a-input-number
                v-model:value="formState.minPurchaseAmount"
                :min="0"
                :precision="2"
                style="width: 150px"
              />
              <span class="ml-8">元</span>
            </a-form-item>
            <a-form-item label="最高折抵" name="maxDiscountAmount">
              <a-input-number
                v-model:value="formState.maxDiscountAmount"
                :min="0"
                :precision="2"
                style="width: 150px"
              />
              <span class="ml-8">元（0 表示無上限）</span>
            </a-form-item>
          </a-card>

          <a-card title="活動期間" class="mb-16">
            <a-form-item label="開始日期" name="startDate">
              <a-date-picker
                v-model:value="formState.startDate"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 200px"
              />
            </a-form-item>
            <a-form-item label="結束日期" name="endDate">
              <a-date-picker
                v-model:value="formState.endDate"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 200px"
              />
            </a-form-item>
          </a-card>

          <a-card title="適用範圍" class="mb-16">
            <a-form-item label="適用門市" name="storeIds">
              <a-select
                v-model:value="formState.storeIds"
                mode="multiple"
                placeholder="全部門市"
                :options="stores"
                :field-names="{ label: 'name', value: 'id' }"
              />
            </a-form-item>
            <a-form-item label="適用商品" name="productIds">
              <a-select
                v-model:value="formState.productIds"
                mode="multiple"
                placeholder="全部商品"
                :options="products"
                :field-names="{ label: 'name', value: 'id' }"
                show-search
                option-filter-prop="label"
              />
            </a-form-item>
            <a-form-item label="適用分類" name="categoryIds">
              <a-tree-select
                v-model:value="formState.categoryIds"
                :tree-data="categories"
                :field-names="{ label: 'name', value: 'id', children: 'children' }"
                tree-checkable
                placeholder="全部分類"
                allow-clear
                multiple
              />
            </a-form-item>
          </a-card>

          <a-card title="其他設定" class="mb-16">
            <a-form-item label="優先順序" name="priority">
              <a-input-number v-model:value="formState.priority" :min="0" />
              <span class="ml-8 text-secondary">數字越大優先順序越高</span>
            </a-form-item>
            <a-form-item label="啟用狀態" name="active">
              <a-switch
                v-model:checked="formState.active"
                checked-children="啟用"
                un-checked-children="停用"
              />
            </a-form-item>
          </a-card>

          <div class="form-actions">
            <a-button @click="goBack">取消</a-button>
            <a-button type="primary" html-type="submit" :loading="submitting">{{
              isEdit ? '更新' : '新增'
            }}</a-button>
          </div>
        </a-form>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { getPromotion, createPromotion, updatePromotion } from '@/api/promotions'
import { getActiveStores } from '@/api/stores'
import { getProducts } from '@/api/products'
import { getCategoryTree } from '@/api/categories'
import type { PromotionRequest, Store, Product, Category } from '@/types'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const promotionId = computed(() => Number(route.params.id))

const loading = ref(false)
const submitting = ref(false)
const stores = ref<Store[]>([])
const products = ref<Product[]>([])
const categories = ref<Category[]>([])

// 表單狀態
const formState = reactive<PromotionRequest>({
  name: '',
  description: '',
  type: 'DISCOUNT',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minPurchaseAmount: 0,
  maxDiscountAmount: 0,
  startDate: '',
  endDate: '',
  storeIds: [],
  productIds: [],
  categoryIds: [],
  priority: 0,
  active: true,
})

// 表單驗證規則
const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '請輸入活動名稱', trigger: 'blur' }],
  type: [{ required: true, message: '請選擇促銷類型', trigger: 'change' }],
  discountValue: [{ required: true, message: '請輸入折扣值', trigger: 'blur' }],
  startDate: [{ required: true, message: '請選擇開始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '請選擇結束日期', trigger: 'change' }],
}

// 載入基礎資料
const loadBaseData = async (): Promise<void> => {
  try {
    const [storesData, productsData, categoriesData] = await Promise.all([
      getActiveStores(),
      getProducts({ size: 1000 }),
      getCategoryTree(),
    ])
    stores.value = storesData
    products.value = productsData.content
    categories.value = categoriesData
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
  }
}

// 載入促銷資料
const loadPromotion = async (): Promise<void> => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const promotion = await getPromotion(promotionId.value)
    Object.assign(formState, promotion)
  } catch (error) {
    console.error('載入促銷活動失敗:', error)
    router.push('/promotions/list')
  } finally {
    loading.value = false
  }
}

// 提交表單
const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await updatePromotion(promotionId.value, formState)
      message.success('更新成功')
    } else {
      await createPromotion(formState)
      message.success('新增成功')
    }
    router.push('/promotions/list')
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = (): void => router.push('/promotions/list')

onMounted(() => {
  loadBaseData()
  loadPromotion()
})
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}

.ml-8 {
  margin-left: 8px;
}

.text-secondary {
  color: #8c8c8c;
}
</style>
