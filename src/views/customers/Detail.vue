<!--
  Customers/Detail.vue - 客戶詳情頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">客戶詳情</h1>
      <div class="page-actions">
        <a-button @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          返回
        </a-button>
        <a-button type="primary" @click="goToEdit">
          <template #icon><EditOutlined /></template>
          編輯
        </a-button>
      </div>
    </div>

    <a-spin :spinning="loading">
      <a-row :gutter="16">
        <a-col :xs="24" :lg="12">
          <a-card title="基本資訊" class="mb-16">
            <a-descriptions :column="1">
              <a-descriptions-item label="會員編號">{{ customer?.memberNo }}</a-descriptions-item>
              <a-descriptions-item label="姓名">{{ customer?.name }}</a-descriptions-item>
              <a-descriptions-item label="電話">{{ customer?.phone }}</a-descriptions-item>
              <a-descriptions-item label="Email">{{ customer?.email || '-' }}</a-descriptions-item>
              <a-descriptions-item label="性別">{{ customer?.genderDisplay || '-' }}</a-descriptions-item>
              <a-descriptions-item label="生日">{{ customer?.birthday || '-' }}</a-descriptions-item>
              <a-descriptions-item label="地址">{{ customer?.address || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <a-col :xs="24" :lg="12">
          <a-card title="會員資訊" class="mb-16">
            <a-descriptions :column="1">
              <a-descriptions-item label="會員等級">
                <a-tag :color="getLevelColor(customer?.level?.code)">
                  {{ customer?.level?.name || '一般' }}
                </a-tag>
              </a-descriptions-item>
              <a-descriptions-item label="累計點數">{{ customer?.totalPoints?.toLocaleString() || 0 }} 點</a-descriptions-item>
              <a-descriptions-item label="累計消費">NT$ {{ customer?.totalSpent?.toLocaleString() || 0 }}</a-descriptions-item>
              <a-descriptions-item label="註冊日期">{{ customer?.registerDate }}</a-descriptions-item>
              <a-descriptions-item label="狀態">
                <a-tag :color="customer?.active ? 'success' : 'default'">
                  {{ customer?.active ? '啟用' : '停用' }}
                </a-tag>
              </a-descriptions-item>
            </a-descriptions>
          </a-card>

          <a-card title="點數操作">
            <a-space>
              <a-button type="primary" @click="showPointsModal('add')">
                <template #icon><PlusOutlined /></template>
                新增點數
              </a-button>
              <a-button @click="showPointsModal('deduct')">
                <template #icon><MinusOutlined /></template>
                扣除點數
              </a-button>
            </a-space>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>

    <!-- 點數操作彈窗 -->
    <a-modal v-model:open="pointsModalVisible" :title="pointsAction === 'add' ? '新增點數' : '扣除點數'" @ok="handlePointsSubmit">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="點數數量">
          <a-input-number v-model:value="pointsForm.points" :min="1" style="width: 200px" />
        </a-form-item>
        <a-form-item label="原因說明">
          <a-textarea v-model:value="pointsForm.reason" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, EditOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons-vue'
import { getCustomer, addPoints, deductPoints } from '@/api/customers'
import type { Customer } from '@/types'

const router = useRouter()
const route = useRoute()
const customerId = Number(route.params.id)

const loading = ref(false)
const customer = ref<Customer | null>(null)
const pointsModalVisible = ref(false)
const pointsAction = ref<'add' | 'deduct'>('add')
const pointsForm = reactive({ points: 0, reason: '' })

const loadCustomer = async (): Promise<void> => {
  loading.value = true
  try {
    customer.value = await getCustomer(customerId)
  } catch (error) {
    console.error('載入客戶資料失敗:', error)
    router.push('/customers/list')
  } finally {
    loading.value = false
  }
}

const goBack = (): void => router.push('/customers/list')
const goToEdit = (): void => router.push(`/customers/${customerId}/edit`)

const showPointsModal = (action: 'add' | 'deduct'): void => {
  pointsAction.value = action
  pointsForm.points = 0
  pointsForm.reason = ''
  pointsModalVisible.value = true
}

const handlePointsSubmit = async (): Promise<void> => {
  if (pointsForm.points <= 0) {
    message.warning('請輸入有效的點數')
    return
  }

  try {
    if (pointsAction.value === 'add') {
      await addPoints(customerId, pointsForm.points, pointsForm.reason)
      message.success('點數新增成功')
    } else {
      await deductPoints(customerId, pointsForm.points, pointsForm.reason)
      message.success('點數扣除成功')
    }
    pointsModalVisible.value = false
    loadCustomer()
  } catch (error) {
    console.error('點數操作失敗:', error)
  }
}

const getLevelColor = (code?: string): string => {
  const colors: Record<string, string> = { VIP: 'gold', GOLD: 'orange', SILVER: 'default' }
  return colors[code || ''] || 'blue'
}

onMounted(() => loadCustomer())
</script>
