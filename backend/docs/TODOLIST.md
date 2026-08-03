# TODOLIST — 后端待办事项

> 最后更新：2026-08-03（后端 Debug 全面审查 + 文档更新）

---

## 🔴 高优先级（核心功能）

- [x] **Token 黑名单 / 刷新机制** — 已实现双 token 机制（access 30min + refresh 7天 + 轮换），`POST /api/auth/refresh` 端点已上线
  - 涉及文件：[auth.py](../app/api/v1/endpoints/auth.py), [security.py](../app/core/security.py)

- [x] **密码强度校验** — 已在 `RegisterRequest` 和 `ResetPasswordRequest` 中添加 `@field_validator`，要求密码至少 8 个字符、包含大小写字母和数字
  - 涉及文件：[schemas/user.py](../app/schemas/user.py)

- [ ] **登录限流** — 防止暴力破解
  - 方案：slowapi / fastapi-limiter 中间件
  - 登录失败计数 + IP 封禁

---

## 🟡 中优先级（功能完善）

- [ ] **忘记密码邮件验证** — 当前重置密码仅需邮箱+新密码（家庭场景的简化实现）
  - `POST /api/auth/forgot-password` — 发送重置邮件（含重置链接/token）
  - `POST /api/auth/reset-password` — 验证重置 token + 更新密码（增强版）
  - 涉及：邮件服务集成、重置 token 生成与过期

- [ ] **邮箱验证** — 注册后发送验证邮件
  - `POST /api/auth/verify-email` — 验证邮箱 token
  - User 模型新增 `email_verified` 字段

- [ ] **第三方登录** — 微信 OAuth / 手机号验证码登录
  - 微信：OAuth 2.0 授权流程
  - 手机号：短信验证码服务

- [ ] **账户安全增强** — 修改密码、双因素认证
  - `POST /api/user/change-password` — 旧密码 + 新密码
  - `POST /api/user/enable-2fa` / `POST /api/user/disable-2fa`

---

## 🟢 低优先级（后续迭代）

- [x] **家庭相册 API** — 照片上传、时间线查询、相册 CRUD ✅ 已完成
- [x] **邮件通知** — 美食点单 QQ SMTP 邮件通知 ✅ 已完成
- [x] **家谱在线状态** — 家族成员在线状态查询 ✅ 已完成（使用标准 `get_optional_user` 依赖注入）
- [ ] **日程管理 API** — 家庭共享日历、事件 CRUD、提醒通知
- [ ] **家庭留言 API** — 留言板 / 实时聊天
- [ ] **家庭成员关系** — 邀请、加入家庭组、角色权限
- [ ] **数据库迁移工具** — Alembic 集成，管理 schema 变更
- [ ] **API 版本管理** — `/api/v2/` 的路由规划

---

## ⚪ 技术债务

- [x] **全局异常处理** — 统一捕获未处理异常，返回标准 `error_response` 格式 ✅ 已完成
- [x] **配置校验** — `Settings` 类已添加 `@field_validator`：DATABASE_URL 格式检查、JWT_SECRET 非空校验
  - 涉及文件：[config.py](../app/core/config.py)
- [ ] **日志系统** — 结构化日志（structlog / loguru），区分开发/生产
- [x] **数据库连接池** — 已显式配置 `pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`, `pool_recycle=3600`
  - 涉及文件：[database.py](../app/core/database.py)
- [ ] **异步任务队列** — Celery / ARQ 处理邮件发送等耗时操作
- [ ] **单元测试** — pytest + pytest-asyncio + httpx (TestClient)
- [ ] **Docker 化** — Dockerfile + docker-compose（FastAPI + MySQL）
- [ ] **CI/CD** — GitHub Actions lint + test
