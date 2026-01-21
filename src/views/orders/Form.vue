<!--
  Orders/Form.vue - 訂單表單頁面（新增訂單）
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">新增訂單</h1>
      <div class="page-actions">
        <a-button @click="goBack"><ArrowLeftOutlined /> 返回</a-button>
      </div>
    </div>

    <div class="content-area">
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
        @finish="handleSubmit"
      >
        <!-- 基本資訊 -->
        <a-card title="基本資訊" class="mb-16">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item
                label="門市"
                name="storeId"
                :rules="[{ required: true, message: '請選擇門市' }]"
              >
                <a-select
                  v-model:value="formState.storeId"
                  placeholder="請選擇門市"
                  :options="stores"
                  :field-names="{ label: 'name', value: 'id' }"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="客戶" name="customerId">
                <a-select
                  v-model:value="formState.customerId"
                  placeholder="選擇客戶（可選）"
                  :options="customers"
                  :field-names="{ label: 'name', value: 'id' }"
                  allow-clear
                  show-search
                  option-filter-prop="label"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 商品明細 -->
        <a-card title="商品明細" class="mb-16">
          <a-table
            :columns="itemColumns"
            :data-source="formState.items"
            :pagination="false"
            row-key="key"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'product'">
                <a-select
                  v-model:value="record.productId"
                  placeholder="選擇商品"
                  :options="products"
                  :field-names="{ label: 'name', value: 'id' }"
                  show-search
                  option-filter-prop="label"
                  style="width: 200px"
                  @change="(val: number) => handleProductChange(index, val)"
                />
              </template>
              <template v-else-if="column.key === 'quantity'">
                <a-input-number v-model:value="record.quantity" :min="1" @change="calculateTotal" />
              </template>
              <template v-else-if="column.key === 'unitPrice'">
                <a-input-number
                  v-model:value="record.unitPrice"
                  :min="0"
                  :precision="2"
                  @change="calculateTotal"
                />
              </template>
              <template v-else-if="column.key === 'subtotal'">
                NT$ {{ ((record.quantity || 0) * (record.unitPrice || 0)).toLocaleString() }}
              </template>
              <template v-else-if="column.key === 'actions'">
                <a-button type="link" danger @click="removeItem(index)"
                  ><DeleteOutlined
                /></a-button>
              </template>
            </template>
          </a-table>
          <a-button type="dashed" block class="mt-16" @click="addItem"
            ><PlusOutlined /> 新增商品</a-button
          >
        </a-card>

        <!-- 金額摘要 -->
        <a-card title="金額摘要" class="mb-16">
          <a-descriptions :column="2">
            <a-descriptions-item label="小計"
              >NT$ {{ subtotal.toLocaleString() }}</a-descriptions-item
            >
            <a-descriptions-item label="折扣">
              <a-input-number
                v-model:value="formState.discountAmount"
                :min="0"
                :precision="2"
                style="width: 150px"
              />
            </a-descriptions-item>
            <a-descriptions-item label="稅額">
              <a-input-number
                v-model:value="formState.taxAmount"
                :min="0"
                :precision="2"
                style="width: 150px"
              />
            </a-descriptions-item>
            <a-descriptions-item label="總計">
              <span class="text-primary" style="font-size: 18px; font-weight: bold"
                >NT$ {{ totalAmount.toLocaleString() }}</span
              >
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <!-- 備註 -->
        <a-card title="備註" class="mb-16">
          <a-textarea v-model:value="formState.notes" :rows="3" placeholder="訂單備註" />
        </a-card>

        <div class="form-actions">
          <a-button @click="goBack">取消</a-button>
          <a-button type="primary" html-type="submit" :loading="submitting">建立訂單</a-button>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { createOrder } from '@/api/orders'
import { getActiveStores } from '@/api/stores'
import { getProducts } from '@/api/products'
import { getCustomers } from '@/api/customers'
import type { OrderRequest, OrderItemRequest, Store, Product, Customer } from '@/types'

interface FormItem extends OrderItemRequest {
  key: number
}

const router = useRouter()
const submitting = ref(false)
const stores = ref<Store[]>([])
const products = ref<Product[]>([])
const customers = ref<Customer[]>([])
let itemKey = 0

const formState = reactive<OrderRequest & { items: FormItem[] }>({
  storeId: 0,
  customerId: undefined,
  items: [{ key: itemKey++, productId: 0, quantity: 1, unitPrice: 0 }],
  discountAmount: 0,
  taxAmount: 0,
  notes: '',
})

const itemColumns = [
  { title: '商品', key: 'product', width: 250 },
  { title: '數量', key: 'quantity', width: 100 },
  { title: '單價', key: 'unitPrice', width: 120 },
  { title: '小計', key: 'subtotal', width: 120 },
  { title: '', key: 'actions', width: 60 },
]

const subtotal = computed(() =>
  formState.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0)
)

const totalAmount = computed(
  () => subtotal.value - (formState.discountAmount || 0) + (formState.taxAmount || 0)
)

const loadBaseData = async (): Promise<void> => {
  try {
    const [storesData, productsData, customersData] = await Promise.all([
      getActiveStores(),
      getProducts({ size: 1000 }),
      getCustomers({ size: 1000 }),
    ])
    stores.value = storesData
    products.value = productsData.content
    customers.value = customersData.content
  } catch (error) {
    console.error('載入基礎資料失敗:', error)
  }
}

const handleProductChange = (index: number, productId: number): void => {
  const product = products.value.find((p) => p.id === productId)
  if (product) {
    formState.items[index].unitPrice = product.sellingPrice
    calculateTotal()
  }
}

const calculateTotal = (): void => {
  // 觸發計算（透過 computed）
}

const addItem = (): void => {
  formState.items.push({ key: itemKey++, productId: 0, quantity: 1, unitPrice: 0 })
}

const removeItem = (index: number): void => {
  if (formState.items.length > 1) {
    formState.items.splice(index, 1)
  }
}

const handleSubmit = async (): Promise<void> => {
  if (formState.items.some((item) => !item.productId)) {
    message.warning('請選擇商品')
    return
  }

  submitting.value = true
  try {
    await createOrder({
      ...formState,
      items: formState.items.map(({ productId, quantity, unitPrice }) => ({
        productId,
        quantity,
        unitPrice,
      })),
    })
    message.success('訂單建立成功')
    router.push('/orders/list')
  } catch (error) {
    console.error('建立訂單失敗:', error)
  } finally {
    submitting.value = false
  }
}

const goBack = (): void => router.push('/orders/list')

onMounted(() => loadBaseData())
</script>
