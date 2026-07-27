# COMPLETED — 后端已完成功能

> 最后更新：2026-07-26（debug 后更新）

---

## 项目初始化

- [x] FastAPI 应用骨架（`app/main.py`）
- [x] 配置管理（pydantic-settings, `.env` 加载）
- [x] 目录结构规范：`core/`, `models/`, `schemas/`, `services/`, `api/`

---

## 核心基础设施

| 文件 | 说明 |
|------|------|
| `app/core/config.py` | pydantic-settings 配置 — `DATABASE_URL`, `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES` |
| `app/core/database.py` | SQLAlchemy 2.0 async engine + `async_session_factory` + `get_db` 依赖注入（自动 commit/rollback） |
| `app/core/security.py` | bcrypt 密码哈希（passlib）+ JWT 创建/解码（python-jose） |
| `app/core/response.py` | 统一响应工具 — `success_response(data, message)` / `error_response(code, message, status_code)` |
| `app/models/user.py` | User ORM 模型 — `id`, `username`, `email`, `hashed_password`, `avatar`, `created_at`, `updated_at` |
| `app/schemas/user.py` | Pydantic Schema — `RegisterRequest`, `LoginRequest`, `UpdateUserRequest`, `UserResponse`, `AuthResponse` |
| `app/services/user.py` | 用户业务逻辑 — `create_user`, `authenticate_user`, `get_user_by_id`, `update_user` |
| `app/api/deps.py` | `get_current_user` 依赖注入 — JWT 解析 + 用户查询，自动抛出 401 |
| `app/api/v1/router.py` | API v1 路由聚合 + `GET /api/health` 健康检查 |
| `app/api/v1/endpoints/auth.py` | 认证端点 — register / login / logout |
| `app/api/v1/endpoints/user.py` | 用户端点 — get me / update me |

---

## 认证模块 `/api/auth`

- [x] **注册** `POST /api/auth/register` — 校验邮箱/用户名唯一性，创建用户，**不再自动登录**（需手动前往登录页）
- [x] **登录** `POST /api/auth/login` — 邮箱+密码认证，返回 JWT token + 用户信息
- [x] **退出** `POST /api/auth/logout` — 需 Bearer Token，前端清除 token（当前为无状态 JWT，token 在服务端不主动失效）
- [x] 错误码体系：
  - `1001` — 该邮箱已被注册
  - `1002` — 用户名已被占用
  - `1101` — 邮箱或密码错误

---

## 用户模块 `/api/user`

- [x] **获取个人信息** `GET /api/user/me` — 需认证
- [x] **更新个人信息** `PATCH /api/user/me` — 用户名/头像更新，含唯一性校验

---

## 系统模块

- [x] **健康检查** `GET /api/health` — 不依赖数据库，始终返回 `healthy`
- [x] **CORS 中间件** — 允许 `localhost:5175` 跨域请求
- [x] **Lifespan 管理** — 启动时自动建表（DB 不可用时仅 warn，不阻止服务启动），关闭时释放连接池

---

## 安全措施

- [x] 密码 bcrypt 哈希存储（passlib）
- [x] JWT 签名 + 过期时间验证
- [x] Bearer Token 从请求头提取（HTTPBearer）
- [x] 注册/更新时用户名和邮箱唯一性检查
- [x] Pydantic 请求体自动校验（邮箱格式、字段长度等）

---

## 调试记录 (2026-07-26)

- [x] 修复：登录错误码从 `1003` 改为 `1101`，与 [interface.md](../../frontend/docs/interface.md) 错误码对照表保持一致
- [x] 修复：确认注册接口返回 `data: null` 的设计（需手动登录），更新接口文档以匹配
- [x] 修复：填充空白的 `backend/docs/TODOLIST.md` 和 `backend/docs/COMPLETED.md`
