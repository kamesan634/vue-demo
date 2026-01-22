<!--
  Customers/Form.vue - 客戶表單頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '編輯客戶' : '新增客戶' }}</h1>
      <div class="page-actions">
        <a-button @click="goBack">
          <template #icon><ArrowLeftOutlined /></template>
          返回
        </a-button>
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
          <a-form-item label="姓名" name="name">
            <a-input v-model:value="formState.name" placeholder="請輸入姓名" />
          </a-form-item>

          <a-form-item label="電話" name="phone">
            <a-input v-model:value="formState.phone" placeholder="請輸入電話" />
          </a-form-item>

          <a-form-item label="Email" name="email">
            <a-input v-model:value="formState.email" placeholder="請輸入 Email" />
          </a-form-item>

          <a-form-item label="性別" name="gender">
            <a-radio-group v-model:value="formState.gender">
              <a-radio value="MALE">男</a-radio>
              <a-radio value="FEMALE">女</a-radio>
              <a-radio value="OTHER">其他</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item label="生日" name="birthday">
            <a-date-picker v-model:value="birthdayValue" style="width: 200px" />
          </a-form-item>

          <a-form-item label="地址" name="address">
            <a-textarea v-model:value="formState.address" placeholder="請輸入地址" :rows="2" />
          </a-form-item>

          <a-form-item label="備註" name="notes">
            <a-textarea v-model:value="formState.notes" placeholder="備註" :rows="3" />
          </a-form-item>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { getCustomer, createCustomer, updateCustomer } from '@/api/customers'
import type { CustomerRequest } from '@/types'

const router = useRouter()
const route = useRoute()

const isEdit = computed(() => !!route.params.id)
const customerId = computed(() => Number(route.params.id))

const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const birthdayValue = ref<Dayjs | undefined>(undefined)

const formState = reactive<CustomerRequest>({
  name: '',
  phone: '',
  email: '',
  gender: undefined,
  birthday: undefined,
  address: '',
  notes: '',
})

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '請輸入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '請輸入電話', trigger: 'blur' }],
}

const loadCustomer = async (): Promise<void> => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const customer = await getCustomer(customerId.value)
    formState.name = customer.name
    formState.phone = customer.phone
    formState.email = customer.email || ''
    formState.gender = customer.gender
    formState.address = customer.address || ''
    formState.notes = customer.notes || ''
    if (customer.birthday) {
      birthdayValue.value = dayjs(customer.birthday)
    }
  } catch (error) {
    console.error('載入客戶資料失敗:', error)
    router.push('/customers/list')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    const data = { ...formState }
    if (birthdayValue.value) {
      data.birthday = birthdayValue.value.format('YYYY-MM-DD')
    }

    if (isEdit.value) {
      await updateCustomer(customerId.value, data)
      message.success('更新成功')
    } else {
      await createCustomer(data)
      message.success('新增成功')
    }
    router.push('/customers/list')
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/customers/list')
}

onMounted(() => loadCustomer())
</script>
