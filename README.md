# 龜三的ERP Demo - Vue Frontend

![CI](https://github.com/kamesan634/vue-demo/actions/workflows/ci.yml/badge.svg)

基於 Vue 3 + TypeScript + Vite DEMO用的零售業 ERP 系統前端應用。

## 技能樹 請點以下技能

| 技能 | 版本 | 說明 |
|------|------|------|
| Vue | 3.5 | 前端框架 |
| TypeScript | 5.6 | 程式語言 |
| Vite | 6.0 | 建構工具 |
| Pinia | 2.3 | 狀態管理 |
| Vue Router | 4.5 | 路由管理 |
| Ant Design Vue | 4.2 | UI 元件庫 |
| Axios | 1.7 | HTTP 請求 |
| ECharts | 5.5 | 圖表庫 |
| Less | 4.2 | CSS 預處理器 |
| ESLint | 9.17 | 程式碼檢查 |
| Prettier | 3.4 | 程式碼格式化 |

## 功能模組

- **儀表板** - 銷售概況、統計圖表、熱銷商品
- **商品管理** - 商品、分類、單位、稅別 CRUD
- **客戶管理** - 會員資料、會員等級、積分管理
- **訂單管理** - 訂單建立、查詢、狀態追蹤
- **門市/倉庫管理** - 據點管理、類型設定
- **庫存管理** - 庫存查詢、調整、異動記錄、低庫存警示
- **供應商管理** - 供應商資料、付款條件
- **促銷管理** - 促銷活動、優惠券
- **報表** - 銷售報表、利潤報表
- **系統管理** - 系統參數、稽核日誌

## 快速開始

### 環境需求

- Node.js 18+
- npm 或 pnpm

### 安裝

```bash
# 複製 .env 檔案
cp .env.example .env

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 指令說明

```bash
# 開發模式
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview

# 程式碼檢查
npm run lint

# 程式碼格式化
npm run format

# 類型檢查
npm run type-check
```

## Port

| 服務 | Port | 說明 |
|------|------|------|
| Vue Dev Server | 5173 | 前端開發伺服器 |
| Spring Boot API | 8005 | 後端 API 服務 |

## 環境變數

| 變數 | 預設值 | 說明 |
|------|--------|------|
| VITE_API_BASE_URL | http://localhost:8005/api/v1 | API 基礎路徑 |
| VITE_APP_TITLE | 龜三的ERP Demo | 系統標題 |

## 測試帳號

所有帳號的密碼都是：`password123`

| 帳號 | 角色 | 說明 |
|------|------|------|
| admin | 系統管理員 | 擁有所有權限 |
| manager01 | 門市店長 | 門市管理權限 |
| cashier01 | 收銀員 | 收銀台操作權限 |
| cashier02 | 收銀員 | 收銀台操作權限 |
| warehouse01 | 倉管人員 | 倉庫管理權限 |

## 專案結構

```
vue-demo/
├── .env.example              # 環境變數範例
├── .eslintrc.js              # ESLint 配置
├── .prettierrc.json          # Prettier 配置
├── index.html                # HTML 入口
├── package.json              # 依賴配置
├── tsconfig.json             # TypeScript 配置
├── vite.config.ts            # Vite 配置
├── public/
│   └── favicon.svg           # 網站圖示
├── src/
│   ├── main.ts               # 應用程式入口
│   ├── App.vue               # 根元件
│   ├── vite-env.d.ts         # Vite 類型宣告
│   ├── api/                  # API 服務
│   │   ├── auth.ts           # 認證 API
│   │   ├── products.ts       # 商品 API
│   │   ├── categories.ts     # 分類 API
│   │   ├── units.ts          # 單位 API
│   │   ├── taxTypes.ts       # 稅別 API
│   │   ├── customers.ts      # 客戶 API
│   │   ├── orders.ts         # 訂單 API
│   │   ├── stores.ts         # 門市 API
│   │   ├── inventory.ts      # 庫存 API
│   │   ├── suppliers.ts      # 供應商 API
│   │   ├── promotions.ts     # 促銷 API
│   │   ├── coupons.ts        # 優惠券 API
│   │   ├── reports.ts        # 報表 API
│   │   └── system.ts         # 系統 API
│   ├── assets/
│   │   ├── logo.svg          # Logo 圖片
│   │   └── styles/
│   │       └── main.less     # 全域樣式
│   ├── layouts/
│   │   └── MainLayout.vue    # 主要佈局
│   ├── router/
│   │   └── index.ts          # 路由配置
│   ├── stores/
│   │   ├── auth.ts           # 認證狀態
│   │   └── app.ts            # 應用狀態
│   ├── types/
│   │   └── index.ts          # TypeScript 類型定義
│   ├── utils/
│   │   └── request.ts        # Axios 請求封裝
│   └── views/
│       ├── auth/
│       │   └── Login.vue     # 登入頁面
│       ├── dashboard/
│       │   └── Index.vue     # 儀表板
│       ├── products/
│       │   ├── List.vue      # 商品列表
│       │   └── Form.vue      # 商品表單
│       ├── categories/
│       │   └── Index.vue     # 分類管理
│       ├── units/
│       │   └── Index.vue     # 單位管理
│       ├── taxTypes/
│       │   └── Index.vue     # 稅別管理
│       ├── customers/
│       │   ├── List.vue      # 客戶列表
│       │   ├── Form.vue      # 客戶表單
│       │   └── Detail.vue    # 客戶詳情
│       ├── orders/
│       │   ├── List.vue      # 訂單列表
│       │   ├── Form.vue      # 訂單表單
│       │   └── Detail.vue    # 訂單詳情
│       ├── stores/
│       │   ├── List.vue      # 門市列表
│       │   └── Form.vue      # 門市表單
│       ├── inventory/
│       │   ├── List.vue      # 庫存查詢
│       │   ├── Adjust.vue    # 庫存調整
│       │   ├── Movements.vue # 異動記錄
│       │   └── LowStock.vue  # 低庫存警示
│       ├── suppliers/
│       │   ├── List.vue      # 供應商列表
│       │   └── Form.vue      # 供應商表單
│       ├── promotions/
│       │   ├── List.vue      # 促銷列表
│       │   └── Form.vue      # 促銷表單
│       ├── coupons/
│       │   ├── List.vue      # 優惠券列表
│       │   └── Form.vue      # 優惠券表單
│       ├── reports/
│       │   ├── Sales.vue     # 銷售報表
│       │   └── Profit.vue    # 利潤報表
│       ├── system/
│       │   ├── Parameters.vue # 系統參數
│       │   └── AuditLogs.vue # 稽核日誌
│       └── error/
│           ├── 404.vue       # 404 頁面
│           └── 403.vue       # 403 頁面
```

## 功能說明

### JWT Token 自動更新

系統實作了 JWT Token 自動刷新機制：

1. Access Token 過期時自動使用 Refresh Token 取得新的 Token
2. 多個請求同時失敗時，只會發送一次刷新請求
3. 刷新成功後自動重試失敗的請求
4. Refresh Token 過期時自動登出

### 權限控制

- 路由層級的權限檢查
- 角色為基礎的存取控制 (RBAC)
- 無權限頁面自動跳轉 403

### 響應式設計

- 支援桌面版和平板版
- 側邊欄可收合
- 表格自適應寬度

## 常見問題

### Q: 無法連接 API？

1. 確認後端服務已啟動（Port 8005）
2. 確認 `.env` 中的 `VITE_API_BASE_URL` 設定正確
3. 檢查瀏覽器控制台的錯誤訊息

### Q: 登入後被登出？

1. 確認後端的 JWT 金鑰設定正確
2. 檢查 Token 是否過期
3. 清除瀏覽器 localStorage 後重新登入

### Q: 建構失敗？

1. 確認 Node.js 版本為 18+
2. 刪除 `node_modules` 後重新安裝依賴
3. 執行 `npm run type-check` 檢查類型錯誤

## 相關專案

- [springbootapi-demo](https://github.com/kamesan634/springbootapi-demo) - 後端 API 專案

## License

MIT License
我一開始以為是Made In Taiwan 咧！(羞
