<!--
  ChangePassword.vue - 修改密碼頁面
  首次登入或密碼過期時強制修改密碼
-->
<template>
  <div class="change-password-container">
    <!-- 修改密碼卡片 -->
    <div class="change-password-card">
      <!-- 標題 -->
      <div class="change-password-header">
        <LockOutlined class="header-icon" />
        <h1 class="change-password-title">修改密碼</h1>
        <p class="change-password-subtitle">為了帳號安全，請設定新密碼</p>
      </div>

      <!-- 修改密碼表單 -->
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <!-- 目前密碼 -->
        <a-form-item name="currentPassword" label="目前密碼">
          <a-input-password
            v-model:value="formState.currentPassword"
            size="large"
            placeholder="請輸入目前密碼"
            :prefix="h(LockOutlined)"
            allow-clear
          />
        </a-form-item>

        <!-- 新密碼 -->
        <a-form-item name="newPassword" label="新密碼">
          <a-input-password
            v-model:value="formState.newPassword"
            size="large"
            placeholder="請輸入新密碼（至少 8 個字元）"
            :prefix="h(KeyOutlined)"
            allow-clear
          />
        </a-form-item>

        <!-- 確認新密碼 -->
        <a-form-item name="confirmPassword" label="確認新密碼">
          <a-input-password
            v-model:value="formState.confirmPassword"
            size="large"
            placeholder="請再次輸入新密碼"
            :prefix="h(KeyOutlined)"
            allow-clear
          />
        </a-form-item>

        <!-- 提交按鈕 -->
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            確認修改
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 密碼規則提示 -->
      <div class="password-rules">
        <a-divider>密碼規則</a-divider>
        <ul>
          <li>密碼長度至少 8 個字元</li>
          <li>建議包含大小寫英文字母及數字</li>
          <li>新密碼不可與目前密碼相同</li>
        </ul>
      </div>
    </div>

    <!-- 頁尾 -->
    <div class="change-password-footer">
      &copy; {{ new Date().getFullYear() }} 龜三的ERP Demo | Vue 3 + TypeScript + Ant Design Vue
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 修改密碼頁面組件
 * 處理密碼修改邏輯
 */
import { ref, reactive, h } from 'vue'
import { LockOutlined, KeyOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { changePassword } from '@/api/auth'
import { useAuthStore } from '@/stores'

// ================================
// 路由 & Store
// ================================

const router = useRouter()
const authStore = useAuthStore()

// ================================
// 狀態
// ================================

/** 表單參照 */
const formRef = ref<FormInstance>()

/** 表單資料 */
const formState = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

/** 載入中狀態 */
const loading = ref(false)

// ================================
// 表單驗證規則
// ================================

/** 驗證確認密碼 */
const validateConfirmPassword = async (_rule: Rule, value: string): Promise<void> => {
  if (value && value !== formState.newPassword) {
    throw new Error('兩次輸入的密碼不一致')
  }
}

/** 驗證新密碼不可與目前密碼相同 */
const validateNewPassword = async (_rule: Rule, value: string): Promise<void> => {
  if (value && value === formState.currentPassword) {
    throw new Error('新密碼不可與目前密碼相同')
  }
}

const rules: Record<string, Rule[]> = {
  currentPassword: [{ required: true, message: '請輸入目前密碼', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 8, max: 100, message: '密碼長度必須在 8-100 個字元之間', trigger: 'blur' },
    { validator: validateNewPassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入新密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// ================================
// 方法
// ================================

/**
 * 處理表單提交
 */
const handleSubmit = async (): Promise<void> => {
  loading.value = true

  try {
    const userId = authStore.userInfo?.id
    if (!userId) {
      message.error('無法取得使用者資訊，請重新登入')
      router.push('/login')
      return
    }

    await changePassword(userId, formState.currentPassword, formState.newPassword)

    message.success('密碼修改成功，請重新登入')

    // 清除登入狀態並跳轉到登入頁
    authStore.clearAuth()
    router.push('/login')
  } catch (error) {
    // 錯誤已在 request 攔截器中處理
    console.error('密碼修改失敗:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
/* 修改密碼頁面容器 */
.change-password-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

/* 修改密碼卡片 */
.change-password-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 標題區域 */
.change-password-header {
  text-align: center;
  margin-bottom: 32px;

  .header-icon {
    font-size: 48px;
    color: #1890ff;
    margin-bottom: 16px;
  }

  .change-password-title {
    font-size: 24px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    margin: 0 0 8px 0;
  }

  .change-password-subtitle {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    margin: 0;
  }
}

/* 密碼規則區域 */
.password-rules {
  margin-top: 24px;

  :deep(.ant-divider) {
    margin: 16px 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
  }

  ul {
    margin: 0;
    padding-left: 20px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;

    li {
      margin-bottom: 4px;
    }
  }
}

/* 頁尾 */
.change-password-footer {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  text-align: center;
}

/* 響應式設計 */
@media screen and (max-width: 480px) {
  .change-password-card {
    padding: 24px;
  }

  .change-password-header {
    .header-icon {
      font-size: 40px;
    }

    .change-password-title {
      font-size: 20px;
    }
  }
}
</style>
