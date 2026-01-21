<!--
  Error/403.vue - 403 無權限頁面
-->
<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <LockOutlined />
      </div>
      <h1 class="error-code">403</h1>
      <h2 class="error-title">存取被拒絕</h2>
      <p class="error-description">抱歉，您沒有權限訪問此頁面。請聯繫系統管理員。</p>
      <div class="error-actions">
        <a-button type="primary" size="large" @click="goHome">
          <HomeOutlined /> 返回首頁
        </a-button>
        <a-button size="large" @click="goBack">
          <ArrowLeftOutlined /> 返回上一頁
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LockOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 返回首頁
const goHome = (): void => {
  router.push('/')
}

// 返回上一頁
const goBack = (): void => {
  router.back()
}
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.error-content {
  text-align: center;
  color: #fff;
  padding: 40px;
}

.error-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.8;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  margin: 0;
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.error-title {
  font-size: 32px;
  font-weight: 500;
  margin: 20px 0 10px;
}

.error-description {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.error-actions .ant-btn {
  min-width: 140px;
}
</style>
