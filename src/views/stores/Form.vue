<!--
  Stores/Form.vue - 門市/倉庫表單頁面
-->
<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '編輯門市/倉庫' : '新增門市/倉庫' }}</h1>
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
          <a-form-item label="代碼" name="code">
            <a-input v-model:value="formState.code" placeholder="請輸入代碼" :disabled="isEdit" />
          </a-form-item>
          <a-form-item label="名稱" name="name">
            <a-input v-model:value="formState.name" placeholder="請輸入名稱" />
          </a-form-item>
          <a-form-item label="類型" name="type">
            <a-radio-group v-model:value="formState.type">
              <a-radio value="STORE">門市</a-radio>
              <a-radio value="WAREHOUSE">倉庫</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="地址" name="address">
            <a-input v-model:value="formState.address" placeholder="請輸入地址" />
          </a-form-item>
          <a-form-item label="電話" name="phone">
            <a-input v-model:value="formState.phone" placeholder="請輸入電話" />
          </a-form-item>
          <a-form-item label="Email" name="email">
            <a-input v-model:value="formState.email" placeholder="請輸入 Email" />
          </a-form-item>
          <a-form-item label="營業時間" name="businessHours">
            <a-input v-model:value="formState.businessHours" placeholder="例：09:00-21:00" />
          </a-form-item>
          <a-form-item label="排序" name="sortOrder">
            <a-input-number v-model:value="formState.sortOrder" :min="0" />
          </a-form-item>
          <a-form-item label="主要據點" name="main">
            <a-switch v-model:checked="formState.main" />
          </a-form-item>
          <a-form-item label="狀態" name="active">
            <a-switch
              v-model:checked="formState.active"
              checked-children="啟用"
              un-checked-children="停用"
            />
          </a-form-item>
          <a-form-item label="備註" name="notes">
            <a-textarea v-model:value="formState.notes" :rows="3" />
          </a-form-item>

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
import { getStore, createStore, updateStore } from '@/api/stores'
import type { StoreRequest } from '@/types'

const router = useRouter()
const route = useRoute()
const isEdit = computed(() => !!route.params.id)
const storeId = computed(() => Number(route.params.id))

const loading = ref(false)
const submitting = ref(false)

const formState = reactive<StoreRequest>({
  code: '',
  name: '',
  type: 'STORE',
  address: '',
  phone: '',
  email: '',
  businessHours: '',
  main: false,
  active: true,
  sortOrder: 0,
  notes: '',
})

const rules: Record<string, Rule[]> = {
  code: [{ required: true, message: '請輸入代碼', trigger: 'blur' }],
  name: [{ required: true, message: '請輸入名稱', trigger: 'blur' }],
}

const loadStore = async (): Promise<void> => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const store = await getStore(storeId.value)
    Object.assign(formState, store)
  } catch (error) {
    console.error('載入資料失敗:', error)
    router.push('/stores/list')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (): Promise<void> => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateStore(storeId.value, formState)
      message.success('更新成功')
    } else {
      await createStore(formState)
      message.success('新增成功')
    }
    router.push('/stores/list')
  } catch (error) {
    console.error('提交失敗:', error)
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.push('/stores/list')
}

onMounted(() => loadStore())
</script>
