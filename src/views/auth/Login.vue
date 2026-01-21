<!--
  Login.vue - 登入頁面
  提供使用者登入功能
-->
<template>
  <div class="login-container">
    <!-- 登入卡片 -->
    <div class="login-card">
      <!-- Logo 和標題 -->
      <div class="login-header">
        <img src="@/assets/logo.svg" alt="Logo" class="login-logo" />
        <h1 class="login-title">龜三的ERP Demo</h1>
        <p class="login-subtitle">零售業 ERP 系統</p>
      </div>

      <!-- 登入表單 -->
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <!-- 帳號 -->
        <a-form-item name="username" label="帳號">
          <a-input
            v-model:value="formState.username"
            size="large"
            placeholder="請輸入帳號"
            :prefix="h(UserOutlined)"
            allow-clear
          />
        </a-form-item>

        <!-- 密碼 -->
        <a-form-item name="password" label="密碼">
          <a-input-password
            v-model:value="formState.password"
            size="large"
            placeholder="請輸入密碼"
            :prefix="h(LockOutlined)"
            allow-clear
          />
        </a-form-item>

        <!-- 記住我 -->
        <a-form-item>
          <a-checkbox v-model:checked="rememberMe">記住我</a-checkbox>
        </a-form-item>

        <!-- 登入按鈕 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            登入
          </a-button>
        </a-form-item>
      </a-form>

      <!-- 測試帳號提示 -->
      <div class="test-accounts">
        <a-divider>測試帳號</a-divider>
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="管理員">admin / password123</a-descriptions-item>
          <a-descriptions-item label="店長">manager01 / password123</a-descriptions-item>
          <a-descriptions-item label="收銀員">cashier01 / password123</a-descriptions-item>
        </a-descriptions>
      </div>
    </div>

    <!-- 頁尾 -->
    <div class="login-footer">
      &copy; {{ new Date().getFullYear() }} 龜三的ERP Demo | Vue 3 + TypeScript + Ant Design Vue
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登入頁面組件
 * 處理使用者登入邏輯
 */
import { ref, reactive, h, onMounted } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { Rule } from 'ant-design-vue/es/form'
import type { FormInstance } from 'ant-design-vue'
import { useAuthStore } from '@/stores'

// ================================
// Store
// ================================

const authStore = useAuthStore()

// ================================
// 狀態
// ================================

/** 表單參照 */
const formRef = ref<FormInstance>()

/** 表單資料 */
const formState = reactive({
  username: '',
  password: '',
})

/** 記住我 */
const rememberMe = ref(false)

/** 載入中狀態 */
const loading = ref(false)

// ================================
// 表單驗證規則
// ================================

const rules: Record<string, Rule[]> = {
  username: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 2, max: 50, message: '帳號長度必須在 2-50 個字元之間', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, max: 100, message: '密碼長度必須在 6-100 個字元之間', trigger: 'blur' },
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
    await authStore.login({
      username: formState.username,
      password: formState.password,
    })

    // 如果勾選記住我，儲存帳號
    if (rememberMe.value) {
      localStorage.setItem('rememberedUsername', formState.username)
    } else {
      localStorage.removeItem('rememberedUsername')
    }

    message.success('登入成功')
  } catch (error) {
    // 錯誤已在 request 攔截器中處理
    console.error('登入失敗:', error)
  } finally {
    loading.value = false
  }
}

// ================================
// 生命週期
// ================================

onMounted(() => {
  // 檢查是否有記住的帳號
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  if (rememberedUsername) {
    formState.username = rememberedUsername
    rememberMe.value = true
  }
})
</script>

<style lang="less" scoped>
/* 登入頁面容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

/* 登入卡片 */
.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* 登入標題區域 */
.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  .login-title {
    font-size: 24px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
    margin: 0 0 8px 0;
  }

  .login-subtitle {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.45);
    margin: 0;
  }
}

/* 測試帳號區域 */
.test-accounts {
  margin-top: 24px;

  :deep(.ant-divider) {
    margin: 16px 0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
  }

  :deep(.ant-descriptions-item-label) {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  :deep(.ant-descriptions-item-content) {
    font-size: 12px;
    font-family: 'Courier New', monospace;
  }
}

/* 頁尾 */
.login-footer {
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  text-align: center;
}

/* 響應式設計 */
@media screen and (max-width: 480px) {
  .login-card {
    padding: 24px;
  }

  .login-header {
    .login-logo {
      width: 48px;
      height: 48px;
    }

    .login-title {
      font-size: 20px;
    }
  }
}
</style>
