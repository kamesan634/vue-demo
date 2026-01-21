/**
 * 應用程式主入口文件
 * 初始化 Vue 應用程式並掛載所有必要的插件
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Antd from 'ant-design-vue'
import App from './App.vue'
import router from './router'

// ECharts 配置
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'

// 註冊 ECharts 必要的組件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

// 引入全域樣式
import './assets/styles/main.less'

// 建立 Vue 應用程式實例
const app = createApp(App)

// 建立 Pinia 狀態管理實例
const pinia = createPinia()
// 使用持久化插件（將狀態儲存至 localStorage）
pinia.use(piniaPluginPersistedstate)

// 掛載插件
app.use(pinia) // Pinia 狀態管理
app.use(router) // Vue Router 路由管理
app.use(Antd) // Ant Design Vue UI 框架

// 掛載應用程式到 DOM
app.mount('#app')
