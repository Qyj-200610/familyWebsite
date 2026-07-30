# COMPLETED — 已完成功能

> 最后更新：2026-07-30（全项目 debug + 文档更新）

---

## 项目初始化

- [x] Vite 8 + React 19 + TypeScript 脚手架
- [x] ESLint 配置
- [x] 开发服务器端口 5175

---

## API 层 (`src/api/`)

| 文件 | 说明 |
|------|------|
| `client.ts` | Axios 实例封装 — 请求拦截器注入 Bearer Token、响应拦截器解包统一响应格式 + 401 自动清登录态跳转 + 超时处理；`uploadUrl()` 工具函数处理生产/开发环境 URL |
| `types.ts` | 前端 API 类型定义 — `ApiResponse<T>`, `User`, `RegisterRequest`, `LoginRequest`, `AuthResponse`, `UpdateUserRequest`, `FamilyMemberStatus`, `FamilyStatusResponse` |
| `auth.ts` | 认证 API — `register()`, `login()`, `logout()`, `resetPassword()` |
| `user.ts` | 用户 API — `getMe()`, `updateMe()`, `uploadAvatar()` |
| `photo.ts` | 相册 + 照片 API — `albumApi` (创建/列表/详情/删除), `photoApi` (上传/删除/分页) |
| `food.ts` | 美食 API — `submitOrder()` 提交点单并发送邮件通知 |
| `family.ts` | 家谱 API — `getStatus()` 获取家族成员在线状态（2026-07-30 新增） |
| `index.ts` | 统一导出入口 |

## 工具模块 (`src/utils/`)

| 文件 | 说明 |
|------|------|
| `navigate.ts` | SPA 导航工具 — 避免 axios 拦截器与 router 的循环依赖；提供 `navigateTo(path)` 供非组件代码使用，未初始化时降级为 `window.location.href` |

## 项目配置

| 文件 | 说明 |
|------|------|
| `.env.example` | 环境变量模板 — `VITE_API_BASE_URL` 说明（开发留空走代理，生产填写完整 URL） |
| `src/env.d.ts` | TypeScript 类型声明 — `ImportMetaEnv` 接口，为 `VITE_API_BASE_URL` 提供类型提示 |

---

## 状态管理 (`src/store/`)

| 文件 | 说明 |
|------|------|
| `authStore.ts` | Zustand store — `user`, `token`, `isAuthenticated`, `setAuth(user, token, remember?)`, `logout()`；支持 localStorage/sessionStorage 双层级持久化 + 「记住我」 |

---

## 页面 (`src/pages/`)

### 封面页 (App.tsx)
- [x] Nav 导航栏（Logo + 登录/注册入口）
- [x] Hero 区域（标题、描述、CTA 按钮）
- [x] 功能一览卡片（家庭相册/美食专栏/家谱图）
- [x] 已登录用户自动重定向到 /home
- [x] Footer

### 登录页 (Login.tsx)
- [x] 邮箱 + 密码表单
- [x] 前端验证（邮箱格式、密码 >= 6 位）
- [x] 调用 `authApi.login()` 对接后端 `/api/auth/login`
- [x] 登录成功 → 存储 user/token → 跳转 `/home`
- [x] loading 状态 + 服务端错误展示
- [x] "记住我"复选框 — `remember=true` → localStorage 持久化，`remember=false` → sessionStorage

### 注册页 (Register.tsx)
- [x] 用户名 + 邮箱 + 密码 + 确认密码表单
- [x] 前端验证（用户名 >= 2 位、邮箱格式、密码 >= 6 位、两次密码一致）
- [x] 调用 `authApi.register()` 对接后端 `/api/auth/register`
- [x] 注册成功 → 跳转 `/register-success`（不自动登录）
- [x] loading 状态 + 服务端错误展示

### 注册成功页 (RegisterSuccess.tsx)
- [x] 倒计时自动跳转登录页

### 忘记密码页 (ForgetPassword.tsx)
- [x] 邮箱 → 新密码 + 确认密码表单
- [x] 调用 `authApi.resetPassword()` 对接后端 `/api/auth/reset-password`

### Auth 布局组件 (Auth.tsx)
- [x] 左侧装饰面板（Logo + 插图 + tagline）
- [x] 右侧表单区域（title/subtitle/children/footer link）
- [x] 登录/注册页共享复用

### 主页 (Home.tsx)
- [x] 认证守卫 — 未登录自动跳转 `/login`
- [x] 导航栏（Logo + 头像 + 下拉菜单）
- [x] Hero 横幅 — 动态问候语 + 时间段主题 + 时钟
- [x] 快捷入口卡片（家庭相册/美食专栏/家谱图）
- [x] 日程侧边栏（DailyRoutine 组件）

### 家庭相册 (PhotoAlbum.tsx)
- [x] 创建/删除相册
- [x] 上传照片到相册（JPEG/PNG/WebP，最大 10 MB）
- [x] 照片网格浏览
- [x] 照片删除
- [x] 公开/私有相册权限控制

### 美食点单 (FoodOrder.tsx)
- [x] 菜品分类筛选
- [x] 购物车
- [x] 邮件提交通知（QQ SMTP）

### 家谱图 (FamilyTree.tsx)
- [x] 递归子树渲染
- [x] 折叠/展开节点
- [x] 在线状态指示器（绿点/红点 + 脉冲动画）
- [x] 状态图例

### 个人中心 (PersonalCenter.tsx)
- [x] 用户头像 + 用户名 + 邮箱展示
- [x] 加入时间 + 最近登录时间
- [x] 统计卡片（照片/点单/留言/家庭成员计数）
- [x] 最近活动占位

### 设置 (Setting.tsx)
- [x] 头像上传（JPEG/PNG/WebP，最大 2 MB，魔数检测）
- [x] 用户名编辑
- [x] 侧边栏导航（个人资料/外观设置/通知偏好）
- [x] 主题切换按钮（待实现）
- [x] 通知偏好占位

### 日程侧边栏 (DailyRoutine.tsx)
- [x] 模板编辑
- [x] 勾选完成
- [x] localStorage 持久化

### 404 页面 (NotFound.tsx)
- [x] 友好的 404 提示 + 返回首页链接
- [x] 已登录用户 2 秒后自动跳转 /home

---

## 共享组件 (`src/components/`)

| 组件 | 说明 |
|------|------|
| `PageNav` | 共享导航栏 — 头像、下拉菜单（个人中心/设置）、退出登录，支持自定义 Logo 和 homePath |

---

## 路由 (`src/router.tsx`)

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | App (封面) | 公开，已登录自动重定向 |
| `/login` | Login | 公开 |
| `/register` | Register | 公开 |
| `/register-success` | RegisterSuccess | 公开 |
| `/forget-password` | ForgetPassword | 公开 |
| `/home` | Home | 需认证 |
| `/photo-album` | PhotoAlbum | 需认证 |
| `/food-order` | FoodOrder | 需认证 |
| `/family-tree` | FamilyTree | 需认证 |
| `/setting` | Setting | 需认证 |
| `/personal-center` | PersonalCenter | 需认证 |
| `/*` | NotFound | 404 |

---

## 认证流程闭环

```
注册：Register 表单 → authApi.register() → POST /api/auth/register
     → 返回 data: null → navigate('/register-success')
     → 用户手动前往登录页

登录：Login 表单 → authApi.login() → POST /api/auth/login
     → 返回 {user, token} → authStore.setAuth(user, token, remember)
     → remember ? localStorage : sessionStorage → navigate('/home')

刷新：页面加载 → authStore 初始化 → localStorage 恢复（优先）→ sessionStorage 降级
     → 有 token → isAuthenticated: true → 无需重新登录

鉴权：每次请求 → 请求拦截器自动附加 Bearer Token
     → 后端返回 401 → 响应拦截器 → authStore.logout() 清 storage → navigateTo('/login')

退出：authApi.logout() → POST /api/auth/logout
     → authStore.logout() → 清 localStorage + sessionStorage → navigate('/')
```

---

## 后端基础设施 (`backend/`)

| 文件 | 说明 |
|------|------|
| `app/main.py` | FastAPI 应用入口 — CORS 中间件、路由挂载、lifespan（启动建表 / 关闭释放引擎）、全局异常处理（JSON 500） |
| `app/core/config.py` | pydantic-settings 配置管理（`.env` 自动加载，CORS_ORIGINS 逗号分隔解析） |
| `app/core/database.py` | SQLAlchemy 2.0 async engine + session factory + `get_db` 依赖注入 |
| `app/core/security.py` | bcrypt 密码哈希（passlib）+ JWT 创建/解码（python-jose） |
| `app/core/response.py` | 统一 `success_response()` / `error_response()` 响应工具 |
| `app/models/user.py` | User ORM 模型 |
| `app/models/album.py` | Album ORM 模型（与 Photo 一对多，删除时 SET NULL） |
| `app/models/photo.py` | Photo ORM 模型（after_delete 事件清理磁盘文件） |
| `app/schemas/user.py` | 用户请求/响应 Pydantic Schema |
| `app/schemas/album.py` | 相册请求/响应 Pydantic Schema（含 coverPhoto、photos） |
| `app/schemas/photo.py` | 照片请求/响应 Pydantic Schema |
| `app/schemas/food.py` | 点单请求 Pydantic Schema |
| `app/services/user.py` | 用户业务逻辑（注册、认证、查询、更新、重置密码） |
| `app/services/album.py` | 相册业务逻辑（创建、列表、查询、删除） |
| `app/services/photo.py` | 照片业务逻辑（上传验证含魔数检测、分页、删除） |
| `app/services/food.py` | 美食业务逻辑（订单邮件通知，UTF-8 Header 编码） |
| `app/api/v1/router.py` | API v1 路由聚合 + `GET /api/health` 健康检查端点 |
| `app/api/v1/endpoints/auth.py` | 认证端点（register/login/logout/reset-password） |
| `app/api/v1/endpoints/user.py` | 用户端点（get me / update me / upload avatar） |
| `app/api/v1/endpoints/album.py` | 相册端点（创建/列表/详情/删除 + 照片上传/分页） |
| `app/api/v1/endpoints/photo.py` | 照片端点（按 ID 获取/删除照片） |
| `app/api/v1/endpoints/food.py` | 美食端点（提交点单） |
| `app/api/v1/endpoints/family.py` | 家谱端点（在线状态，可选认证） |
| `app/api/deps.py` | `get_current_user` / `get_optional_user` 依赖注入 |
| `app/utils/image.py` | 图片魔数检测（JPEG/PNG/WebP） |

---

## 前后端联通测试

### 启动命令

```bash
# 后端（端口 8001）
cd backend && uvicorn app.main:app --reload --port 8001

# 前端（端口 5175）
cd frontend && npm run dev
```

### 架构确认

```
浏览器 (localhost:5175)
    │
    ├── 页面 → Vite Dev Server → React SPA
    └── /api/* → Vite 代理 → FastAPI (localhost:8001) → MySQL (3306)
```

---

## Debug 修复 (2026-07-30 · 第一次)

### 后端 Bug 修复
- [x] **user.py** — 头像上传后旧文件永不删除：`current_user.avatar` 在 `update_user` 后已被刷新为新值，修复为提前捕获旧路径
- [x] **photo.py** — 照片验证仅检测魔数非空，未核对类型是否在允许列表中（与头像验证不一致）
- [x] **main.py** — 新增全局异常处理器，未捕获异常返回 JSON `{code: 500, message}` 而非 HTML
- [x] **auth.py** — `_auth_response` 移除不必要的 `async`（无 await 操作）
- [x] **album.py schema** — `AlbumResponse` 新增 `coverPhoto` 和 `photos` 可选字段
- [x] **models/__init__.py** — 导出 `Album` 和 `Photo`（之前仅导出 `User`）
- [x] **photo.py service** — `get_photo_by_id` 添加显式 `selectinload(Photo.uploader)`
- [x] **album.py service** — `create_album` 添加服务层名称非空验证
- [x] **family.py** — 重构为使用标准 `get_optional_user` 依赖（替代手动 JWT 解码 + 内联 import）

### 前端 Bug 修复
- [x] **client.ts** — 响应拦截器移除不必要的 `return null`（后端始终返回 JSON），消除类型不匹配
- [x] **Home.tsx** — 问候语/时间段从冻结在挂载时刻改为随 `clockTime` 更新
- [x] **App.tsx** — 已登录用户访问 `/` 自动重定向到 `/home`
- [x] **Setting.tsx** — 侧边栏 `<a href="#">` 改为 `<button onClick>` 避免污染浏览器 URL
- [x] **familyTree.tsx** — 使用 `familyApi` 模块替代直接调用 `client`
- [x] **family.ts** (新) — 创建家谱 API 模块
- [x] **PersonalCenter.tsx** — CSS 文件重命名为 `PersonalCenter.css`（修复 "PersonCenter" 拼写）
- [x] **handleLogout** (4 处) — 空 catch 改为 `console.error` 记录失败原因
- [x] **deps.py** — 新增 `get_optional_user` 依赖（可选认证，不抛 401）

### 文档更新
- [x] 删除重复的 `frontend/src/docs/` 目录
- [x] `frontend/docs/COMPLETED.md` — 全面更新（本文）
- [x] `backend/docs/COMPLETED.md` — 新增相册/照片/美食/家谱端点
- [x] `backend/docs/TODOLIST.md` — 标记家庭相册 API 为已完成
- [x] `interface.md` — 新增重置密码端点文档
- [x] `README.md` — 更新文档列表
- [x] `CLAUDE.md` — 修正文档目录路径

### 验证结果
- [x] **TypeScript** — `tsc -b --noEmit` 零错误
- [x] **Vite 生产构建** — `vite build` 成功，125 modules

---

## Debug 修复 (2026-07-30 · 第二次 — 全项目 debug)

### 后端 Bug 修复
- [x] **schemas/food.py** — 文件丢失，从 git 历史恢复
- [x] **schemas/user.py** — `ResetPasswordRequest.new_password` 缺少 `alias="newPassword"`，导致前端发送 `newPassword` 时无法正确解析 → 添加 alias + `populate_by_name=True`
- [x] **aiomysql** — Python 环境中缺少 `aiomysql` 包 → `pip install -r requirements.txt`

### 前端 Bug 修复
- [x] **photoAlbum.tsx** — `queueMicrotask(() => fetchAlbums())` 不必要 → 改为直接调用 `fetchAlbums()`

### 项目配置修复
- [x] **.gitignore** — 项目缺少 `.gitignore`，导致 `backend/.env`（含真实 SMTP 凭据）被 git 追踪 → 创建 `.gitignore`，排除 `.env`、`__pycache__`、`node_modules`、`uploads` 等
- [x] **.env.example** — CORS_ORIGINS 注释写"逗号分隔"但实际为 JSON 数组格式 → 更新注释说明支持两种格式，并将示例 URL 脱敏

### 文档更新
- [x] **interface.md** — 修复家族在线状态 API 文档：
  - 字段名 `isOnline` → `online`（与后端实际返回一致）
  - 添加缺失的 `avatar` 字段
  - 同步 TypeScript 类型定义
- [x] **FAMILY.md** — 新增视频预览/离线提示功能说明，标记视频功能为已完成
- [x] **CLAUDE.md** — 新增 video 页面目录结构，更新 CORS_ORIGINS 注释描述

### 联通性验证
- [x] 后端启动正常 → `GET /api/health` 返回 `{"code":0,"data":{"status":"healthy"}}`
- [x] 前端 Vite 代理正常 → `curl localhost:5175/api/health` 正确转发到后端
- [x] TypeScript 零错误 + Vite 生产构建成功
