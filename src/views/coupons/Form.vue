<!--
  Coupons/Form.vue - 優惠券表單頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '編輯優惠券' : '新增優惠券' }}</h1>
      <div class="page-actions">
        <a-button @click="goBack"><ArrowLeftOutlined /> 返回</a-button>
      </div>
    </div>

    <div class="content-area">
      <a-spin :spinning="loading">
        <a-form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container" @finish="handleSubmit">
          <a-card title="基本資訊" class="mb-16">
            <a-form-item label="優惠券代碼" name="code">
              <a-input v-model:value="formState.code" placeholder="請輸入優惠券代碼" :disabled="isEdit" style="width: 200px" />
              <a-button v-if="!isEdit" type="link" @click="generateCode">自動產生</a-button>
            </a-form-item>
            <a-form-item label="名稱" name="name">
              <a-input v-model:value="formState.name" placeholder="請輸入優惠券名稱" />
            </a-form-item>
            <a-form-item label="描述" name="description">
              <a-textarea v-model:value="formState.description" :rows="3" placeholder="請輸入優惠券描述" />
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
              <a-input-number v-model:value="formState.discountValue" :min="0" :max="formState.discountType === 'PERCENTAGE' ? 100 : 999999" :precision="formState.discountType === 'PERCENTAGE' ? 0 : 2" style="width: 150px" />
              <span class="ml-8">{{ formState.discountType === 'PERCENTAGE' ? '%' : '元' }}</span>
            </a-form-item>
            <a-form-item label="最低消費" name="minPurchaseAmount">
              <a-input-number v-model:value="formState.minPurchaseAmount" :min="0" :precision="2" style="width: 150px" />
              <span class="ml-8">元</span>
            </a-form-item>
            <a-form-item label="最高折抵" name="maxDiscountAmount">
              <a-input-number v-model:value="formState.maxDiscountAmount" :min="0" :precision="2" style="width: 150px" />
              <span class="ml-8">元（0 表示無上限）</span>
            </a-form-item>
          </a-card>

          <a-card title="使用限制" class="mb-16">
            <a-form-item label="發行數量" name="totalCount">
              <a-input-number v-model:value="formState.totalCount" :min="1" style="width: 150px" />
              <span class="ml-8">張</span>
            </a-form-item>
            <a-form-item label="每人限用" name="perCustomerLimit">
              <a-input-number v-model:value="formState.perCustomerLimit" :min="0" style="width: 150px" />
              <span class="ml-8">次（0 表示不限）</span>
            </a-form-item>
            <a-form-item label="有效期間" name="dateRange" :rules="[{ required: true, message: '請選擇有效期間' }]">
              <a-range-picker v-model:value="formState.dateRange" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </a-form-item>
          </a-card>

          <a-card title="適用範圍" class="mb-16">
            <a-form-item label="適用門市" name="storeIds">
              <a-select v-model:value="formState.storeIds" mode="multiple" placeholder="全部門市" :options="stores" :field-names="{ label: 'name', value: 'id' }" />
            </a-form-item>
            <a-form-item label="適用商品" name="productIds">
              <a-select v-model:value="formState.productIds" mode="multiple" placeholder="全部商品" :options="products" :field-names="{ label: 'name', value: 'id' }" show-search option-filter-prop="label" />
            </a-form-item>
          </a-card>

          <a-card title="其他設定" class="mb-16">
            <a-form-item label="可與促銷併用" name="stackable">
              <a-switch v-model:checked="formState.stackable" />
            </a-form-item>
            <a-form-item label="啟用狀態" name="active">
              <a-switch v-model:checked="formState.active" checked-children="啟用" un-checked-children="停用" />
            </a-form-item>
          </a-card>

          <div class="form-actions">
            <a-button @click="goBack">取消</a-button>
            <a-button type="primary" html-type="submit" :loading="submitting">{{ isEdit ? '更新' : '新增' }}</a-button>
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
import type { Dayjs } from 'dayjs'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { getCoupon, createCoupon, updateCoupon } from '@/api/coupons'
import { getActiveStores } from '@/api/stores'
import { getProducts } from '@/api/products'
import type { CouponRequest, Store, Product } from '@/types'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const couponId = computed(() => Number(route.params.id))

const loading = ref(false)
const submitting = ref(false)
const stores = ref<Store[]>([])
const products = ref<Product[]>([])

// 表單狀態
const formState = reactive<CouponRequest & { dateRange?: [Dayjs | string, Dayjs | string] }>({
  code: '',
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  minPurchaseAmount: 0,
  maxDiscountAmount: 0,
  totalCount: 100,
  perCustomerLimit: 1,
  startDate: '',
  endDate: '',
  dateRange: undefined,
  storeIds: [],
  productIds: [],
  stackable: false,
  active: true,
})

// 表單驗證規則
const rules: Record<string, Rule[]> = {
  code: [{ required: true, message: '請輸入優惠券代碼', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入優惠券名稱', trigger: 'blur' }],
  discountValue: [{ required: true, message: '請輸入折扣值', trigger: 'blur' }],
  totalCount: [{ required: true, message: '請輸入發行數量', trigger: 'blur' }],
}

// 自動產生優惠券代碼
const generateCode = (): void => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formState.code = code
}

// 載入基礎資料
const loadBaseData = async (): Promise<void> => {
  try {
    const [storesData, productsData] = await Promise.all([getActiveStores(), getProducts({ size: 1000 })])
    stores.value = storesData
    products.value = productsData.content
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
  }
}

// 載入優惠券資料
const loadCoupon = async (): Promise<void> => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const coupon = await getCoupon(couponId.value)
    Object.assign(formState, coupon)
    if (coupon.startDate && coupon.endDate) {
      formState.dateRange = [coupon.startDate, coupon.endDate]
    }
  } catch (error) {
    console.error('載入優惠券失敗:', error)
    router.push('/coupons/list')
  } finally {
    loading.value = false
  }
}

// 提交表單
const handleSubmit = async (): Promise<void> => {
  // 處理日期
  if (formState.dateRange) {
    formState.startDate = formState.dateRange[0] as string
    formState.endDate = formState.dateRange[1] as string
  }

  submitting.value = true
  try {
    const { dateRange, ...submitData } = formState
    if (isEdit.value) {
      await updateCoupon(couponId.value, submitData)
      message.success('更新成功')
    } else {
      await createCoupon(submitData)
      message.success('新增成功')
    }
    router.push('/coupons/list')
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = (): void => router.push('/coupons/list')

onMounted(() => {
  loadBaseData()
  loadCoupon()
})
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}

.ml-8 {
  margin-left: 8px;
}
</style>
