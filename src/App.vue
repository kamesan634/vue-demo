<!--
  App.vue - 應用程式根組件
  負責提供全域配置和路由視圖容器
-->
<template>
  <!--
    ConfigProvider: Ant Design Vue 配置提供者
    用於設定全域主題和語系
  -->
  <a-config-provider :locale="zhTW" :theme="themeConfig">
    <!-- 路由視圖容器 -->
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
/**
 * 應用程式根組件
 * 配置 Ant Design Vue 的主題和語系
 */
import { computed } from 'vue'
import zhTW from 'ant-design-vue/es/locale/zh_TW'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

// 主題配置
const themeConfig = computed<ThemeConfig>(() => ({
  token: {
    // 主色調
    colorPrimary: '#1890ff',
    // 成功色
    colorSuccess: '#52c41a',
    // 警告色
    colorWarning: '#faad14',
    // 錯誤色
    colorError: '#f5222d',
    // 圓角
    borderRadius: 6,
    // 字體大小
    fontSize: 14,
  },
  components: {
    // 表格組件配置
    Table: {
      headerBg: '#fafafa',
    },
    // 佈局組件配置
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
    },
  },
}))
</script>

<style>
/* 確保應用程式佔滿整個視窗 */
#app {
  width: 100%;
  height: 100%;
}
</style>
