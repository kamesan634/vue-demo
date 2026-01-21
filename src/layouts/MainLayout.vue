<!--
  MainLayout.vue - 主要佈局組件
  包含側邊欄、頂部導航列和主要內容區域
-->
<template>
  <a-layout class="main-layout">
    <!-- 側邊欄 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :width="256"
      :collapsed-width="80"
      collapsible
      :trigger="null"
      class="main-sider"
    >
      <!-- Logo 區域 -->
      <div class="logo">
        <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
        <span v-if="!collapsed" class="logo-text">龜三的ERP Demo</span>
      </div>

      <!-- 導航選單 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="collapsed"
        @click="handleMenuClick"
      >
        <!-- 儀表板 -->
        <a-menu-item key="dashboard">
          <template #icon><DashboardOutlined /></template>
          <span>儀表板</span>
        </a-menu-item>

        <!-- 商品管理 -->
        <a-sub-menu key="products">
          <template #icon><ShoppingOutlined /></template>
          <template #title>商品管理</template>
          <a-menu-item key="products-list">商品列表</a-menu-item>
          <a-menu-item key="products-create">新增商品</a-menu-item>
        </a-sub-menu>

        <!-- 分類管理 -->
        <a-menu-item key="categories">
          <template #icon><AppstoreOutlined /></template>
          <span>分類管理</span>
        </a-menu-item>

        <!-- 基礎設定 -->
        <a-sub-menu key="settings">
          <template #icon><SettingOutlined /></template>
          <template #title>基礎設定</template>
          <a-menu-item key="settings-units">單位管理</a-menu-item>
          <a-menu-item key="settings-tax-types">稅別管理</a-menu-item>
        </a-sub-menu>

        <!-- 客戶管理 -->
        <a-sub-menu key="customers">
          <template #icon><UserOutlined /></template>
          <template #title>客戶管理</template>
          <a-menu-item key="customers-list">客戶列表</a-menu-item>
          <a-menu-item key="customers-create">新增客戶</a-menu-item>
        </a-sub-menu>

        <!-- 訂單管理 -->
        <a-sub-menu key="orders">
          <template #icon><ShoppingCartOutlined /></template>
          <template #title>訂單管理</template>
          <a-menu-item key="orders-list">訂單列表</a-menu-item>
          <a-menu-item key="orders-create">新增訂單</a-menu-item>
        </a-sub-menu>

        <!-- 門市/倉庫 -->
        <a-sub-menu key="stores">
          <template #icon><ShopOutlined /></template>
          <template #title>門市/倉庫</template>
          <a-menu-item key="stores-list">門市/倉庫列表</a-menu-item>
          <a-menu-item key="stores-create">新增門市/倉庫</a-menu-item>
        </a-sub-menu>

        <!-- 庫存管理 -->
        <a-sub-menu key="inventory">
          <template #icon><DatabaseOutlined /></template>
          <template #title>庫存管理</template>
          <a-menu-item key="inventory-list">庫存查詢</a-menu-item>
          <a-menu-item key="inventory-adjust">庫存調整</a-menu-item>
          <a-menu-item key="inventory-movements">異動記錄</a-menu-item>
          <a-menu-item key="inventory-low-stock">低庫存警示</a-menu-item>
        </a-sub-menu>

        <!-- 供應商管理 -->
        <a-sub-menu key="suppliers">
          <template #icon><TeamOutlined /></template>
          <template #title>供應商管理</template>
          <a-menu-item key="suppliers-list">供應商列表</a-menu-item>
          <a-menu-item key="suppliers-create">新增供應商</a-menu-item>
        </a-sub-menu>

        <!-- 促銷管理 -->
        <a-sub-menu key="promotions">
          <template #icon><GiftOutlined /></template>
          <template #title>促銷管理</template>
          <a-menu-item key="promotions-list">促銷活動</a-menu-item>
          <a-menu-item key="promotions-create">新增促銷</a-menu-item>
        </a-sub-menu>

        <!-- 優惠券管理 -->
        <a-sub-menu key="coupons">
          <template #icon><TagOutlined /></template>
          <template #title>優惠券管理</template>
          <a-menu-item key="coupons-list">優惠券列表</a-menu-item>
          <a-menu-item key="coupons-create">新增優惠券</a-menu-item>
        </a-sub-menu>

        <!-- 報表分析 -->
        <a-sub-menu key="reports">
          <template #icon><BarChartOutlined /></template>
          <template #title>報表分析</template>
          <a-menu-item key="reports-sales">銷售報表</a-menu-item>
          <a-menu-item key="reports-profit">利潤分析</a-menu-item>
        </a-sub-menu>

        <!-- 系統管理（僅管理員） -->
        <a-sub-menu v-if="authStore.isAdmin" key="system">
          <template #icon><ToolOutlined /></template>
          <template #title>系統管理</template>
          <a-menu-item key="system-parameters">系統參數</a-menu-item>
          <a-menu-item key="system-audit-logs">稽核日誌</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>

    <!-- 右側內容區域 -->
    <a-layout class="main-content-layout">
      <!-- 頂部導航列 -->
      <a-layout-header class="main-header">
        <!-- 左側：收合按鈕 -->
        <div class="header-left">
          <a-button type="text" class="trigger" @click="toggleCollapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>

          <!-- 麵包屑導航 -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item>
              <router-link to="/">首頁</router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <!-- 右側：使用者資訊 -->
        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="32" style="background-color: #1890ff">
                {{ authStore.displayName?.charAt(0) }}
              </a-avatar>
              <span class="user-name">{{ authStore.displayName }}</span>
              <DownOutlined />
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  <span class="ml-8">個人資料</span>
                </a-menu-item>
                <a-menu-item key="password">
                  <LockOutlined />
                  <span class="ml-8">修改密碼</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  <span class="ml-8">登出</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 主要內容區域 -->
      <a-layout-content class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </a-layout-content>

      <!-- 頁尾 -->
      <a-layout-footer class="main-footer">
        龜三的ERP Demo &copy; {{ new Date().getFullYear() }} | Vue 3 + TypeScript + Ant Design Vue
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
/**
 * 主要佈局組件
 * 提供側邊欄導航、頂部導航列和主要內容區域
 */
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useAppStore } from '@/stores'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  DatabaseOutlined,
  TeamOutlined,
  GiftOutlined,
  TagOutlined,
  BarChartOutlined,
  ToolOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue'

// ================================
// Store 和 Router
// ================================

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

// ================================
// 狀態
// ================================

/** 側邊欄收合狀態 */
const collapsed = ref(appStore.sidebarCollapsed)

/** 選中的選單項目 */
const selectedKeys = ref<string[]>([])

/** 展開的選單項目 */
const openKeys = ref<string[]>([])

// ================================
// 計算屬性
// ================================

/** 麵包屑路徑 */
const breadcrumbs = computed(() => {
  const matched = route.matched.filter((item) => item.meta?.title)
  return matched.slice(1).map((item) => ({
    title: item.meta.title as string,
    path: item.path,
  }))
})

// ================================
// 方法
// ================================

/**
 * 切換側邊欄收合狀態
 */
const toggleCollapsed = (): void => {
  collapsed.value = !collapsed.value
  appStore.setSidebarCollapsed(collapsed.value)
}

/**
 * 處理選單點擊
 * @param info - 選單點擊資訊
 */
const handleMenuClick = (info: { key: string }): void => {
  // 根據選單 key 進行路由跳轉
  const routeMap: Record<string, string> = {
    dashboard: '/dashboard',
    'products-list': '/products/list',
    'products-create': '/products/create',
    categories: '/categories',
    'settings-units': '/settings/units',
    'settings-tax-types': '/settings/tax-types',
    'customers-list': '/customers/list',
    'customers-create': '/customers/create',
    'orders-list': '/orders/list',
    'orders-create': '/orders/create',
    'stores-list': '/stores/list',
    'stores-create': '/stores/create',
    'inventory-list': '/inventory/list',
    'inventory-adjust': '/inventory/adjust',
    'inventory-movements': '/inventory/movements',
    'inventory-low-stock': '/inventory/low-stock',
    'suppliers-list': '/suppliers/list',
    'suppliers-create': '/suppliers/create',
    'promotions-list': '/promotions/list',
    'promotions-create': '/promotions/create',
    'coupons-list': '/coupons/list',
    'coupons-create': '/coupons/create',
    'reports-sales': '/reports/sales',
    'reports-profit': '/reports/profit',
    'system-parameters': '/system/parameters',
    'system-audit-logs': '/system/audit-logs',
  }

  const path = routeMap[info.key]
  if (path) {
    router.push(path)
  }
}

/**
 * 處理登出
 */
const handleLogout = async (): Promise<void> => {
  await authStore.logout()
}

/**
 * 根據當前路由更新選單狀態
 */
const updateMenuState = (): void => {
  const path = route.path

  // 根據路徑設定選中的選單項目
  if (path === '/dashboard') {
    selectedKeys.value = ['dashboard']
    openKeys.value = []
  } else if (path.startsWith('/products')) {
    selectedKeys.value = [path === '/products/create' ? 'products-create' : 'products-list']
    openKeys.value = ['products']
  } else if (path === '/categories') {
    selectedKeys.value = ['categories']
    openKeys.value = []
  } else if (path.startsWith('/settings')) {
    selectedKeys.value = [path === '/settings/tax-types' ? 'settings-tax-types' : 'settings-units']
    openKeys.value = ['settings']
  } else if (path.startsWith('/customers')) {
    selectedKeys.value = [path === '/customers/create' ? 'customers-create' : 'customers-list']
    openKeys.value = ['customers']
  } else if (path.startsWith('/orders')) {
    selectedKeys.value = [path === '/orders/create' ? 'orders-create' : 'orders-list']
    openKeys.value = ['orders']
  } else if (path.startsWith('/stores')) {
    selectedKeys.value = [path === '/stores/create' ? 'stores-create' : 'stores-list']
    openKeys.value = ['stores']
  } else if (path.startsWith('/inventory')) {
    if (path === '/inventory/adjust') {
      selectedKeys.value = ['inventory-adjust']
    } else if (path === '/inventory/movements') {
      selectedKeys.value = ['inventory-movements']
    } else if (path === '/inventory/low-stock') {
      selectedKeys.value = ['inventory-low-stock']
    } else {
      selectedKeys.value = ['inventory-list']
    }
    openKeys.value = ['inventory']
  } else if (path.startsWith('/suppliers')) {
    selectedKeys.value = [path === '/suppliers/create' ? 'suppliers-create' : 'suppliers-list']
    openKeys.value = ['suppliers']
  } else if (path.startsWith('/promotions')) {
    selectedKeys.value = [path === '/promotions/create' ? 'promotions-create' : 'promotions-list']
    openKeys.value = ['promotions']
  } else if (path.startsWith('/coupons')) {
    selectedKeys.value = [path === '/coupons/create' ? 'coupons-create' : 'coupons-list']
    openKeys.value = ['coupons']
  } else if (path.startsWith('/reports')) {
    selectedKeys.value = [path === '/reports/profit' ? 'reports-profit' : 'reports-sales']
    openKeys.value = ['reports']
  } else if (path.startsWith('/system')) {
    selectedKeys.value = [path === '/system/audit-logs' ? 'system-audit-logs' : 'system-parameters']
    openKeys.value = ['system']
  }
}

// ================================
// 生命週期
// ================================

// 初始化選單狀態
onMounted(() => {
  updateMenuState()
})

// 監聽路由變化
watch(
  () => route.path,
  () => {
    updateMenuState()
  }
)
</script>

<style lang="less" scoped>
/* 主要佈局樣式 */
.main-layout {
  min-height: 100vh;
}

/* 側邊欄樣式 */
.main-sider {
  overflow: auto;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

/* Logo 區域 */
.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(255, 255, 255, 0.1);

  .logo-img {
    width: 32px;
    height: 32px;
  }

  .logo-text {
    margin-left: 12px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }
}

/* 內容區域佈局 */
.main-content-layout {
  margin-left: 256px;
  transition: margin-left 0.2s;
}

.main-sider.ant-layout-sider-collapsed + .main-content-layout {
  margin-left: 80px;
}

/* 頂部導航列 */
.main-header {
  position: sticky;
  top: 0;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
  }

  .trigger {
    font-size: 18px;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #1890ff;
    }
  }

  .breadcrumb {
    margin-left: 16px;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 0 8px;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }

    .user-name {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* 主要內容區域 */
.main-content {
  margin: 24px;
  min-height: calc(100vh - 64px - 70px - 48px);
}

/* 頁尾 */
.main-footer {
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  background: transparent;
}

/* 響應式設計 */
@media screen and (max-width: 768px) {
  .main-content-layout {
    margin-left: 0;
  }

  .main-sider {
    position: absolute;
    z-index: 200;
  }

  .breadcrumb {
    display: none;
  }

  .user-name {
    display: none;
  }
}
</style>
