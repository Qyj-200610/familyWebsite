# Family Website

家庭门户网站

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 状态管理 | Zustand（认证 + 主题） |
| 路由 | React Router v7 |
| HTTP 客户端 | Axios（含 token 自动刷新） |
| 后端框架 | FastAPI (Python 3.12) |
| ORM | SQLAlchemy 2.0 (async) |
| 数据库 | MySQL 8+ / TiDB Cloud |
| 认证 | JWT 双 token（python-jose + passlib） |
| 图片存储 | Cloudinary 云存储 |
| 部署 | Cloudflare Pages + Render + TiDB Cloud |

## 端口

| 服务 | 端口 |
| --- | --- |
| 前端开发服务器 | 5175 |
| 后端 API 服务器 | 8001 |

> 前端 Vite 开发服务器通过代理将 `/api/*` 请求转发到后端 `http://localhost:8001`，开发时无需额外配置 CORS。

## 目录

```
familyWebsite/
├── frontend/
│   ├── src/
│   │   ├── api/          # 接口层（Axios 客户端 + 端点模块 + 类型定义）
│   │   ├── store/        # Zustand 状态管理（authStore + themeStore）
│   │   ├── pages/        # 页面组件
│   │   ├── components/   # 共享组件（PageNav, Auth, AuthGuard, DailyRoutine）
│   │   ├── utils/        # 工具函数
│   │   ├── svg/          # SVG 图标资源
│   │   ├── App.tsx       # 封面页
│   │   ├── router.tsx    # 路由定义 + AuthGuard 守卫
│   │   └── main.tsx      # 入口文件（含主题初始化）
│   ├── docs/
│   │   ├── interface.md  # 前后端接口规范
│   │   ├── FAMILY.md     # 家族谱系数据规格
│   │   ├── TODOLIST.md   # 待办事项
│   │   └── COMPLETED.md  # 已完成功能
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── main.py       # FastAPI 应用入口
│   │   ├── core/         # 配置、数据库、安全、响应工具
│   │   ├── models/       # SQLAlchemy ORM 模型
│   │   ├── schemas/      # Pydantic 请求/响应模型
│   │   ├── services/     # 业务逻辑层（含 Cloudinary 存储）
│   │   └── api/          # 路由与端点
│   ├── requirements.txt
│   ├── .env              # 环境变量（数据库连接、JWT 密钥、Cloudinary 凭证等）
│   └── .env.example
└── README.md
```

## 开始

### 前置条件

- Node.js 18+ 和 npm
- Python 3.12+
- MySQL 8+（或使用 TiDB Cloud 进行云端开发）

### 1. 克隆与安装

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

编辑 `backend/.env`，修改数据库连接、JWT 密钥和 Cloudinary 凭证：

```env
# 数据库
DATABASE_URL=mysql+aiomysql://用户名:密码@localhost:3306/family_website
DATABASE_SSL=false

# JWT
JWT_SECRET=你的密钥
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=30
JWT_REFRESH_EXPIRE_DAYS=7

# Cloudinary（图片持久化存储，可选但推荐配置）
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP（可选，用于美食点单邮件通知）
SMTP_HOST=smtp.qq.com
SMTP_PORT=587
SMTP_USER=your_qq@qq.com
SMTP_PASSWORD=your_smtp_authorization_code
SMTP_NOTIFICATION_EMAIL=recipient@example.com
```

确保 MySQL 已启动，并创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS family_website DEFAULT CHARSET utf8mb4;
```

### 3. 启动服务

```bash
# 终端 1 — 启动后端（端口 8001）
cd backend
uvicorn app.main:app --reload --port 8001

# 终端 2 — 启动前端（端口 5175）
cd frontend
npm run dev
```

### 4. 验证连通性

```bash
# 直接测试后端
curl http://localhost:8001/api/health
# → {"code":0,"message":"ok","data":{"status":"healthy"}}

# 通过前端代理测试（验证前后端联通）
curl http://localhost:5175/api/health
# → {"code":0,"message":"ok","data":{"status":"healthy"}}
```

打开浏览器访问：
- 前端页面：http://localhost:5175
- 后端 API 文档（Swagger）：http://localhost:8001/docs

## 功能

- [x] 项目初始化（前后端脚手架）
- [x] 用户认证（注册、登录、退出、忘记密码/重置密码、Token 持久化、"记住我"）
- [x] Token 刷新机制（access 30min + refresh 7天，自动静默刷新）
- [x] 路由守卫（AuthGuard 统一拦截未登录访问）
- [x] 用户信息（获取/更新个人信息、头像上传）
- [x] 深色/浅色主题切换（支持跟随系统）
- [x] 家庭相册（创建/删除相册、上传/浏览/删除照片、Cloudinary 云存储）
- [x] 美食点单（菜品浏览、购物车、邮件通知）
- [x] 家谱图（家族成员树、在线状态指示器）
- [x] 日程管理（每日模板、勾选完成、localStorage 持久化）
- [ ] 家庭留言

## API 接口

> Base URL: `http://localhost:8001/api`（开发环境）

### 系统

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/health` | 健康检查 | 无 |

### 认证

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| POST | `/auth/register` | 注册 | 无 |
| POST | `/auth/login` | 登录 | 无 |
| POST | `/auth/refresh` | 刷新 token | Refresh Token |
| POST | `/auth/logout` | 退出登录 | Bearer Token |
| POST | `/auth/reset-password` | 重置密码 | 无 |

### 用户

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/user/me` | 获取当前用户信息 | Bearer Token |
| PATCH | `/user/me` | 更新用户信息 | Bearer Token |
| POST | `/user/me/avatar` | 上传头像 | Bearer Token |

### 家谱

| 方法 | 路径 | 说明 | 认证 |
| --- | --- | --- | --- |
| GET | `/family/status` | 获取家族成员在线状态 | 可选 |

> 完整的接口规范（含请求/响应格式、错误码、TypeScript 类型）见 [frontend/docs/interface.md](frontend/docs/interface.md)

## 部署

项目已部署上线，详见 [PUBLISH.md](PUBLISH.md)：

| 服务 | 平台 | URL |
| --- | --- | --- |
| 前端 | Cloudflare Pages | https://family-website-cgh.pages.dev |
| 后端 | Render | https://familywebsite-qkqd.onrender.com |
| 数据库 | TiDB Cloud | Developer Tier（免费） |
| 图片存储 | Cloudinary | 免费额度（25 GB 存储 + 25 GB/月带宽） |

## 架构说明

```
浏览器
    │
    ├── 页面请求 → Cloudflare Pages CDN → React SPA
    │
    └── API 请求 /api/* → Render（FastAPI）
                              │
                              ├── 业务数据 ⇄ TiDB Cloud（MySQL）
                              │
                              └── 图片上传/访问 → Cloudinary（CDN 加速）
```

## License

待定
