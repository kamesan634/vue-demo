<!--
  Suppliers/Form.vue - 供應商表單頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '編輯供應商' : '新增供應商' }}</h1>
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
            <a-form-item label="代碼" name="code">
              <a-input v-model:value="formState.code" placeholder="請輸入代碼" :disabled="isEdit" />
            </a-form-item>
            <a-form-item label="名稱" name="name">
              <a-input v-model:value="formState.name" placeholder="請輸入供應商名稱" />
            </a-form-item>
            <a-form-item label="統一編號" name="taxId">
              <a-input v-model:value="formState.taxId" placeholder="請輸入統一編號" />
            </a-form-item>
            <a-form-item label="地址" name="address">
              <a-input v-model:value="formState.address" placeholder="請輸入地址" />
            </a-form-item>
          </a-card>

          <a-card title="聯絡資訊" class="mb-16">
            <a-form-item label="聯絡人" name="contactName">
              <a-input v-model:value="formState.contactName" placeholder="請輸入聯絡人姓名" />
            </a-form-item>
            <a-form-item label="聯絡電話" name="contactPhone">
              <a-input v-model:value="formState.contactPhone" placeholder="請輸入聯絡電話" />
            </a-form-item>
            <a-form-item label="Email" name="email">
              <a-input v-model:value="formState.email" placeholder="請輸入 Email" />
            </a-form-item>
            <a-form-item label="傳真" name="fax">
              <a-input v-model:value="formState.fax" placeholder="請輸入傳真號碼" />
            </a-form-item>
          </a-card>

          <a-card title="交易條件" class="mb-16">
            <a-form-item label="付款條件" name="paymentTerms">
              <a-select v-model:value="formState.paymentTerms" placeholder="請選擇付款條件">
                <a-select-option value="CASH">現金</a-select-option>
                <a-select-option value="NET_30">月結 30 天</a-select-option>
                <a-select-option value="NET_60">月結 60 天</a-select-option>
                <a-select-option value="NET_90">月結 90 天</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="銀行帳號" name="bankAccount">
              <a-input v-model:value="formState.bankAccount" placeholder="請輸入銀行帳號" />
            </a-form-item>
            <a-form-item label="銀行名稱" name="bankName">
              <a-input v-model:value="formState.bankName" placeholder="請輸入銀行名稱" />
            </a-form-item>
          </a-card>

          <a-card title="其他設定" class="mb-16">
            <a-form-item label="排序" name="sortOrder">
              <a-input-number v-model:value="formState.sortOrder" :min="0" />
            </a-form-item>
            <a-form-item label="狀態" name="active">
              <a-switch
                v-model:checked="formState.active"
                checked-children="啟用"
                un-checked-children="停用"
              />
            </a-form-item>
            <a-form-item label="備註" name="notes">
              <a-textarea v-model:value="formState.notes" :rows="3" placeholder="請輸入備註" />
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
import { getSupplier, createSupplier, updateSupplier } from '@/api/suppliers'
import type { SupplierRequest } from '@/types'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const supplierId = computed(() => Number(route.params.id))

const loading = ref(false)
const submitting = ref(false)

// 表單狀態
const formState = reactive<SupplierRequest>({
  code: '',
  name: '',
  taxId: '',
  address: '',
  contactName: '',
  contactPhone: '',
  email: '',
  fax: '',
  paymentTerms: 'NET_30',
  bankAccount: '',
  bankName: '',
  active: true,
  sortOrder: 0,
  notes: '',
})

// 表單驗證規則
const rules: Record<string, Rule[]> = {
  code: [{ required: true, message: '請輸入代碼', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入供應商名稱', trigger: 'blur' }],
  email: [{ type: 'email', message: '請輸入有效的 Email', trigger: 'blur' }],
}

// 載入供應商資料
const loadSupplier = async (): Promise<void> => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const supplier = await getSupplier(supplierId.value)
    Object.assign(formState, supplier)
  } catch (error) {
    console.error('載入供應商失敗:', error)
    router.push('/suppliers/list')
  } finally {
    loading.value = false
  }
}

// 提交表單
const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateSupplier(supplierId.value, formState)
      message.success('更新成功')
    } else {
      await createSupplier(formState)
      message.success('新增成功')
    }
    router.push('/suppliers/list')
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/suppliers/list')
}

onMounted(() => loadSupplier())
</script>

<style scoped>
.mb-16 {
  margin-bottom: 16px;
}
</style>
