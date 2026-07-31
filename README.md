# Family Website

家庭门户网站

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 8 |
| 状态管理 | Zustand |
| 路由 | React Router v7 |
| HTTP 客户端 | Axios |
| 后端框架 | FastAPI (Python 3.12) |
| ORM | SQLAlchemy 2.0 (async) |
| 数据库 | MySQL 8+ |
| 认证 | JWT (python-jose + passlib) |

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
│   │   ├── store/        # Zustand 状态管理
│   │   ├── pages/        # 页面组件
│   │   ├── utils/        # 工具函数
│   │   ├── svg/          # SVG 图标资源
│   │   ├── App.tsx       # 封面页
│   │   └── main.tsx      # 入口文件
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
│   │   ├── services/     # 业务逻辑层
│   │   └── api/          # 路由与端点
│   ├── requirements.txt
│   ├── .env              # 环境变量（数据库连接、JWT 密钥等）
│   └── .env.example
└── README.md
```

## 开始

### 前置条件

- Node.js 18+ 和 npm
- Python 3.12+
- MySQL 8+（或使用 SQLite 进行本地测试）

### 1. 克隆与安装

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
pip install -r requirements.txt
```

### 2. 配置数据库

编辑 `backend/.env`，修改数据库连接信息：

```env
DATABASE_URL=mysql+aiomysql://用户名:密码@localhost:3306/family_website
JWT_SECRET=你的密钥
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
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
- [x] 用户信息（获取/更新个人信息、头像上传）
- [x] 忘记密码 / 重置密码
- [x] 家庭相册（创建/删除相册、上传/浏览/删除照片）
- [x] 美食点单（菜品浏览、购物车、邮件通知）
- [x] 家谱图（家族成员树、在线状态指示器）
- [x] 日程管理（每日模板、勾选完成、localStorage 持久化）
- [ ] 第三方登录（微信、手机号）
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

## 架构说明

```
浏览器 (localhost:5175)
    │
    ├── 页面请求 → Vite Dev Server (5175) → React SPA
    │
    └── API 请求 /api/* → Vite 代理 → FastAPI (8001)
                              │
                              ├── 路由层 (api/v1/)
                              ├── 服务层 (services/)
                              ├── 数据层 (models/ + SQLAlchemy)
                              └── MySQL (3306)
```

## License

待定

## Changelog

### 2026-07-30 — 全项目 Debug + 文档同步

**后端：**
- 修复头像上传后旧文件永不删除的问题
- 修复照片魔数检测未核对类型是否在允许列表中
- 新增全局异常处理器（未捕获异常返回 JSON 500）
- 新增 `get_optional_user` 可选认证依赖
- 重构 `family.py` 使用标准依赖注入
- 修复 `AlbumResponse` schema 缺少 `coverPhoto`/`photos` 字段
- 修复 `models/__init__.py` 导出所有模型

**前端：**
- 修复问候语/时间段冻结在挂载时刻的问题
- 已登录用户访问 `/` 自动重定向到 `/home`
- 创建家谱 API 模块 (`family.ts`) 替代直接调用 `client`
- 修复 `PersonalCenter.css` 拼写（原 `PersonCenter.css`）
- 4 处 `handleLogout` 空 catch 改为 `console.error`
- 新增 `env.d.ts` 类型声明 + `.env.example` 环境变量模板

**文档：**
- `interface.md` 新增家谱在线状态端点 + TypeScript 类型
- 所有文档同步至最新项目状态

### 2026-07-26 — 全项目 Debug（两轮）

**第一轮 — 功能 Bug：**
- **frontend**: 修复 Home/PersonalCenter/Setting 三处 `handleLogout` 缺少 `authApi.logout()` 调用
- **frontend**: `index.html` `lang` 属性从 `en` 改为 `zh-CN`
- **backend**: 登录错误码从 `1003` 改为 `1101`，与 `frontend/docs/interface.md` 保持一致
- **docs**: 修正 `interface.md` 注册响应文档（不再返回 `user+token`，改为 `data: null`）
- **docs**: 填充空白的 `backend/docs/TODOLIST.md` 和 `backend/docs/COMPLETED.md`

**第二轮 — 健壮性 & 代码质量：**
- **backend/config.py**: `.env` 路径改为相对 config 文件定位，CWD 降级（避免从项目根目录启动时找不到配置）
- **RegisterSuccess.tsx**: 倒计时重构 — `clearInterval` 移出 `setState` 回调，改用 `useRef` + 独立 `useEffect`
- **client.ts**: 响应拦截器增加空响应体保护，避免 null data 解构导致误导错误
- **router.tsx**: 统一所有 import 的 `.tsx` 后缀

**验证：** `tsc -b --noEmit` ✅ | 20 个 Python 文件 `py_compile` ✅ | 全部后端模块 import ✅ | `vite build` ✅
