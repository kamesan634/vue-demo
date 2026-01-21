<!--
  Coupons/List.vue - 優惠券列表頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">優惠券管理</h1>
      <div class="page-actions">
        <a-button type="primary" @click="goToCreate"><PlusOutlined /> 新增</a-button>
      </div>
    </div>

    <div class="search-area">
      <a-form layout="inline" :model="searchForm">
        <a-form-item label="優惠券代碼">
          <a-input v-model:value="searchForm.code" placeholder="輸入代碼" allow-clear style="width: 150px" @press-enter="handleSearch" />
        </a-form-item>
        <a-form-item label="優惠類型">
          <a-select v-model:value="searchForm.discountType" placeholder="全部" style="width: 120px" allow-clear @change="handleSearch">
            <a-select-option value="PERCENTAGE">百分比</a-select-option>
            <a-select-option value="FIXED">固定金額</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="狀態">
          <a-select v-model:value="searchForm.status" placeholder="全部" style="width: 100px" allow-clear @change="handleSearch">
            <a-select-option value="ACTIVE">有效</a-select-option>
            <a-select-option value="EXPIRED">已過期</a-select-option>
            <a-select-option value="USED_UP">已用完</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleSearch"><SearchOutlined /> 搜尋</a-button>
        </a-form-item>
      </a-form>
    </div>

    <div class="content-area">
      <a-table :columns="columns" :data-source="coupons" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'code'">
            <a-typography-text copyable :content="record.code">{{ record.code }}</a-typography-text>
          </template>
          <template v-else-if="column.key === 'discount'">
            <span v-if="record.discountType === 'PERCENTAGE'">{{ record.discountValue }}% OFF</span>
            <span v-else>折 NT$ {{ record.discountValue }}</span>
          </template>
          <template v-else-if="column.key === 'usage'">
            <template v-if="record.maxUses">
              <a-progress :percent="getUsagePercent(record)" :stroke-color="getUsagePercent(record) >= 90 ? '#ff4d4f' : '#1890ff'" size="small" :show-info="false" style="width: 80px" />
              <span class="ml-8">{{ record.usedCount }}/{{ record.maxUses }}</span>
            </template>
            <template v-else>
              <span>{{ record.usedCount }} (無上限)</span>
            </template>
          </template>
          <template v-else-if="column.key === 'period'">
            <div>{{ formatDate(record.startDate) }}</div>
            <div class="text-secondary">~ {{ formatDate(record.endDate) }}</div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record)">{{ getStatusText(record) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="table-actions">
              <a-button type="link" size="small" @click="goToEdit(record.id)">編輯</a-button>
              <a-button type="link" size="small" @click="viewUsage(record)">使用記錄</a-button>
              <a-popconfirm title="確定要刪除嗎？" @confirm="handleDelete(record.id)">
                <a-button type="link" size="small" danger>刪除</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 使用記錄 Modal -->
    <a-modal v-model:open="usageModalVisible" :title="`優惠券使用記錄 - ${selectedCoupon?.code}`" :footer="null" width="700px">
      <a-table :columns="usageColumns" :data-source="usageRecords" :loading="usageLoading" :pagination="false" row-key="id" size="small" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { getCoupons, deleteCoupon, getCouponUsage } from '@/api/coupons'
import type { Coupon, CouponUsage } from '@/types'

const router = useRouter()
const loading = ref(false)
const coupons = ref<Coupon[]>([])

// 搜尋表單
const searchForm = reactive({
  code: '',
  discountType: undefined as string | undefined,
  status: undefined as string | undefined,
})

// 分頁配置
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: (total) => `共 ${total} 筆`,
})

// 表格欄位
const columns = [
  { title: '優惠券代碼', key: 'code', width: 150 },
  { title: '名稱', dataIndex: 'name', key: 'name' },
  { title: '折扣', key: 'discount', width: 120 },
  { title: '使用量', key: 'usage', width: 150 },
  { title: '有效期間', key: 'period', width: 180 },
  { title: '狀態', key: 'status', width: 100 },
  { title: '操作', key: 'actions', width: 180 },
]

// 使用記錄相關
const usageModalVisible = ref(false)
const usageLoading = ref(false)
const selectedCoupon = ref<Coupon | null>(null)
const usageRecords = ref<CouponUsage[]>([])

const usageColumns = [
  { title: '使用時間', dataIndex: 'usedAt', key: 'usedAt', width: 160 },
  { title: '訂單編號', dataIndex: 'orderNo', key: 'orderNo', width: 150 },
  { title: '客戶', dataIndex: 'customerName', key: 'customerName' },
  { title: '折扣金額', dataIndex: 'discountAmount', key: 'discountAmount', width: 100 },
]

// 計算使用率
const getUsagePercent = (record: Coupon): number => {
  if (!record.maxUses) return 0
  return Math.round((record.usedCount / record.maxUses) * 100)
}

// 取得狀態顏色
const getStatusColor = (record: Coupon): string => {
  if (record.exhausted) return 'warning'
  if (record.expired) return 'default'
  if (record.valid) return 'success'
  if (record.upcoming) return 'processing'
  return 'default'
}

// 取得狀態文字
const getStatusText = (record: Coupon): string => {
  if (record.exhausted) return '已用完'
  if (record.expired) return '已過期'
  if (record.valid) return '有效'
  if (record.upcoming) return '即將開始'
  return '未知'
}

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10)
}

// 載入優惠券列表
const loadCoupons = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await getCoupons({
      page: (pagination.current || 1) - 1, // Spring Data 分頁從 0 開始
      size: pagination.pageSize,
      code: searchForm.code || undefined,
      discountType: searchForm.discountType,
      status: searchForm.status,
    })
    console.log('[Coupons API Response]', JSON.stringify(response, null, 2))
    coupons.value = response.content
    pagination.total = response.totalElements
  } catch (error) {
    console.error('載入優惠券失敗:', error)
  } finally {
    loading.value = false
  }
}

// 處理搜尋
const handleSearch = (): void => {
  pagination.current = 1
  loadCoupons()
}

// 處理表格變更
const handleTableChange = (pag: TablePaginationConfig): void => {
  pagination.current = pag.current || 1
  loadCoupons()
}

// 頁面跳轉
const goToCreate = (): void => router.push('/coupons/create')
const goToEdit = (id: number): void => router.push(`/coupons/${id}/edit`)

// 查看使用記錄
const viewUsage = async (coupon: Coupon): Promise<void> => {
  selectedCoupon.value = coupon
  usageModalVisible.value = true
  usageLoading.value = true
  try {
    usageRecords.value = await getCouponUsage(coupon.id)
  } catch (error) {
    console.error('載入使用記錄失敗:', error)
  } finally {
    usageLoading.value = false
  }
}

// 處理刪除
const handleDelete = async (id: number): Promise<void> => {
  try {
    await deleteCoupon(id)
    message.success('刪除成功')
    loadCoupons()
  } catch (error) {
    console.error('刪除失敗:', error)
  }
}

onMounted(() => loadCoupons())
</script>

<style scoped>
.text-secondary {
  color: #8c8c8c;
  font-size: 12px;
}

.ml-8 {
  margin-left: 8px;
}
</style>
