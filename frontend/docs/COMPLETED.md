# COMPLETED — 已完成功能

> 最后更新：2026-07-26（前后端联通测试 + 文档更新 + 全项目 debug 修复）

---

## 项目初始化

- [x] Vite 8 + React 19 + TypeScript 脚手架
- [x] ESLint 配置
- [x] 开发服务器端口 5175

---

## API 层 (`src/api/`)

| 文件 | 说明 |
|------|------|
| `client.ts` | Axios 实例封装 — 请求拦截器注入 Bearer Token、响应拦截器解包统一响应格式 + 401 自动清登录态跳转 + 超时处理 |
| `types.ts` | 前端 API 类型定义 — `ApiResponse<T>`, `User`, `RegisterRequest`, `LoginRequest`, `AuthResponse`, `UpdateUserRequest` |
| `auth.ts` | 认证 API — `register(RegisterRequest)`, `login(LoginRequest)`, `logout()` — 统一使用类型化请求对象 |
| `user.ts` | 用户 API — `getMe()`, `updateMe(data)` |
| `index.ts` | 统一导出入口 |

## 工具模块 (`src/utils/`)

| 文件 | 说明 |
|------|------|
| `navigate.ts` | SPA 导航工具 — 避免 axios 拦截器与 router 的循环依赖；提供 `navigateTo(path)` 供非组件代码使用，未初始化时降级为 `window.location.href` |

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
- [x] 功能一览卡片（家庭相册/日程管理/家庭留言）
- [x] Footer

### 登录页 (Login.tsx)
- [x] 邮箱 + 密码表单
- [x] 前端验证（邮箱格式、密码 >= 6 位）
- [x] 调用 `authApi.login()` 对接后端 `/api/auth/login`
- [x] 登录成功 → 存储 user/token → 跳转 `/home`
- [x] loading 状态 + 服务端错误展示
- [x] "记住我"复选框 — `remember=true` → localStorage 持久化，`remember=false` → sessionStorage（刷新不丢）
- [x] 第三方登录入口 UI（微信/手机号，功能待实现）

### 注册页 (Register.tsx)
- [x] 用户名 + 邮箱 + 密码 + 确认密码 + 同意协议表单
- [x] 前端验证（用户名 >= 2 位、邮箱格式、密码 >= 6 位、两次密码一致、必须勾选协议）
- [x] 调用 `authApi.register()` 对接后端 `/api/auth/register`
- [x] 注册成功 → 存储 user/token → 跳转 `/home`
- [x] loading 状态 + 服务端错误展示

### Auth 布局组件 (Auth.tsx)
- [x] 左侧装饰面板（Logo + 插图 + tagline）
- [x] 右侧表单区域（title/subtitle/children/footer link）
- [x] 登录/注册页共享复用

### 主页 (Home.tsx)
- [x] 认证守卫 — 未登录自动跳转 `/login`
- [x] 导航栏（Logo + 用户名 + 退出按钮，退出时调用 `authApi.logout()` 通知后端）
- [x] 欢迎区域 + 功能预览卡片（相册/日程/留言标记为"即将上线"）

---

## 路由 (`src/router.tsx`)

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | App (封面) | 公开 |
| `/login` | Login | 公开 |
| `/register` | Register | 公开 |
| `/home` | Home | 需认证 |
| `/*` | NotFound | 404 |

---

## 认证流程闭环

```
注册：Register 表单 → authApi.register(RegisterRequest) → POST /api/auth/register
     → 返回 {user, token} → authStore.setAuth(user, token, remember=true)
     → localStorage 持久化 → navigate('/home')

登录：Login 表单 → authApi.login(LoginRequest) → POST /api/auth/login
     → 返回 {user, token} → authStore.setAuth(user, token, remember)
     → remember ? localStorage : sessionStorage → navigate('/home')

刷新：页面加载 → authStore 初始化 → localStorage 恢复（优先）→ sessionStorage 降级
     → 有 token → isAuthenticated: true → 无需重新登录

鉴权：每次请求 → 请求拦截器自动附加 Bearer Token
     → 后端返回 401 → 响应拦截器 → authStore.logout() 清 storage → navigateTo('/login')

退出：Home → authApi.logout() → POST /api/auth/logout（通知后端销毁 token）
     → authStore.logout() → 清 localStorage + sessionStorage → navigate('/')
```

---

## 后端基础设施 (`backend/`)

| 文件 | 说明 |
|------|------|
| `app/main.py` | FastAPI 应用入口 — CORS 中间件、路由挂载、lifespan（启动建表 / 关闭释放引擎）；启动时 DB 不可用不会阻止服务启动 |
| `app/core/config.py` | pydantic-settings 配置管理（`.env` 自动加载） |
| `app/core/database.py` | SQLAlchemy async engine + session factory + `get_db` 依赖注入 |
| `app/core/security.py` | bcrypt 密码哈希 + JWT 创建/解码 |
| `app/core/response.py` | 统一 `success(data)` / `error(code, message)` 响应工具 |
| `app/models/user.py` | User ORM 模型 |
| `app/schemas/user.py` | Pydantic 请求/响应 Schema |
| `app/services/user.py` | 用户业务逻辑（注册、认证、查询、更新） |
| `app/api/v1/router.py` | API v1 路由聚合 + `GET /api/health` 健康检查端点 |
| `app/api/v1/endpoints/auth.py` | 认证端点（register/login/logout） |
| `app/api/v1/endpoints/user.py` | 用户端点（get me / update me） |
| `app/api/deps.py` | `get_current_user` 依赖注入（JWT 解析 + 用户查询） |

## 前后端联通测试 (2026-07-26)

### 测试结果

| 测试项 | 状态 | 说明 |
|--------|------|------|
| 后端启动 | ✅ | FastAPI 在 `localhost:8000` 正常运行 |
| 健康检查 (直连) | ✅ | `GET /api/health` → `{"code":0,"message":"ok","data":{"status":"healthy"}}` |
| 前端启动 | ✅ | Vite 在 `localhost:5175` 正常运行 |
| 健康检查 (代理) | ✅ | `GET http://localhost:5175/api/health` → 代理成功转发到后端 |
| POST 代理 | ✅ | `POST http://localhost:5175/api/auth/login` → 后端 Pydantic 校验正常返回 |
| Swagger 文档 | ✅ | `http://localhost:8000/docs` 可访问 |
| OpenAPI Schema | ✅ | 所有 6 个端点（health + register + login + logout + get me + update me）正确注册 |

### 启动命令

```bash
# 后端
cd backend && uvicorn app.main:app --reload --port 8000

# 前端
cd frontend && npm run dev
```

### 架构确认

```
浏览器 (localhost:5175)
    │
    ├── 页面 → Vite Dev Server → React SPA
    └── /api/* → Vite 代理 → FastAPI (localhost:8000) → MySQL (3306)
```

## 文档更新 (2026-07-26)

- [x] **README.md** — 补充后端技术栈、完整目录结构、启动步骤、连通性验证、架构图
- [x] **docs/interface.md** — 修正 Base URL（3000 → 5175/8000）、新增健康检查端点、修正章节编号、移除重复的 `RegisterRequest` 类型
- [x] **docs/TODOLIST.md** — 标记前后端接口文档为已完成
- [x] **后端 `main.py`** — 启动时 DB 不可用不再阻止服务启动（仅 warn），便于开发调试
- [x] **后端 `router.py`** — 新增 `GET /api/health` 健康检查端点（不依赖数据库）

## Debug 修复 (2026-07-26)

### 第一轮 — 功能 Bug
- [x] **Home.tsx** — `handleLogout` 恢复 `authApi.logout()` 调用（之前被注释掉，后端接口已就绪）
- [x] **PersonalCenter.tsx** — `handleLogout` 添加 `authApi.logout()` 调用
- [x] **Setting.tsx** — `handleLogout` 添加 `authApi.logout()` 调用
- [x] **后端 auth.py** — 登录错误码从 `1003` 改为 `1101`，与 [interface.md](interface.md) 错误码对照表保持一致
- [x] **docs/interface.md** — 修正注册接口响应文档：后端不再返回 user+token，改为返回 `data: null` + 提示消息

### 第二轮 — 健壮性 & 代码质量
- [x] **backend/config.py** — `.env` 路径解析改为相对 config 文件定位（`backend/.env`），CWD 作为降级；避免从非 backend/ 目录启动时找不到配置
- [x] **RegisterSuccess.tsx** — 倒计时定时器重构：将 `clearInterval` 从 `setState` 回调中移出，改用 `useRef` + 独立 `useEffect` 监听 `countdown` 触发跳转，符合 React 纯函数式 state 更新规范
- [x] **client.ts** — 响应拦截器增加空响应体保护：`response.data` 为 null/undefined 时直接返回 `null`，避免解构 `{}` 导致 code/message 为 undefined 产生误导性错误提示
- [x] **router.tsx** — 统一所有懒加载组件导入路径的 `.tsx` 后缀（3 处缺少后缀的 import 补全）

### 验证结果
- [x] **TypeScript** — `tsc -b --noEmit` 零错误
- [x] **Python 编译** — 全部 20 个 `.py` 文件 `py_compile` 通过
- [x] **Python 导入** — 全部核心模块（config, security, database, models, schemas, services, deps）成功导入
- [x] **Vite 生产构建** — `vite build` 成功，109 modules，374 KB JS + 28 KB CSS
