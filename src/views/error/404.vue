<!--
  Error/404.vue - 404 找不到頁面
-->
<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-icon">
        <FileSearchOutlined />
      </div>
      <h1 class="error-code">404</h1>
      <h2 class="error-title">頁面不存在</h2>
      <p class="error-description">抱歉，您訪問的頁面不存在或已被移除。</p>
      <div class="error-actions">
        <a-button type="primary" size="large" @click="goHome"> <HomeOutlined /> 返回首頁 </a-button>
        <a-button size="large" @click="goBack"> <ArrowLeftOutlined /> 返回上一頁 </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FileSearchOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'

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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
