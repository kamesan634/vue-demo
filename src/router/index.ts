/**
 * Vue Router 路由配置
 * 定義應用程式的所有路由和導航守衛
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// ================================
// 佈局組件
// ================================

// 主要佈局（含側邊欄和頂部導航）
const MainLayout = () => import('@/layouts/MainLayout.vue')

// ================================
// 路由定義
// ================================

const routes: RouteRecordRaw[] = [
  // 登入頁面
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登入',
      requiresAuth: false,
    },
  },

  // 修改密碼頁面
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/auth/ChangePassword.vue'),
    meta: {
      title: '修改密碼',
      requiresAuth: true,
    },
  },

  // 主要應用程式路由（需要登入）
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      // ================================
      // 儀表板
      // ================================
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '儀表板',
          icon: 'DashboardOutlined',
        },
      },

      // ================================
      // 商品管理
      // ================================
      {
        path: 'products',
        name: 'Products',
        redirect: '/products/list',
        meta: {
          title: '商品管理',
          icon: 'ShoppingOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/products/List.vue'),
            meta: { title: '商品列表' },
          },
          {
            path: 'create',
            name: 'ProductCreate',
            component: () => import('@/views/products/Form.vue'),
            meta: { title: '新增商品' },
          },
          {
            path: ':id/edit',
            name: 'ProductEdit',
            component: () => import('@/views/products/Form.vue'),
            meta: { title: '編輯商品' },
          },
        ],
      },

      // ================================
      // 分類管理
      // ================================
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/Index.vue'),
        meta: {
          title: '分類管理',
          icon: 'AppstoreOutlined',
        },
      },

      // ================================
      // 基礎設定（單位、稅別）
      // ================================
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/settings/units',
        meta: {
          title: '基礎設定',
          icon: 'SettingOutlined',
        },
        children: [
          {
            path: 'units',
            name: 'Units',
            component: () => import('@/views/units/Index.vue'),
            meta: { title: '單位管理' },
          },
          {
            path: 'tax-types',
            name: 'TaxTypes',
            component: () => import('@/views/taxTypes/Index.vue'),
            meta: { title: '稅別管理' },
          },
        ],
      },

      // ================================
      // 客戶管理
      // ================================
      {
        path: 'customers',
        name: 'Customers',
        redirect: '/customers/list',
        meta: {
          title: '客戶管理',
          icon: 'UserOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('@/views/customers/List.vue'),
            meta: { title: '客戶列表' },
          },
          {
            path: 'create',
            name: 'CustomerCreate',
            component: () => import('@/views/customers/Form.vue'),
            meta: { title: '新增客戶' },
          },
          {
            path: ':id/edit',
            name: 'CustomerEdit',
            component: () => import('@/views/customers/Form.vue'),
            meta: { title: '編輯客戶' },
          },
          {
            path: ':id/detail',
            name: 'CustomerDetail',
            component: () => import('@/views/customers/Detail.vue'),
            meta: { title: '客戶詳情' },
          },
        ],
      },

      // ================================
      // 訂單管理
      // ================================
      {
        path: 'orders',
        name: 'Orders',
        redirect: '/orders/list',
        meta: {
          title: '訂單管理',
          icon: 'ShoppingCartOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('@/views/orders/List.vue'),
            meta: { title: '訂單列表' },
          },
          {
            path: 'create',
            name: 'OrderCreate',
            component: () => import('@/views/orders/Form.vue'),
            meta: { title: '新增訂單' },
          },
          {
            path: ':id/detail',
            name: 'OrderDetail',
            component: () => import('@/views/orders/Detail.vue'),
            meta: { title: '訂單詳情' },
          },
        ],
      },

      // ================================
      // 門市/倉庫管理
      // ================================
      {
        path: 'stores',
        name: 'Stores',
        redirect: '/stores/list',
        meta: {
          title: '門市/倉庫',
          icon: 'ShopOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'StoreList',
            component: () => import('@/views/stores/List.vue'),
            meta: { title: '門市/倉庫列表' },
          },
          {
            path: 'create',
            name: 'StoreCreate',
            component: () => import('@/views/stores/Form.vue'),
            meta: { title: '新增門市/倉庫' },
          },
          {
            path: ':id/edit',
            name: 'StoreEdit',
            component: () => import('@/views/stores/Form.vue'),
            meta: { title: '編輯門市/倉庫' },
          },
        ],
      },

      // ================================
      // 庫存管理
      // ================================
      {
        path: 'inventory',
        name: 'Inventory',
        redirect: '/inventory/list',
        meta: {
          title: '庫存管理',
          icon: 'DatabaseOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'InventoryList',
            component: () => import('@/views/inventory/List.vue'),
            meta: { title: '庫存查詢' },
          },
          {
            path: 'adjust',
            name: 'InventoryAdjust',
            component: () => import('@/views/inventory/Adjust.vue'),
            meta: { title: '庫存調整' },
          },
          {
            path: 'movements',
            name: 'InventoryMovements',
            component: () => import('@/views/inventory/Movements.vue'),
            meta: { title: '異動記錄' },
          },
          {
            path: 'low-stock',
            name: 'LowStock',
            component: () => import('@/views/inventory/LowStock.vue'),
            meta: { title: '低庫存警示' },
          },
        ],
      },

      // ================================
      // 供應商管理
      // ================================
      {
        path: 'suppliers',
        name: 'Suppliers',
        redirect: '/suppliers/list',
        meta: {
          title: '供應商管理',
          icon: 'TeamOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'SupplierList',
            component: () => import('@/views/suppliers/List.vue'),
            meta: { title: '供應商列表' },
          },
          {
            path: 'create',
            name: 'SupplierCreate',
            component: () => import('@/views/suppliers/Form.vue'),
            meta: { title: '新增供應商' },
          },
          {
            path: ':id/edit',
            name: 'SupplierEdit',
            component: () => import('@/views/suppliers/Form.vue'),
            meta: { title: '編輯供應商' },
          },
        ],
      },

      // ================================
      // 促銷管理
      // ================================
      {
        path: 'promotions',
        name: 'Promotions',
        redirect: '/promotions/list',
        meta: {
          title: '促銷管理',
          icon: 'GiftOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'PromotionList',
            component: () => import('@/views/promotions/List.vue'),
            meta: { title: '促銷活動' },
          },
          {
            path: 'create',
            name: 'PromotionCreate',
            component: () => import('@/views/promotions/Form.vue'),
            meta: { title: '新增促銷' },
          },
          {
            path: ':id/edit',
            name: 'PromotionEdit',
            component: () => import('@/views/promotions/Form.vue'),
            meta: { title: '編輯促銷' },
          },
        ],
      },

      // ================================
      // 優惠券管理
      // ================================
      {
        path: 'coupons',
        name: 'Coupons',
        redirect: '/coupons/list',
        meta: {
          title: '優惠券管理',
          icon: 'TagOutlined',
        },
        children: [
          {
            path: 'list',
            name: 'CouponList',
            component: () => import('@/views/coupons/List.vue'),
            meta: { title: '優惠券列表' },
          },
          {
            path: 'create',
            name: 'CouponCreate',
            component: () => import('@/views/coupons/Form.vue'),
            meta: { title: '新增優惠券' },
          },
          {
            path: ':id/edit',
            name: 'CouponEdit',
            component: () => import('@/views/coupons/Form.vue'),
            meta: { title: '編輯優惠券' },
          },
        ],
      },

      // ================================
      // 報表
      // ================================
      {
        path: 'reports',
        name: 'Reports',
        redirect: '/reports/sales',
        meta: {
          title: '報表分析',
          icon: 'BarChartOutlined',
        },
        children: [
          {
            path: 'sales',
            name: 'SalesReport',
            component: () => import('@/views/reports/Sales.vue'),
            meta: { title: '銷售報表' },
          },
          {
            path: 'profit',
            name: 'ProfitReport',
            component: () => import('@/views/reports/Profit.vue'),
            meta: { title: '利潤分析' },
          },
        ],
      },

      // ================================
      // 系統管理
      // ================================
      {
        path: 'system',
        name: 'System',
        redirect: '/system/parameters',
        meta: {
          title: '系統管理',
          icon: 'ToolOutlined',
          roles: ['ADMIN'],
        },
        children: [
          {
            path: 'parameters',
            name: 'SystemParameters',
            component: () => import('@/views/system/Parameters.vue'),
            meta: { title: '系統參數' },
          },
          {
            path: 'audit-logs',
            name: 'AuditLogs',
            component: () => import('@/views/system/AuditLogs.vue'),
            meta: { title: '稽核日誌' },
          },
        ],
      },
    ],
  },

  // 404 頁面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '頁面不存在',
      requiresAuth: false,
    },
  },
]

// ================================
// 建立路由實例
// ================================

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滾動行為
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// ================================
// 導航守衛
// ================================

/**
 * 全域前置守衛
 * 檢查認證狀態和權限
 */
router.beforeEach((to, _from, next) => {
  // 取得認證 Store
  const authStore = useAuthStore()

  // 設定頁面標題
  const title = to.meta.title as string
  if (title) {
    document.title = `${title} - ${import.meta.env.VITE_APP_TITLE || '龜三的ERP Demo'}`
  }

  // 檢查是否需要認證
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false)

  if (requiresAuth && !authStore.isLoggedIn) {
    // 需要認證但未登入，跳轉到登入頁
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 已登入且訪問登入頁，跳轉到首頁
  if (to.path === '/login' && authStore.isLoggedIn) {
    next('/')
    return
  }

  // 檢查角色權限
  const requiredRoles = to.meta.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    if (!authStore.hasRole(requiredRoles)) {
      // 無權限，跳轉到首頁或顯示錯誤
      next('/')
      return
    }
  }

  next()
})

export default router
