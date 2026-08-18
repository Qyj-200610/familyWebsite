# Family Website — 家庭门户网站

一个全栈家庭门户网站，包含相册、美食点单、家谱图等功能模块。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, TypeScript, Vite 8, React Router 7, Zustand 5, Axios |
| 后端 | FastAPI (Python), SQLAlchemy 2.0 (async), MySQL, Pydantic v2 |
| 认证 | JWT (python-jose), bcrypt (passlib) |
| 邮件 | QQ SMTP（用于美食点单通知） |
| 图片存储 | Cloudinary（持久化云存储，替代 Render 临时磁盘） |
| 部署 | Cloudflare Pages（前端）+ Render（后端）+ TiDB Cloud（数据库） |

## 项目结构

```
familyWebsite/
├── backend/                     # FastAPI 后端
│   ├── .env.example             # 环境变量模板
│   ├── requirements.txt         # Python 依赖
│   ├── API_REFERENCE.md         # 后端 API 快速参考
│   ├── docs/                    # 后端文档
│   │   ├── COMPLETED.md         # 已完成功能
│   │   └── TODOLIST.md          # 待办事项
│   ├── uploads/                 # 上传文件存储目录（本地开发降级）
│   └── app/
│       ├── main.py              # 应用入口，CORS，StaticFiles，lifespan
│       ├── api/
│       │   ├── deps.py          # 依赖注入（get_current_user / get_optional_user）
│       │   └── v1/
│       │       ├── router.py    # /api 路由聚合
│       │       └── endpoints/
│       │           ├── auth.py  # /api/auth/*（含 token 刷新）
│       │           ├── user.py  # /api/user/*
│       │           ├── album.py # /api/albums/*
│       │           ├── photo.py # /api/photos/*
│       │           ├── food.py  # /api/food/*
│       │           └── family.py # /api/family/* (在线状态)
│       ├── core/
│       │   ├── config.py        # Pydantic Settings（读取 .env，CORS_ORIGINS 支持 JSON 数组/逗号分隔，含 Cloudinary 凭证 + 连接池配置）
│       │   ├── security.py      # JWT + bcrypt 工具（含 access/refresh 双 token）
│       │   ├── database.py      # SQLAlchemy async engine & session（pool_size=10, pool_pre_ping=True）
│       │   └── response.py      # 统一响应格式 {code, message, data}
│       ├── models/
│       │   ├── user.py          # User 模型 + Base 声明式基类
│       │   ├── album.py         # Album 模型
│       │   └── photo.py         # Photo 模型（含 after_delete 事件清理文件）
│       ├── schemas/
│       │   ├── user.py          # 用户请求/响应 Pydantic 模型（含密码强度校验）
│       │   ├── album.py         # 相册请求/响应 Pydantic 模型
│       │   ├── photo.py         # 照片请求/响应 Pydantic 模型
│       │   └── food.py          # 点单请求 Pydantic 模型
│       ├── services/
│       │   ├── user.py          # UserService — 用户业务逻辑
│       │   ├── album.py         # AlbumService — 相册业务逻辑
│       │   ├── photo.py         # PhotoService — 照片业务逻辑
│       │   ├── food.py          # FoodService — 邮件通知
│       │   └── storage.py       # Cloudinary 存储服务 — 上传/删除/URL 生成
│       └── utils/
│           ├── image.py         # 图片魔数检测（JPEG/PNG/WebP）
│           └── response_helpers.py  # 照片响应转换 + 错误码映射
├── frontend/                    # React SPA 前端
│   ├── .env.example             # VITE_API_BASE_URL 说明
│   ├── index.html
│   ├── vite.config.ts           # Vite 配置 + API 代理
│   ├── docs/                     # 前端文档
│   │   ├── interface.md          # API 接口规范
│   │   ├── FAMILY.md             # 家族谱系数据规格
│   │   ├── TODOLIST.md           # 待办事项
│   │   └── COMPLETED.md          # 已完成功能记录
│   └── src/
│       ├── main.tsx             # React 入口（含主题初始化 + 系统主题监听）
│       ├── App.tsx              # 首页（未登录时的 Landing 展示页）
│       ├── env.d.ts             # Vite 环境变量类型声明
│       ├── router.tsx           # React Router 路由定义 + AuthGuard 守卫 + 全局导航注入
│       ├── api/
│       │   ├── client.ts        # Axios 实例 + 拦截器（含 token 刷新、uploadUrl 工具函数）
│       │   ├── index.ts         # API 统一导出
│       │   ├── types.ts         # 前端 API 类型定义
│       │   ├── auth.ts          # 认证 API 封装（register/login/logout/reset-password）
│       │   ├── user.ts          # 用户 API 封装
│       │   ├── photo.ts         # 相册 + 照片 API 封装
│       │   ├── food.ts          # 美食 API 封装
│       │   └── family.ts        # 家谱 API 封装
│       ├── store/
│       │   ├── authStore.ts     # Zustand 认证状态管理（localStorage/sessionStorage + token 刷新）
│       │   └── themeStore.ts    # Zustand 主题状态管理（light/dark/system + localStorage 持久化）
│       ├── hooks/
│       │   └── useRequireAuth.ts # 页面级认证守卫 Hook（路由层 AuthGuard 之后的第二重保障）
│       ├── utils/
│       │   ├── navigate.ts      # 全局导航工具（供 axios 拦截器使用）
│       │   └── validation.ts    # 表单校验工具（邮箱格式 + 密码强度，与后端 schema 对齐）
│       ├── components/
│       │   ├── PageNav/         # 共享导航栏组件（头像、下拉菜单、退出登录）
│       │   ├── Auth/            # Auth 布局组件（左侧装饰面板 + 右侧表单区域）
│       │   ├── AuthGuard/       # 路由级认证守卫（统一拦截未登录访问）
│       │   ├── ImageWithFallback/ # 带加载失败回退的图片组件（统一处理无图/加载失败）
│       │   └── DailyRoutine/    # 日程侧边栏组件（模板编辑、勾选完成、localStorage 持久化）
│       ├── svg/                 # SVG 图标（用于表单、按钮等）
│       └── pages/
│           ├── home/            # 首页（已登录，含 Hero 横幅 + 快捷入口 + 日程侧边栏）
│           ├── auth/            # 登录/注册/注册成功/忘记密码
│           ├── familyTree/      # 家谱图（递归子树、折叠展开、在线状态指示器）
│           ├── photoAlbum/      # 家庭相册（创建/删除相册，上传/浏览/删除照片）
│           ├── foodOrder/       # 美食点单（分类筛选、购物车、邮件提交通知）
│           ├── user/
│           │   ├── setting/     # 用户设置（头像上传、用户名编辑、主题切换）
│           │   └── personalCenter/ # 个人中心（资料卡片、统计、活动记录）
│           └── notFound/        # 404 页面
└── .claude/                     # Claude Code 配置
    └── settings.json
```

## 开发环境

### 后端

```bash
cd backend
python -m venv .venv && source .venv/Scripts/activate  # Windows
pip install -r requirements.txt
cp .env.example .env  # 编辑数据库、SMTP 和 Cloudinary 配置
uvicorn app.main:app --reload --port 8001
```

### 前端

```bash
cd frontend
npm install
npm run dev  # 启动在 localhost:5175，代理 /api → localhost:8001
```

### 数据库

使用 MySQL（本地开发）或 TiDB Cloud（生产）。首次启动后端时，`lifespan` 事件会自动建表（`Base.metadata.create_all`）。

## 关键约定

### API 响应格式

所有接口返回统一格式：

```json
{
  "code": 0,       // 0 = 成功，其他 = 错误码
  "message": "...",
  "data": { ... }  // 载荷
}
```

### 错误码范围

| 范围 | 模块 |
|------|------|
| 1000–1099 | 注册 |
| 1100–1199 | 登录 |
| 1200–1299 | 密码重置 |
| 2000–2099 | 用户更新 |
| 2003–2007 | 头像上传（文件验证） |
| 2008–2010 | 头像上传（存储/大小） |
| 3000–3099 | 照片上传/删除 |
| 3100–3199 | 照片操作 |
| 3200–3299 | 相册操作 |
| 4000–4099 | 美食点单 |
| 5000–5099 | 系统健康检查 |

### 命名规范

- **后端**：Python snake_case 命名，Pydantic schema 使用 `alias` 映射到前端 camelCase
- **前端**：TypeScript camelCase 命名，axios 拦截器自动解包 `data` 字段
- **CSS**：BEM 命名，各页面使用独立前缀（`home__*`、`food__*`、`album__*` 等），使用 CSS 变量体系（`--color-*`、`--shadow-*`、`--radius-*`）
- **敏感信息**：`.env` 不进入版本控制，`.env.example` 提供模板

### 认证流程

1. 用户登录 → 后端返回 JWT token（access + refresh）
2. 前端存储 token 到 localStorage（记住我）或 sessionStorage
3. axios 请求拦截器自动注入 `Authorization: Bearer <token>`
4. 后端 `get_current_user` 依赖解析 token 并注入 `User` 对象
5. 401 响应 → 拦截器自动尝试 refresh token 刷新，失败则清除状态并跳转登录页

### Token 刷新机制

采用双 token 机制（access 30min + refresh 7天）：

- 请求拦截器：access token 过期前主动检测，提前使用 refresh token 换取新 access token
- 响应拦截器：401 时自动静默刷新 token，并发的多个 401 请求排队共用一次刷新
- `authStore`：管理 token 生命周期，支持 localStorage/sessionStorage 双层级持久化
- 涉及文件：[client.ts](frontend/src/api/client.ts)、[authStore.ts](frontend/src/store/authStore.ts)、[auth.ts](frontend/src/api/auth.ts)、[security.py](backend/app/core/security.py)、[auth.py](backend/app/api/v1/endpoints/auth.py)

### 认证端点说明

- `POST /api/auth/register` — 注册后**不自动登录**，跳转到注册成功页
- `POST /api/auth/login` — 支持 `rememberMe` 选择 localStorage/sessionStorage
- `POST /api/auth/logout` — 需认证，后端记录退出（前端清除 token）
- `POST /api/auth/refresh` — 使用 refresh token 换取新 access token
- `POST /api/auth/reset-password` — 通过注册邮箱重置密码（注意：当前无需验证，仅适用于家庭场景）

### 路由守卫

使用 `AuthGuard` 组件统一拦截未登录访问：

- 包裹所有需认证的路由（`/home`, `/photo-album`, `/food-order`, `/family-tree`, `/setting`, `/personal-center`）
- 未登录时自动跳转 `/login`，渲染 `null` 避免闪动
- 各页面内部保留 `isAuthenticated` 检查作为双重保障
- 涉及文件：[AuthGuard.tsx](frontend/src/components/AuthGuard/AuthGuard.tsx)、[router.tsx](frontend/src/router.tsx)

### 主题系统（深色/浅色模式）

支持三种模式：浅色（light）、深色（dark）、跟随系统（system）：

- `themeStore`：Zustand store 管理主题状态，localStorage 持久化偏好
- CSS 变量体系：`--color-*`、`--shadow-*`、`--radius-*` 等设计 token，统一在 [index.css](frontend/src/index.css) 中定义
- 通过 `<html data-theme="dark|light">` 属性切换主题，所有组件继承 CSS 变量
- 设置页面提供三段式切换按钮（浅色/深色/跟随系统）
- `main.tsx` 初始化时同步应用主题，监听系统主题变化
- 涉及文件：[themeStore.ts](frontend/src/store/themeStore.ts)、[Setting.tsx](frontend/src/pages/user/setting/Setting.tsx)、[index.css](frontend/src/index.css)、[main.tsx](frontend/src/main.tsx)

### 图片存储（Cloudinary）

项目使用 Cloudinary 作为图片持久化存储，替代 Render 临时磁盘：

- **存储路径**：`family-website/avatars/`（头像）和 `family-website/photos/`（照片）
- **上传流程**：后端接收文件 → 魔数验证 → 上传到 Cloudinary → 保存 public_id 到数据库
- **访问 URL**：通过 `storage.get_url(public_id)` 生成 Cloudinary 公网 URL，或 `uploadUrl()` 前端工具函数处理
- **删除**：best-effort 删除（失败仅 warn，不阻塞用户操作）
- **降级**：Cloudinary 未配置时抛 `CloudinaryNotConfiguredError`；旧格式路径（`/uploads/...`）原样返回由前端兜底
- **配置**：需在 `.env` 中设置 `CLOUDINARY_CLOUD_NAME`、`CLOUDINARY_API_KEY`、`CLOUDINARY_API_SECRET`
- 涉及文件：[storage.py](backend/app/services/storage.py)、[config.py](backend/app/core/config.py)

### 文件上传

- 头像：最大 5 MB，支持 JPEG/PNG/WebP，上传到 Cloudinary `family-website/avatars/`
- 照片：最大 10 MB，支持 JPEG/PNG/WebP，上传到 Cloudinary `family-website/photos/`
- 服务端三重验证：文件扩展名 + Content-Type + 魔数检测
- FastAPI StaticFiles 在 `/uploads` 路径挂载上传目录（仅本地开发降级使用）
- 照片 `after_delete` 事件自动清理磁盘文件 + Cloudinary 远端文件
- 删除相册时关联照片的 `album_id` 置为 NULL（SET NULL FK），照片文件不删除

### 邮件通知

美食点单通过 QQ SMTP 发送订单通知邮件。需要配置 `.env` 中的 SMTP 相关变量：
- `SMTP_HOST`：SMTP 服务器地址（QQ 邮箱默认 smtp.qq.com）
- `SMTP_PORT`：SMTP 端口（QQ 邮箱默认 587）
- `SMTP_USER`：发件 QQ 邮箱
- `SMTP_PASSWORD`：QQ 邮箱 SMTP 授权码
- `SMTP_NOTIFICATION_EMAIL`：接收订单通知的邮箱

邮件标题使用 `email.header.Header` 进行 UTF-8 编码，确保中文主题正常显示。

### 前端环境变量

- `VITE_API_BASE_URL`：后端 API 基础路径
  - 开发时留空 → 走 Vite 代理（`/api` → `localhost:8001`）
  - 开发时填写远程地址 → 直接请求远程后端（绕过 Vite 代理），适合配合已部署后端开发
  - 生产时设置为后端完整地址，如 `https://api.example.com/api`
- Vite 代理配置 `/uploads` → `localhost:8001`（仅在 `VITE_API_BASE_URL` 为空时生效）

### 前端 uploadUrl 工具

`uploadUrl(path)` 将后端返回的相对路径（如 `/uploads/avatars/xxx.jpg`）解析为可访问的完整 URL：
- 开发环境保持相对路径（走 Vite 代理）
- 生产环境替换为后端域名
- Cloudinary 路径（`family-website/...`）由后端 `storage.get_url()` 生成为完整 Cloudinary URL

### 家谱在线状态

`GET /api/family/status` 为可选认证端点：
- 无 token → 所有成员显示离线
- 已登录 → 用户 `username` 匹配家族成员名时，该成员标记为在线
- 当前家族成员名单（后端和前端需保持同步）：Lhf, Lqb, Lqq, Qd, Qyj, Ljy, Lln, Lyj

### 数据库注意事项

- `func.utc_timestamp()` 是 MySQL/MariaDB 专用语法，不适合迁移到 PostgreSQL/SQLite
- Photo 模型的 `album_id` 外键使用 `ondelete="SET NULL"`（删除相册不删除照片）
- 所有关系使用 `lazy="joined"` 或 `selectinload` 预加载，避免 async lazy-load 错误
- 数据库连接池配置：`pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`, `pool_recycle=3600`

### 已知设计决策

以下是针对家庭内部使用场景的**有意设计选择**，不是 bug：

| 决策 | 原因 |
|------|------|
| 密码重置无需邮箱验证 | 家庭内部使用，用户量小；若要登录才能重置则形成悖论（忘记密码无法登录）。CLAUDE.md 注明"仅适用于家庭场景" |
| 无登录/注册速率限制 | 家庭用户数极少，引入 in-memory rate limiter 或 Redis 不值得 |
| 无 JWT token 撤销机制 | 需要 DB migration 或 Redis 支持，对家庭网站过重；已有 refresh token 机制可限制 token 有效期 |
| 上传文件通过 Cloudinary 公网 URL 直接服务 | UUID 文件名提供足够隐蔽性保护私有相册照片；完全接入认证需大规模重构 |
| 无 Alembic 数据库迁移 | 使用 SQLAlchemy `create_all` 自动建表，适合低复杂度项目；已在 TODO 中列为低优先级 |
| 密码列名为 `password`（非 `hashed_password`） | 是历史设计，改名需要数据库迁移，风险大于收益 |

### 照片/头像上传限制

| 类型 | 最大大小 | 允许格式 | 配置位置 |
|------|---------|---------|---------|
| 头像 | 5 MB | JPEG/PNG/WebP | `settings.AVATAR_MAX_SIZE`, `settings.AVATAR_ALLOWED_CONTENT_TYPES` |
| 照片 | 10 MB | JPEG/PNG/WebP | `settings.PHOTO_MAX_SIZE`, `settings.PHOTO_ALLOWED_CONTENT_TYPES` |
