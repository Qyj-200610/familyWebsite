# Family Website — 家庭门户网站

一个全栈家庭门户网站，包含相册、美食点单、留言等功能模块。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19, TypeScript, Vite 8, React Router 7, Zustand 5, Axios |
| 后端 | FastAPI (Python), SQLAlchemy 2.0 (async), MySQL, Pydantic v2 |
| 认证 | JWT (python-jose), bcrypt (passlib) |
| 邮件 | QQ SMTP（用于美食点单通知） |

## 项目结构

```
familyWebsite/
├── backend/                     # FastAPI 后端
│   ├── .env.example             # 环境变量模板
│   ├── requirements.txt         # Python 依赖
│   ├── uploads/                 # 上传文件存储目录
│   └── app/
│       ├── main.py              # 应用入口，CORS，StaticFiles，lifespan
│       ├── api/
│       │   ├── deps.py          # 依赖注入（get_current_user）
│       │   └── v1/
│       │       ├── router.py    # /api 路由聚合
│       │       └── endpoints/
│       │           ├── auth.py  # /api/auth/*
│       │           ├── user.py  # /api/user/*
│       │           ├── photo.py # /api/photos/*
│       │           └── food.py  # /api/food/*
│       ├── core/
│       │   ├── config.py        # Pydantic Settings（读取 .env）
│       │   ├── security.py      # JWT + bcrypt 工具
│       │   ├── database.py      # SQLAlchemy async engine & session
│       │   └── response.py      # 统一响应格式 {code, message, data}
│       ├── models/
│       │   ├── user.py          # User 模型 + Base 声明式基类
│       │   └── photo.py         # Photo 模型
│       ├── schemas/
│       │   ├── user.py          # 用户请求/响应 Pydantic 模型
│       │   ├── photo.py         # 照片请求/响应 Pydantic 模型
│       │   └── food.py          # 点单请求 Pydantic 模型
│       ├── services/
│       │   ├── user.py          # UserService — 用户业务逻辑
│       │   ├── photo.py         # PhotoService — 照片业务逻辑
│       │   └── food.py          # FoodService — 邮件通知
│       └── utils/
│           └── image.py         # 图片魔数检测（JPEG/PNG/WebP）
├── frontend/                    # React SPA 前端
│   ├── index.html
│   ├── vite.config.ts           # Vite 配置 + API 代理
│   └── src/
│       ├── main.tsx             # React 入口
│       ├── App.tsx              # 首页（未登录时的展示页）
│       ├── router.tsx           # React Router 路由定义
│       ├── api/
│       │   ├── client.ts        # Axios 实例 + 拦截器
│       │   ├── types.ts         # 前端 API 类型定义
│       │   ├── auth.ts          # 认证 API 封装
│       │   ├── user.ts          # 用户 API 封装
│       │   ├── photo.ts         # 相册 API 封装
│       │   └── food.ts          # 美食 API 封装
│       ├── store/
│       │   └── authStore.ts     # Zustand 认证状态管理
│       ├── utils/
│       │   └── navigate.ts      # 全局导航工具（供拦截器使用）
│       └── pages/
│           ├── home/            # 首页（已登录）
│           ├── auth/            # 登录/注册页面
│           ├── photoAlbum/      # 家庭相册
│           ├── foodOrder/       # 美食点单
│           ├── user/
│           │   ├── setting/     # 用户设置
│           │   └── personalCenter/ # 个人中心
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
cp .env.example .env  # 编辑数据库和 SMTP 配置
uvicorn app.main:app --reload --port 8000
```

### 前端

```bash
cd frontend
npm install
npm run dev  # 启动在 localhost:5175，代理 /api → localhost:8000
```

### 数据库

使用 MySQL。首次启动后端时，`lifespan` 事件会自动建表（`Base.metadata.create_all`）。

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

### 命名规范

- **后端**：Python snake_case 命名，Pydantic schema 使用 `alias` 映射到前端 camelCase
- **前端**：TypeScript camelCase 命名，axios 拦截器自动解包 `data` 字段
- **CSS**：BEM 命名，各页面使用独立前缀（`home__*`、`food__*`、`album__*` 等）

### 认证流程

1. 用户登录 → 后端返回 JWT token
2. 前端存储 token 到 localStorage（记住我）或 sessionStorage
3. axios 请求拦截器自动注入 `Authorization: Bearer <token>`
4. 后端 `get_current_user` 依赖解析 token 并注入 `User` 对象
5. 401 响应 → 拦截器自动清除状态并跳转登录页

### 文件上传

- 头像：`uploads/avatars/`，最大 2 MB，支持 JPEG/PNG/WebP
- 照片：`uploads/photos/`，最大 10 MB，支持 JPEG/PNG/WebP
- 服务端二次验证：文件扩展名 + Content-Type + 魔数检测
- FastAPI StaticFiles 在 `/uploads` 路径挂载上传目录

### 邮件通知

美食点单通过 QQ SMTP 发送订单通知邮件。需要配置 `.env` 中的 SMTP 相关变量：
- `SMTP_USER`：发件 QQ 邮箱
- `SMTP_PASSWORD`：QQ 邮箱 SMTP 授权码
- `SMTP_NOTIFICATION_EMAIL`：接收订单通知的邮箱
