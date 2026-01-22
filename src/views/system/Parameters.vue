<!--
  System/Parameters.vue - 系統參數設定頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">系統參數設定</h1>
    </div>

    <div class="content-area">
      <a-spin :spinning="loading">
        <a-tabs v-model:active-key="activeTab">
          <!-- 基本設定 -->
          <a-tab-pane key="basic" tab="基本設定">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container">
              <a-form-item label="系統名稱">
                <a-input v-model:value="params.systemName" placeholder="請輸入系統名稱" />
              </a-form-item>
              <a-form-item label="公司名稱">
                <a-input v-model:value="params.companyName" placeholder="請輸入公司名稱" />
              </a-form-item>
              <a-form-item label="統一編號">
                <a-input v-model:value="params.taxId" placeholder="請輸入統一編號" />
              </a-form-item>
              <a-form-item label="公司地址">
                <a-input v-model:value="params.address" placeholder="請輸入公司地址" />
              </a-form-item>
              <a-form-item label="聯絡電話">
                <a-input v-model:value="params.phone" placeholder="請輸入聯絡電話" />
              </a-form-item>
              <a-form-item label="電子信箱">
                <a-input v-model:value="params.email" placeholder="請輸入電子信箱" />
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 銷售設定 -->
          <a-tab-pane key="sales" tab="銷售設定">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container">
              <a-form-item label="預設稅率">
                <a-input-number
                  v-model:value="params.defaultTaxRate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  style="width: 150px"
                />
                <span class="ml-8">%</span>
              </a-form-item>
              <a-form-item label="價格含稅">
                <a-switch v-model:checked="params.priceIncludesTax" />
              </a-form-item>
              <a-form-item label="發票類型">
                <a-select v-model:value="params.invoiceType" style="width: 200px">
                  <a-select-option value="ELECTRONIC">電子發票</a-select-option>
                  <a-select-option value="PAPER">紙本發票</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="小數點位數">
                <a-input-number
                  v-model:value="params.decimalPlaces"
                  :min="0"
                  :max="4"
                  style="width: 150px"
                />
              </a-form-item>
              <a-form-item label="四捨五入規則">
                <a-select v-model:value="params.roundingRule" style="width: 200px">
                  <a-select-option value="ROUND">四捨五入</a-select-option>
                  <a-select-option value="FLOOR">無條件捨去</a-select-option>
                  <a-select-option value="CEIL">無條件進位</a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 會員設定 -->
          <a-tab-pane key="member" tab="會員設定">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container">
              <a-form-item label="點數兌換比例">
                <a-input-number
                  v-model:value="params.pointsPerDollar"
                  :min="0"
                  style="width: 150px"
                />
                <span class="ml-8">點 / 元</span>
              </a-form-item>
              <a-form-item label="點數使用比例">
                <a-input-number
                  v-model:value="params.pointsRedeemRate"
                  :min="0"
                  :precision="2"
                  style="width: 150px"
                />
                <span class="ml-8">元 / 點</span>
              </a-form-item>
              <a-form-item label="點數有效期限">
                <a-input-number
                  v-model:value="params.pointsExpiryDays"
                  :min="0"
                  style="width: 150px"
                />
                <span class="ml-8">天（0 表示永久有效）</span>
              </a-form-item>
              <a-form-item label="新會員贈點">
                <a-input-number
                  v-model:value="params.newMemberPoints"
                  :min="0"
                  style="width: 150px"
                />
                <span class="ml-8">點</span>
              </a-form-item>
              <a-form-item label="生日禮金">
                <a-input-number
                  v-model:value="params.birthdayBonus"
                  :min="0"
                  style="width: 150px"
                />
                <span class="ml-8">元</span>
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 庫存設定 -->
          <a-tab-pane key="inventory" tab="庫存設定">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container">
              <a-form-item label="低庫存警戒線">
                <a-input-number
                  v-model:value="params.lowStockThreshold"
                  :min="0"
                  style="width: 150px"
                />
                <span class="ml-8">件</span>
              </a-form-item>
              <a-form-item label="允許負庫存">
                <a-switch v-model:checked="params.allowNegativeStock" />
              </a-form-item>
              <a-form-item label="自動補貨提醒">
                <a-switch v-model:checked="params.autoReorderAlert" />
              </a-form-item>
              <a-form-item label="庫存變動需審核">
                <a-switch v-model:checked="params.inventoryAdjustApproval" />
              </a-form-item>
            </a-form>
          </a-tab-pane>

          <!-- 通知設定 -->
          <a-tab-pane key="notification" tab="通知設定">
            <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" class="form-container">
              <a-form-item label="低庫存通知">
                <a-switch v-model:checked="params.lowStockNotification" />
              </a-form-item>
              <a-form-item label="新訂單通知">
                <a-switch v-model:checked="params.newOrderNotification" />
              </a-form-item>
              <a-form-item label="會員生日提醒">
                <a-switch v-model:checked="params.birthdayReminder" />
              </a-form-item>
              <a-form-item label="促銷到期提醒">
                <a-switch v-model:checked="params.promotionExpiryReminder" />
              </a-form-item>
              <a-form-item label="通知信箱">
                <a-input
                  v-model:value="params.notificationEmail"
                  placeholder="多個信箱以逗號分隔"
                />
              </a-form-item>
            </a-form>
          </a-tab-pane>
        </a-tabs>

        <div class="form-actions">
          <a-button @click="resetParams">重置</a-button>
          <a-button type="primary" :loading="saving" @click="saveParams">儲存設定</a-button>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { getSystemParameters, updateSystemParameters } from '@/api/system'
import type { SystemParameters } from '@/types'

const loading = ref(false)
const saving = ref(false)
const activeTab = ref('basic')

// 系統參數
const params = reactive<SystemParameters>({
  // 基本設定
  systemName: '龜三的ERP Demo',
  companyName: '',
  taxId: '',
  address: '',
  phone: '',
  email: '',
  // 銷售設定
  defaultTaxRate: 5,
  priceIncludesTax: true,
  invoiceType: 'ELECTRONIC',
  decimalPlaces: 0,
  roundingRule: 'ROUND',
  // 會員設定
  pointsPerDollar: 1,
  pointsRedeemRate: 1,
  pointsExpiryDays: 365,
  newMemberPoints: 100,
  birthdayBonus: 100,
  // 庫存設定
  lowStockThreshold: 10,
  allowNegativeStock: false,
  autoReorderAlert: true,
  inventoryAdjustApproval: false,
  // 通知設定
  lowStockNotification: true,
  newOrderNotification: true,
  birthdayReminder: true,
  promotionExpiryReminder: true,
  notificationEmail: '',
})

// 原始參數備份
let originalParams: SystemParameters | null = null

// 載入系統參數
const loadParams = async (): Promise<void> => {
  loading.value = true
  try {
    const data = await getSystemParameters()
    console.log('[System Parameters API Response]', JSON.stringify(data, null, 2))
    Object.assign(params, data)
    originalParams = { ...params }
  } catch (error) {
    console.error('載入系統參數失敗:', error)
  } finally {
    loading.value = false
  }
}

// 儲存系統參數
const saveParams = async (): Promise<void> => {
  saving.value = true
  try {
    await updateSystemParameters(params)
    message.success('設定已儲存')
    originalParams = { ...params }
  } catch (error) {
    console.error('儲存系統參數失敗:', error)
  } finally {
    saving.value = false
  }
}

// 重置參數
const resetParams = (): void => {
  if (originalParams) {
    Object.assign(params, originalParams)
    message.info('已重置為上次儲存的設定')
  }
}

onMounted(() => loadParams())
</script>

<style scoped>
.form-container {
  max-width: 800px;
  padding: 20px;
}

.form-actions {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}

.form-actions .ant-btn {
  margin: 0 8px;
}

.ml-8 {
  margin-left: 8px;
}
</style>
