<!--
  Orders/Detail.vue - 訂單詳情頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">訂單詳情</h1>
      <div class="page-actions">
        <a-button @click="goBack"><ArrowLeftOutlined /> 返回</a-button>
      </div>
    </div>

    <a-spin :spinning="loading">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="16">
          <!-- 訂單資訊 -->
          <a-card title="訂單資訊" class="mb-16">
            <a-descriptions :column="2">
              <a-descriptions-item label="訂單編號">
                <a-typography-text copyable>{{ order?.orderNo }}</a-typography-text>
              </a-descriptions-item>
              <a-descriptions-item label="狀態">
                <a-tag :color="getStatusColor(order?.status)">{{ order?.statusDescription }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="門市">{{ order?.storeName }}</a-descriptions-item>
              <a-descriptions-item label="客戶">{{
                order?.customerName || '非會員'
              }}</a-descriptions-item>
              <a-descriptions-item label="訂單日期">{{ order?.orderDate }}</a-descriptions-item>
              <a-descriptions-item label="訂單時間">{{ order?.orderTime }}</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 商品明細 -->
          <a-card title="商品明細" class="mb-16">
            <a-table
              :columns="columns"
              :data-source="order?.items"
              :pagination="false"
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'subtotal'">
                  NT$ {{ record.subtotal?.toLocaleString() }}
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="8">
          <!-- 金額摘要 -->
          <a-card title="金額摘要" class="mb-16">
            <a-descriptions :column="1" :label-style="{ width: '100px' }">
              <a-descriptions-item label="小計"
                >NT$ {{ order?.subtotal?.toLocaleString() }}</a-descriptions-item
              >
              <a-descriptions-item label="折扣"
                >-NT$ {{ order?.discountAmount?.toLocaleString() }}</a-descriptions-item
              >
              <a-descriptions-item label="稅額"
                >NT$ {{ order?.taxAmount?.toLocaleString() }}</a-descriptions-item
              >
              <a-descriptions-item label="總計">
                <span class="text-primary" style="font-size: 20px; font-weight: bold">
                  NT$ {{ order?.totalAmount?.toLocaleString() }}
                </span>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 付款資訊 -->
          <a-card title="付款資訊" class="mb-16">
            <a-descriptions :column="1">
              <a-descriptions-item label="已付金額"
                >NT$ {{ order?.paidAmount?.toLocaleString() }}</a-descriptions-item
              >
              <a-descriptions-item label="找零"
                >NT$ {{ order?.changeAmount?.toLocaleString() }}</a-descriptions-item
              >
              <a-descriptions-item label="獲得點數"
                >{{ order?.pointsEarned }} 點</a-descriptions-item
              >
              <a-descriptions-item label="使用點數">{{ order?.pointsUsed }} 點</a-descriptions-item>
            </a-descriptions>
          </a-card>

          <!-- 備註 -->
          <a-card v-if="order?.notes" title="備註">
            <p>{{ order.notes }}</p>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { getOrder } from '@/api/orders'
import type { Order, OrderStatus } from '@/types'

const router = useRouter()
const route = useRoute()
const orderId = Number(route.params.id)

const loading = ref(false)
const order = ref<Order | null>(null)

const columns = [
  { title: '商品', dataIndex: 'productName', key: 'productName' },
  { title: '商品編號', dataIndex: 'productCode', key: 'productCode', width: 120 },
  { title: '數量', dataIndex: 'quantity', key: 'quantity', width: 80 },
  { title: '單價', dataIndex: 'unitPrice', key: 'unitPrice', width: 100 },
  { title: '小計', key: 'subtotal', width: 120 },
]

const loadOrder = async (): Promise<void> => {
  loading.value = true
  try {
    order.value = await getOrder(orderId)
  } catch (error) {
    console.error('載入訂單詳情失敗:', error)
    router.push('/orders/list')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/orders/list')
}

const getStatusColor = (status?: OrderStatus): string => {
  if (!status) return 'default'
  const colors: Record<OrderStatus, string> = {
    PENDING: 'processing',
    PAID: 'success',
    CANCELLED: 'default',
    REFUNDED: 'warning',
  }
  return colors[status]
}

onMounted(() => loadOrder())
</script>
