# COMPLETED — 已完成功能

> 最后更新：2026-08-01（前端 CSS 全面重构 + 无障碍改进 + 后端相册查询优化）

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
- [x] 头像上传（JPEG/PNG/WebP，最大 5 MB，魔数检测）
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
| `/family-tree/video` | VideoPage | 需认证 |
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

---

## Debug 修复 (2026-07-31 · 后端 Debug + 文档更新)

### 后端 Bug 修复
- [x] **response.py** — `error_response()` 不支持 `data` 参数，导致健康检查在 DB 不可达时 TypeError 崩溃 → 新增 `data` 可选参数
- [x] **main.py** — 全局异常处理器 `error_response(500, ...)` 使用默认 `status_code=400` → 改为显式 `status_code=500`
- [x] **album.py endpoint** — `_ERROR_MAP` 使用 `"EMPTY_NAME"` 但 service 抛出 `"NAME_REQUIRED"` → 统一为 `"NAME_REQUIRED"`，端点改为 try/except 由 service 层验证
- [x] **album.py service** — `create_album` 仅在验证时 strip 名称，未存储 strip 后的值 → 将 strip 后的值写入数据库
- [x] **photo.py model** — `content_type` 为 `String(50)` 但文档记录 `varchar(100)` → 统一为 `String(100)`
- [x] **deps.py** — `int(user_id)` 在恶意 token 时抛出 ValueError → 500 错误（应为 401）→ 捕获并返回 401 / None

### 文档更新
- [x] **CLAUDE.md** — 移除不存在的 `User.updated_at` 字段说明；修正错误码范围
- [x] **API_REFERENCE.md** — 错误码范围修正（`1000–1100` → `1000–1099` 等），新增 `5000–5099` 系统健康检查
- [x] **backend/docs/COMPLETED.md** — 新增 2026-07-31 调试记录
- [x] **frontend/docs/COMPLETED.md** — 同步更新（本文）

---

## Debug 修复 (2026-07-31 · 前端代码审查修复)

### Bug 修复

- [x] **App.tsx** — `navigate()` 在 render 阶段直接调用（React 副作用） → 移入 `useEffect`，避免渲染期间的副作用
- [x] **dailyRoutine.tsx** — `saveDoneIndices()` 在 `setDoneSet` / `setTemplate` 状态更新器内部调用（状态更新器应保持纯函数） → 添加 `useEffect(() => saveDoneIndices(doneSet), [doneSet])` 统一持久化，移除所有 updater 内的副作用
- [x] **familyTree.tsx** — `handleAvatarClick` 连续快速点击多个在线成员时，旧 timer 未清除导致导航到错误的成员视频页 → 在设置新 timer 前先 `clearTimeout` 旧 timer
- [x] **familyTree.tsx** — `isRoot` prop 在 `SubTree` → `CoupleCard` → `PersonCard` 传递链中断，根节点从未获得大头像样式 → 贯通 `isRoot` prop 整条链路
- [x] **photoAlbum.tsx** — `handleDeleteAlbum` / `handleDeletePhoto` 的 `finally` 块在 catch 后仍执行 `setTarget(null)`，导致错误提示弹窗立即关闭（用户看不到错误信息） → 仅成功时清除 target，移除 finally 块
- [x] **forgetPassword.tsx** — 密码显示/隐藏按钮 `tabIndex={0}` 与 Login/Register 页面的 `tabIndex={-1}` 不一致 → 统一为 `-1`（装饰性按钮不应进入 tab 顺序）
- [x] **website.svg** — ~~未被任何文件引用 → 删除~~（⚠️ 误删：该文件实际被 `index.html` 作为 favicon 引用 `<link rel="icon" type="image/svg+xml" href="./src/svg/website.svg">`，已于 2026-07-31 恢复）

### 验证结果
- [x] **TypeScript** — `tsc -b --noEmit` 零错误
- [x] **Vite 生产构建** — `vite build` 成功，127 modules

---

## 前后端连通性测试 (2026-07-31)

### 测试环境

| 组件 | 地址 | 状态 |
|------|------|------|
| Render 后端 | `https://familywebsite-qkqd.onrender.com/api` | ✅ 在线 |
| 本地后端 | `http://localhost:8001` | ✅ 在线（连接 TiDB Cloud） |
| 前端 Dev | `http://localhost:5175` | ✅ 在线（Vite v8.1.4） |
| TiDB Cloud | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000` | ✅ 在线 |

### API 端点测试结果

| 方法 | 端点 | 状态 | 说明 |
|------|------|------|------|
| `GET` | `/api/family/status` | ✅ 200 | 公开访问返回全部成员离线；认证后匹配用户名标记在线 |
| `POST` | `/api/auth/register` | ✅ 200 | 注册成功返回 `data: null`（不自动登录） |
| `POST` | `/api/auth/login` | ✅ 200 | 返回 `{user, token}`；错误凭据返回 1101 |
| `POST` | `/api/auth/logout` | ✅ 200 | 需 Bearer Token |
| `POST` | `/api/auth/reset-password` | ✅ 200 | 通过邮箱重置密码 |
| `GET` | `/api/user/me` | ✅ 200 (auth) / 401 (no auth) | 认证守卫正常 |
| `PATCH` | `/api/user/me` | ✅ 200 | 更新用户名/头像，含唯一性校验 |
| `GET` | `/api/albums` | ✅ 200 (auth) / 401 (no auth) | 认证守卫正常 |
| `POST` | `/api/albums` | ✅ 200 | 创建相册，名称非空验证 |
| `GET` | `/api/albums/{id}` | ✅ 200 | 含照片列表，权限控制正确 |
| `DELETE` | `/api/albums/{id}` | ✅ 200 | 仅创建者可删除，照片 album_id 置 NULL |
| `GET` | `/api/health` | ✅ 200 | 不依赖数据库 |

### 前端路由测试结果

所有路由返回 HTTP 200（SPA 客户端路由）：
`/`, `/login`, `/register`, `/home`, `/albums`, `/family-tree`, `/food-order`, `/daily-routine`, `/user/setting`, `/user/personal-center`, `/forget-password`

### CORS 测试结果

- ✅ `localhost:5175` → Render 后端：CORS 预检通过，`access-control-allow-origin` 正确
- ✅ Vercel / EdgeOne / Cloudflare Pages 域名均在 CORS 白名单中

### 修复记录

- [x] **website.svg** — 恢复被误删的 favicon 文件（`index.html` 引用该文件作为网站图标）
- [x] **前端构建验证** — `vite build` 成功输出 3 个资产（JS + CSS + SVG）

---

## UI/UX 全面重构 (2026-08-01)

### 前端 CSS 全面重构

对所有页面的 CSS 进行了现代化改造：

- [x] **hover 媒体查询包装** — 所有 `:hover` 样式用 `@media (hover: hover)` 包装，避免移动端触摸后残留 hover 状态
- [x] **`:active` 按压反馈** — 按钮和可点击元素新增 `:active` 缩放/颜色变化，提供触觉般的即时反馈
- [x] **间距与排版优化** — 统一各页面 `padding`、`gap`、`border-radius` 等间距变量
- [x] **CSS 变量体系** — 完善 `--color-*`、`--shadow-*`、`--radius-*` 设计 token
- [x] **涉及文件**（22 个 CSS 文件）：
  - `App.css`, `index.css`, `PageNav.css`
  - `Auth.css`, `Login.css`, `Register.css`, `RegisterSuccess.css`, `forgetPassword.css`
  - `Home.css`, `dailyRoutine.css`, `photoAlbum.css`, `foodOrder.css`
  - `familyTree.css`, `video.css`, `PersonalCenter.css`, `Setting.css`, `NotFound.css`

### 认证页面无障碍改进

- [x] **错误/成功消息** — 统一使用 `auth__server-error` / `auth__server-success` 类名，添加 `role="alert"` / `role="status"` ARIA 角色，添加唯一 `id` 属性
- [x] **表单字段 `aria-describedby`** — 错误消息关联到对应输入框，屏幕阅读器可自动朗读错误提示
- [x] **邮箱输入 `inputMode="email"`** — 移动端键盘自动切换为邮箱模式
- [x] **Login/Register/ForgetPassword 三页面统一** — 错误显示模式、tabIndex 行为、密码切换按钮保持一致
- [x] **涉及文件**：`Login.tsx`, `Register.tsx`, `forgetPassword.tsx`

### 日程侧边栏体验优化

- [x] **移除硬编码默认日程** — 不再预置 10 条示例日程（`DEFAULT_ROUTINES`），新用户从空白开始
- [x] **空状态提示** — 模板为空时显示友好的引导文案 + 图标："还没有日程，点击 ⚙️ 开始添加吧"
- [x] **智能编辑模式** — 首次使用（localStorage 中无模板数据）自动进入编辑模式，减少操作步骤
- [x] **涉及文件**：`dailyRoutine.tsx`

### React 19 兼容性修复

- [x] **PhotoAlbum** — `queueMicrotask(() => fetchAlbums())` 延迟调用，避免 `useEffect` 中同步 setState 触发 React 19 的级联渲染警告
- [x] **涉及文件**：`photoAlbum.tsx`

### 后端相册查询优化

- [x] **album.py service** — 所有相册查询添加链式 `selectinload(Album.photos).selectinload(Photo.uploader)`，预加载照片上传者信息，消除 N+1 查询
- [x] **涉及文件**：`backend/app/services/album.py`

---

---

## Debug 修复 (2026-08-02 · 前端全量审查修复)

### Bug 修复

- [x] **foodOrder.tsx** — `handleSubmitOrder` 中 `setTimeout` 未清理，组件卸载后可能触发 setState → 添加 `successTimerRef` 和 `useEffect` 清理
- [x] **Home.tsx / PageNav.tsx** — `handleLogout` 中 `navigate("/")` 与 auth guard 的 `navigate("/login")` 竞争导致双重跳转 → 统一直接导航到 `/login`
- [x] **client.ts** — FormData 上传时 Content-Type 删除条件依赖 `config.headers["Content-Type"]` 存在性，AxiosHeaders 归一化可能导致删除失败 → 改为无条件删除
- [x] **client.ts** — `UPLOADS_BASE` 正则 `\/api$` 不匹配尾部斜杠（如 `https://api.example.com/api/`），导致上传 URL 错误 → 正则改为 `\/api\/?$`
- [x] **client.ts** — 非超时类网络错误（DNS 失败、连接拒绝等）直接 re-throw 原始 AxiosError，message 对用户不友好 → 统一返回 `"网络错误，请检查连接"`
- [x] **main.tsx** — 系统主题变化时 `darkModeQuery` 监听器直接调用 `applyTheme` 但未更新 store 的 `resolved` 状态 → 改为同步更新 `useThemeStore.setState({ resolved })`，并添加 HMR 清理
- [x] **Register.tsx** — SVG import 语句缺少分号；`updateField` 的 `value: string | boolean` 类型是 Login.tsx 的遗留复制（Register 无 boolean 字段）→ 统一加 `;`，改为 `value: string`
- [x] **forgetPassword.tsx** — 表单字段错误消息缺少 `id`、`role="alert"` 和 `aria-describedby`，与 Login/Register 不一致 → 补全无障碍属性
- [x] **dailyRoutine.tsx** — 日程项 React key 使用 `${time}-${title}`，允许相同时间+标题的重复项导致 key 冲突 → key 改为 `${index}-${time}-${title}`
- [x] **auth.ts** — `logout()` 缺少显式泛型 `<null>`（其他 null 返回方法统一标注）→ 添加 `<null>`
- [x] **types.ts** — 注释引用 `docs/interface.md` 路径不完整 → 修正为 `frontend/docs/interface.md`
- [x] **authStore.ts** — JSON 解析失败 catch 块无日志，脏数据清理不可见 → 添加 `console.warn`

### 文档修复

- [x] **CLAUDE.md** — "文件上传" 节头像大小写为 2 MB，与底部表格和实际代码（5 MB）矛盾 → 修正为 5 MB
- [x] **interface.md** — 头像上传大小写为 2 MB（3 处），与代码矛盾 → 全部修正为 5 MB
- [x] **COMPLETED.md** — Setting 页头像上传大小写为 2 MB → 修正为 5 MB
- [x] **interface.md** — 错误码 `1003`（密码格式）、`1102`（账号禁用）、`1103`（登录频繁）标注为"预留，后端未实现"，避免前端开发者误解

### 2026-08-02 — 后端 Debug（同步记录）

后端对应的修复记录见 `backend/docs/COMPLETED.md`，本处仅记录前端文档相关的联动更新：

- [x] **interface.md** — 错误码 `1003`、`1102`、`1103` 标注为预留（已在上述文档修复中包含）

### 验证结果

- [x] **TypeScript** — `tsc --noEmit` 零错误
- [x] **Vite 生产构建** — `vite build` 成功，127 modules

---

## Debug 修复 (2026-08-03 · 前端全面 Debug + 文档更新)

### 删除死文件

- [x] **dailyRoutine/**（pages 下）— 删除 stale 副本（已迁移至 components/DailyRoutine/），含 `.tsx` 和 `.css`
- [x] **Auth/**（pages 下）— 删除 stale 副本（已迁移至 components/Auth/），含 `.tsx` 和 `.css`
- [x] **Register.css** — 删除空文件（仅有注释，样式已合并至 Auth.css）
- [x] **forgetPassword.css** — 删除空文件（同上）

### Bug 修复

- [x] **DailyRoutine.tsx** — `addRoutine` 中 `saveTemplate(next)` 在 `setTemplate` updater 内调用（副作用破坏纯函数）；已移除，由 `useEffect` 统一持久化
- [x] **DailyRoutine.css** — `dr__edit-btn--cancel` 修饰符名误导（实际是"完成编辑"按钮）；已重命名为 `dr__edit-btn--done`
- [x] **Setting.tsx / PersonalCenter.tsx** — `charAt(0).toUpperCase()` 在 `user` 为 null 时抛出 TypeError；添加可选链 `?.toUpperCase()`
- [x] **video.tsx** — `startCamera` 缺少 `mountedRef` 检查，组件卸载后仍调用 setState 并泄漏 MediaStream；已添加守卫
- [x] **photoAlbum.tsx** — `uploadPreview` blob URL 未在组件卸载时清理；已添加 `useEffect` 清理 + `uploadPreviewRef` 追踪
- [x] **photoAlbum.tsx** — 点击遮罩关闭删除确认弹窗时未清除 `deleteError`；已修复
- [x] **client.ts** — 响应拦截器类型为 `AxiosError`，请求拦截器拒绝的普通 `Error`（如"Token 已过期"）被错误替换为"网络错误"；改为 `unknown` + `axios.isAxiosError` 守卫
- [x] **index.html** — favicon 路径 `./src/svg/website.svg` 在生产构建中 404；已复制到 `public/` 并改为 `/website.svg`
- [x] **Home.tsx** — `getGreeting()` / `getTimePeriod()` 内部调用 `new Date()` 而非使用 `clockTime`；改为接受 hour 参数
- [x] **types.ts** — `SubmitOrderRequest` 注释错放在「家谱」节下；已移至正确的「美食点单」节

### 深色模式 CSS 修复

- [x] **App.css** — `.cover__badge` 硬编码浅色背景 → 使用 `var(--color-accent-light)` / `var(--color-primary-dark)`
- [x] **App.css** — `.cover__wave` SVG data URI 硬编码 `#faf8f5` → 添加 `[data-theme="dark"]` 覆盖为 `#1a1a2e`
- [x] **App.css** — `.cover__feature-icon` nth-child 硬编码渐变 → 改用 `var(--color-icon-bg-*)` 变量
- [x] **photoAlbum.css** — 公开/私有相册徽章硬编码背景色 → 改用 `var(--color-alert-success-bg)` / `var(--color-alert-error-bg)`
- [x] **foodOrder.css** — 购物车底部渐变硬编码 `rgba(254,249,240,0.5)` → 改用 `var(--color-bg-warm)`
- [x] **foodOrder.css** — 购物车列表分割线 `rgba(0,0,0,0.05)` → 改用 `var(--color-border)`
- [x] **familyTree.css** — 性别圆点 / 头像背景 / 状态环 / Toast 背景全部改用 CSS 变量

### 次要 CSS 修复

- [x] **Home.css** — 不对称 padding `32px 32px 60px 16px` → 对称 `32px 32px 60px 32px`
- [x] **index.css** — 移除未使用的 `--color-success` 变量
- [x] **DailyRoutine.css** — `--dr-width` / `--dr-collapsed-width` 从 `:root` 移至 `.dr` 选择器
- [x] **Auth.css** — `1.5px` 边框 → `1px`（避免亚像素渲染差异）

### 文档更新

- [x] **COMPLETED.md** — 路由表新增 `/family-tree/video`；新增 2026-08-03 调试记录
- [x] **interface.md** — 新增 `GET /api/user/me/stats` 端点文档
- [x] **CLAUDE.md** — 修正 stale 目录引用（`pages/dailyRoutine/` → `components/DailyRoutine/`，`pages/auth/Auth.tsx` → `components/Auth/Auth.tsx`）
- [x] **TODOLIST.md** — 标记部分已修复条目

### 验证结果

- [x] **TypeScript** — `tsc --noEmit` 零错误
- [x] **Vite 生产构建** — `vite build` 成功

### 已知问题（非阻塞）

| 问题 | 影响 | 建议 |
|------|------|------|
| `passlib` + `bcrypt` 版本兼容警告 | 无（仅终端警告，不影响功能） | 升级 passlib 或降级 bcrypt |
| 前端 `.env` 指向 Render 后端 | 本地开发使用远程后端（冷启动 30-60s） | 如需本地后端开发，将 `VITE_API_BASE_URL` 设为空或 `http://localhost:8001/api` |
| Vite 代理未使用 | 因 `VITE_API_BASE_URL` 已设置，代理配置被绕过 | 符合当前设计（开发也使用部署后端） |
| video.css 全部使用硬编码颜色 | 视频页面为固有深色主题，未使用 CSS 变量 | 后续逐步迁移 |
| PersonalCenter 统计卡片计入 0（foodOrderCount） | 点单系统不存储订单，固定为 0 | 后续如有需要可接入存储 |
| 受保护路由无 route-level auth guard | 未登录直接访问返回空白页闪动后才跳转 | 后续添加路由守卫组件 |
| 部分 CSS 文件含未使用类名 | PersonalCenter.css / Setting.css 约 180 行旧导航样式未清理 | 后续清理死代码 |
