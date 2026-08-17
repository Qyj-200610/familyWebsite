# COMPLETED — 后端已完成功能

> 最后更新：2026-08-17（前后端代码重构：响应转换/错误映射去重 + 后端 token 解析去重）

---

## 项目初始化

- [x] FastAPI 应用骨架（`app/main.py`）
- [x] 配置管理（pydantic-settings, `.env` 加载，`CORS_ORIGINS` 逗号分隔解析）
- [x] 目录结构规范：`core/`, `models/`, `schemas/`, `services/`, `api/`, `utils/`

---

## 核心基础设施

| 文件 | 说明 |
|------|------|
| `app/core/config.py` | pydantic-settings 配置 — `DATABASE_URL`, `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`, `CORS_ORIGINS`, 文件上传限制 |
| `app/core/database.py` | SQLAlchemy 2.0 async engine + `async_session_factory` + `get_db` 依赖注入（自动 commit/rollback） |
| `app/core/security.py` | bcrypt 密码哈希（passlib）+ JWT 创建/解码（python-jose） |
| `app/core/response.py` | 统一响应工具 — `success_response(data, message)` / `error_response(code, message, status_code)` |
| `app/main.py` | FastAPI 应用入口 — CORS 中间件、路由挂载、StaticFiles（/uploads）、lifespan（启动建表 / 关闭释放引擎）、全局异常处理器（JSON 500） |
| `app/models/user.py` | User ORM 模型 |
| `app/models/album.py` | Album ORM 模型 — 与 Photo 一对多（`ondelete="SET NULL"`） |
| `app/models/photo.py` | Photo ORM 模型 — `after_delete` 事件清理磁盘文件 |
| `app/schemas/user.py` | Pydantic Schema — `RegisterRequest`, `LoginRequest`, `ResetPasswordRequest`, `UpdateUserRequest`, `UserResponse`, `AuthResponse` |
| `app/schemas/album.py` | Pydantic Schema — `AlbumCreateRequest`, `AlbumResponse`（含 coverPhoto、photos） |
| `app/schemas/photo.py` | Pydantic Schema — `PhotoResponse` |
| `app/schemas/food.py` | Pydantic Schema — `SubmitOrderRequest` |
| `app/services/user.py` | 用户业务逻辑 — `create_user`, `authenticate_user`, `get_user_by_id`, `update_user`, `reset_password` |
| `app/services/album.py` | 相册业务逻辑 — `create_album`, `get_albums`, `get_album_by_id`, `delete_album`（含服务层名称验证） |
| `app/services/photo.py` | 照片业务逻辑 — `upload_photo`（扩展名 + Content-Type + 魔数三重验证）、`get_photos`、`get_photo_by_id`、`delete_photo` |
| `app/services/food.py` | 美食业务逻辑 — 邮件通知（QQ SMTP，Header UTF-8 编码中文主题） |
| `app/utils/image.py` | 图片魔数检测 — 支持 JPEG/PNG/WebP |
| `app/api/deps.py` | `get_current_user` 依赖注入 — JWT 解析 + 用户查询，自动抛出 401；`get_optional_user` — 可选认证，返回 None |
| `app/api/v1/router.py` | API v1 路由聚合 + `GET /api/health` 健康检查 |
| `app/api/v1/endpoints/auth.py` | 认证端点 — register / login / logout / reset-password |
| `app/api/v1/endpoints/user.py` | 用户端点 — get me / update me / upload avatar（含旧文件清理） |
| `app/api/v1/endpoints/album.py` | 相册端点 — 创建/列表/详情/删除 + 相册内照片上传/分页 |
| `app/api/v1/endpoints/photo.py` | 照片端点 — 按 ID 获取/删除照片 |
| `app/api/v1/endpoints/food.py` | 美食端点 — 提交点单 |
| `app/api/v1/endpoints/family.py` | 家谱端点 — 在线状态（可选认证，使用 `get_optional_user` 依赖） |

---

## 认证模块 `/api/auth`

- [x] **注册** `POST /api/auth/register` — 校验邮箱/用户名唯一性，创建用户，**不自动登录**（需手动前往登录页）
- [x] **登录** `POST /api/auth/login` — 邮箱+密码认证，返回 JWT token + 用户信息
- [x] **退出** `POST /api/auth/logout` — 需 Bearer Token，前端清除 token
- [x] **重置密码** `POST /api/auth/reset-password` — 通过注册邮箱重置密码（家庭场景，无需邮件验证）
- [x] 错误码体系：
  - `1001` — 该邮箱已被注册
  - `1002` — 用户名已被占用
  - `1101` — 邮箱或密码错误
  - `1201` — 该邮箱未注册

---

## 用户模块 `/api/user`

- [x] **获取个人信息** `GET /api/user/me` — 需认证
- [x] **更新个人信息** `PATCH /api/user/me` — 用户名/头像更新，含唯一性校验
- [x] **上传头像** `POST /api/user/me/avatar` — JPEG/PNG/WebP，最大 5 MB，扩展名 + Content-Type + 魔数三重验证，旧文件自动清理

---

## 相册模块 `/api/albums`

- [x] **创建相册** `POST /api/albums` — 名称 + 公开/私有
- [x] **相册列表** `GET /api/albums` — 公开相册 + 自己的私有相册，最新优先
- [x] **相册详情** `GET /api/albums/{id}` — 含照片列表，私有相册仅创建者可访问
- [x] **删除相册** `DELETE /api/albums/{id}` — 仅创建者可操作，照片 album_id 置 NULL（不删除文件）
- [x] **上传照片到相册** `POST /api/albums/{id}/photos/upload` — JPEG/PNG/WebP，最大 10 MB
- [x] **相册照片列表** `GET /api/albums/{id}/photos` — 分页查询

## 照片模块 `/api/photos`

- [x] **照片列表** `GET /api/photos` — 分页查询，含上传者信息
- [x] **上传照片** `POST /api/photos/upload` — JPEG/PNG/WebP，最大 10 MB
- [x] **删除照片** `DELETE /api/photos/{id}` — 仅上传者可删除，自动清理磁盘文件

## 美食模块 `/api/food`

- [x] **提交点单** `POST /api/food/orders` — 发送邮件通知（QQ SMTP），UTF-8 Header 编码中文主题

## 家谱模块 `/api/family`

- [x] **在线状态** `GET /api/family/status` — 可选认证，已登录用户匹配家族成员名则标记在线

---

## 系统模块

- [x] **健康检查** `GET /api/health` — 验证数据库连接；可达时返回 `healthy`，不可达时返回 HTTP 503 + `degraded` 状态
- [x] **CORS 中间件** — 允许 `localhost:5175` 和 `https://family-website-frontend-six.vercel.app` 跨域请求
- [x] **Lifespan 管理** — 启动时自动建表（DB 不可用时仅 warn，不阻止服务启动），关闭时释放连接池
- [x] **全局异常处理** — 未捕获异常返回 JSON `{code: 500, message: "服务器内部错误"}`

---

## 文件上传

- [x] **头像** — `uploads/avatars/`，最大 5 MB，JPEG/PNG/WebP，旧文件自动清理
- [x] **照片** — `uploads/photos/`，最大 10 MB，JPEG/PNG/WebP，`after_delete` 事件自动清理
- [x] **三重验证** — 文件扩展名 + Content-Type + 魔数检测（魔数类型必须属于允许列表）
- [x] **FastAPI StaticFiles** — `/uploads` 路径挂载上传目录

---

## 安全措施

- [x] 密码 bcrypt 哈希存储（passlib）
- [x] JWT 签名 + 过期时间验证
- [x] Bearer Token 从请求头提取（HTTPBearer）
- [x] 注册/更新时用户名和邮箱唯一性检查
- [x] Pydantic 请求体自动校验（邮箱格式、字段长度等）
- [x] 图片魔数检测防止伪造文件类型

---

## 调试记录

### 2026-08-17 — 后端代码重构（DRY + 可读性）

- [x] **`deps.py` 去重** — 抽取 `_resolve_user_from_token()` 共享辅助函数，`get_current_user` / `get_optional_user` 统一委托，消除重复的 token 解码 + 用户查询逻辑
- [x] **`response_helpers.py` 新增工具**：
  - `user_to_response()` — 用户 ORM → 响应字典（头像 public_id → 完整 URL），替代各端点重复的 `UserResponse.model_validate(...).model_dump(...)`
  - `map_value_error()` — 服务层 `ValueError` → 统一错误响应，替代各端点重复的 `code, msg = error_map.get(str(e), default)` 样板代码
- [x] **端点错误映射模块化** — `auth.py` 将 `_REGISTER_ERROR_MAP` / `_RESET_ERROR_MAP` 提升为模块级常量；`user.py` 新增 `_UPDATE_ERROR_MAP`；`refresh_token` 端点复用 `_auth_response()` 消除重复的 `AuthResponse` 构造
- [x] **`family.py` 可读性** — 成员列表推导式改写为显式 for 循环，避免重复调用 `avatar_map.get(name.lower())`
- [x] **import 清理** — `config.py` 将 `json` / `os` / `warnings` 提升到模块顶部；`services/photo.py` 移除冗余的内联 import；`router.py` 调整 import 顺序

### 2026-08-03 — 后端 Debug + 文档更新

- [x] **修复（关键）：`Photo.after_delete` 事件在事务提交前删除 Cloudinary 文件** — 将清理逻辑从 SQLAlchemy 事件移至 `PhotoService.delete_photo()` 服务层，确保 DB 删除成功后才清理 Cloudinary，避免回滚时文件永久丢失
- [x] **修复：`storage.py` `_ensure_initialized()` 线程安全** — 添加双重检查锁（`threading.Lock`），防止并发上传时的竞态条件
- [x] **修复：`get_db` 依赖注入捕获 `HTTPException` 导致不必要的回滚** — 改为仅捕获 `SQLAlchemyError`，HTTP 异常（401/403/404）正常传播
- [x] **修复：家谱端点头像 URL 未转换** — `GET /api/family/status` 返回原始 Cloudinary public_id，前端无法显示；添加 `get_url()` 调用
- [x] **修复：头像上传重复错误码 2006** — "文件内容为空"和"文件大小超限"共用 2006；文件大小超限改为 2010
- [x] **修复：`_validate_file` 返回未使用的 `ext` 变量** — 简化为仅返回 `detected_type`
- [x] **修复：`_album_to_response` 封面照片代码重复** — 使用共享的 `photo_to_response()` 辅助函数
- [x] **修复：`DATABASE_SSL_CA_PATH` 未在 `Settings` 中定义** — 添加为正式配置项，消除 `getattr`  hack
- [x] **修复：`JWT_SECRET` 校验器静默接受默认值** — 添加 `warnings.warn` 提示生产环境需覆盖
- [x] **更新：`API_REFERENCE.md`** — 新增 `POST /api/auth/refresh` 和 `GET /api/user/me/stats` 端点文档；修正头像/照片存储为 Cloudinary；新增错误码 2008-2010、3007-3008；密码要求从 6 位更正为 8 位（含大小写字母和数字）；登录响应增加 `refreshToken`
- [x] **更新：`TODOLIST.md`** — 标记 Token 刷新机制为已完成

### 2026-07-31 — 后端 Debug + 文档更新
- [x] 修复：`error_response()` 不支持 `data` 参数，导致健康检查在数据库不可达时崩溃（TypeError）
- [x] 修复：全局异常处理器返回 `error_response(500, ...)` 使用默认 `status_code=400`，应返回 HTTP 500
- [x] 修复：相册端点 `_ERROR_MAP` 使用 `"EMPTY_NAME"` 但 service 层抛出 `"NAME_REQUIRED"`，错误码不匹配
- [x] 修复：`AlbumService.create_album` 仅在验证时 strip 名称，未将 strip 后的值存入数据库
- [x] 修复：`Photo.content_type` 模型为 `String(50)` 但 API 文档记录为 `varchar(100)`，统一为 `String(100)`
- [x] 修复：`get_current_user` / `get_optional_user` 中 `int(user_id)` 可能因恶意 token 抛出 ValueError → 500，改为捕获并返回 401 / None
- [x] 更新：`error_response()` 新增 `data` 可选参数，支持自定义错误数据载荷
- [x] 更新：API_REFERENCE.md 错误码范围修正（1000–1099 注册, 1100–1199 登录）
- [x] 更新：CLAUDE.md 移除不存在的 `User.updated_at` 字段说明

### 2026-07-30 — 全项目 Debug
- [x] 修复：头像上传后旧文件永不删除（`current_user.avatar` 在 `update_user` 后被刷新）
- [x] 修复：照片魔数检测未核对类型是否在允许列表中
- [x] 修复：`_auth_response` 移除不必要的 `async`
- [x] 修复：`AlbumResponse` schema 新增 `coverPhoto` 和 `photos` 字段
- [x] 修复：`models/__init__.py` 导出所有模型
- [x] 修复：`get_photo_by_id` 添加显式 `selectinload`
- [x] 修复：`AlbumService.create_album` 添加服务层名称验证
- [x] 新增：全局异常处理器（JSON 500）
- [x] 新增：`get_optional_user` 依赖（可选认证）
- [x] 重构：`family.py` 使用标准依赖注入

### 2026-07-31 — 连通性回归测试

- [x] 测试：Render 后端全部 API 端点回归（auth / user / album / photo / family / food / health）— 12/12 通过
- [x] 测试：本地后端启动 + 连接 TiDB Cloud — 正常
- [x] 测试：CORS 预检（localhost:5175 → Render） — 通过，`access-control-allow-origin` 正确
- [x] 测试：前端 Vite dev server 全部路由 — 12/12 返回 200
- [x] 修复：前端 `website.svg`（favicon）被误删 → 已从 git 恢复（该文件被 `index.html` `<link rel="icon">` 引用）
- [x] 更新：CLAUDE.md 前端环境变量说明（VITE_API_BASE_URL 当前指向 Render）
- [x] 更新：frontend/docs/COMPLETED.md 新增连通性测试结果章节

### 2026-08-01 — 相册查询优化

- [x] **album.py service** — 所有相册查询添加链式 `selectinload(Album.photos).selectinload(Photo.uploader)`，预加载照片上传者信息，避免 N+1 查询和 async lazy-load 错误

### 2026-08-02 — 后端 Debug + 文档同步

- [x] 修复：健康检查 `GET /api/health` 在数据库不可达时返回 HTTP 400 → 改为 HTTP 503（`error_response` 添加 `status_code=503`），并添加异常日志记录
- [x] 修复：`UserService.update_user` 用户名唯一性检查存在 TOCTOU 竞态条件 → 添加 `IntegrityError` 捕获（与 `create_user` 一致），并发冲突时返回友好错误而非 500
- [x] 修复：照片列表接口 `limit` 参数无上界限制，可导致内存耗尽 → 添加 `min(max(limit, 1), 100)` 钳制到 [1, 100]
- [x] 修复：美食点单 SMTP 错误信息泄露给客户端 → 改为通用提示 "邮件发送失败，请稍后重试"
- [x] 更新：头像最大上传大小从 2 MB 更正为 5 MB（3 处：API_REFERENCE.md、COMPLETED.md、.env.example），与实际代码 `config.py` 保持一致
- [x] 更新：`COMPLETED.md` 健康检查描述更正 — 从"不依赖数据库，始终返回 healthy"改为准确描述双路行为
- [x] 更新：`API_REFERENCE.md` 数据库表结构中 6 处 `int` 类型更正为 `bigint`（id 列、created_by、uploaded_by、album_id），与 ORM 模型的 `BigInteger` 保持一致
- [x] 更新：`API_REFERENCE.md` 模型对照表中 `Photo.content_type` 从 `String(50)` 更正为 `String(100)`（2026-07-31 已修复模型但漏改此表）
- [x] 更新：`CLAUDE.md` 错误码范围表新增 `5000–5099 系统健康检查`
- [x] 更新：`frontend/docs/interface.md` 错误码 `1003`、`1102`、`1103` 标注为"预留，后端未实现"

### 2026-07-26 — 修复
- [x] 修复：登录错误码从 `1003` 改为 `1101`
- [x] 修复：确认注册接口返回 `data: null` 的设计
- [x] 修复：填充空白的 `backend/docs/`
