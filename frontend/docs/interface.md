# 家庭门户网站 — 前后端接口规范

> **版本**: v1.0.0  
> **最后更新**: 2026-07-26  
> **技术栈**: React 19 + TypeScript + Vite + Axios  

---

## 目录

- [1. 约定](#1-约定)
- [2. 通用响应结构](#2-通用响应结构)
- [3. 系统模块 `/api`](#3-系统模块-api)
  - [3.1 健康检查](#31-健康检查)
- [4. 认证模块 `/api/auth`](#4-认证模块-apiauth)
  - [4.1 注册](#41-注册)
  - [4.2 登录](#42-登录)
  - [4.3 退出登录](#43-退出登录)
- [5. 用户模块 `/api/user`](#5-用户模块-apiuser)
  - [5.1 获取当前用户信息](#51-获取当前用户信息)
  - [5.2 更新用户信息](#52-更新用户信息)
- [6. 家庭模块 `/api/family`](#6-家庭模块-apifamily) *(规划中)*
- [7. 错误码对照表](#7-错误码对照表)
- [8. TypeScript 类型定义](#8-typescript-类型定义)

---

## 1. 约定

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 协议 | HTTPS |
| Base URL（开发，通过前端代理） | `http://localhost:5175/api` |
| Base URL（后端直连） | `http://localhost:8000/api` |
| Base URL（生产） | `https://<your-domain>/api` |
| 请求体格式 | `application/json; charset=utf-8` |
| 认证方式 | Bearer Token（`Authorization: Bearer <token>`） |

### 1.2 请求头

```http
Content-Type: application/json; charset=utf-8
Authorization: Bearer <token>    <!-- 需要认证的接口必传 -->
```

### 1.3 命名约定

- URL 路径使用小写 + 短横线（kebab-case），如 `/api/auth/send-code`
- 请求体 / 响应体字段使用 camelCase
- 枚举值使用 UPPER_SNAKE_CASE
- 日期时间统一为 ISO 8601 字符串（`YYYY-MM-DDTHH:mm:ss.sssZ`）

### 1.4 分页约定（列表接口通用）

```json
{
  "page": 1,        // 页码，从 1 开始
  "pageSize": 20,   // 每页条数，默认 20，最大 100
  "total": 200,     // 总条数
  "totalPages": 10  // 总页数
}
```

---

## 2. 通用响应结构

所有接口响应均遵循以下统一格式：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | `number` | 业务状态码。`0` 表示成功，非 `0` 表示异常（参见 [错误码对照表](#7-错误码对照表)） |
| `message` | `string` | 状态描述（成功时为 `"success"`，失败时为可读的中文提示） |
| `data` | `object` \| `null` | 业务数据载荷；无数据时返回 `null` |

> **示例 — 成功**
> ```json
> { "code": 0, "message": "success", "data": { "id": 1, "username": "小明" } }
> ```

> **示例 — 失败**
> ```json
> { "code": 1001, "message": "该邮箱已被注册", "data": null }
> ```

---

## 3. 系统模块 `/api`

### 3.1 健康检查

验证 API 服务是否正常运行。

```
GET /api/health
```

**请求头**

无。

**请求体**

无。

**响应体**

```json
{
  "code": 0,
  "message": "ok",
  "data": { "status": "healthy" }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.status` | `string` | 固定为 `"healthy"` |

> 此端点不依赖数据库连接，即使数据库不可用也会返回成功。可用于前端启动时的连通性检测。

---

## 4. 认证模块 `/api/auth`

### 4.1 注册

创建新账号。

```
POST /api/auth/register
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | `string` | 是 | 用户名，2–20 个字符 |
| `email` | `string` | 是 | 邮箱地址，需符合邮箱格式 |
| `password` | `string` | 是 | 密码，6–32 个字符 |

```json
{
  "username": "小明",
  "email": "xiaoming@example.com",
  "password": "abc123"
}
```

**响应体**

注册成功后需手动登录，不自动返回 token。

```json
{
  "code": 0,
  "message": "账号 小明 注册成功，请登录",
  "data": null
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `message` | `string` | 成功提示，包含注册用户名 |

**业务错误**

| code | 说明 |
|------|------|
| `1001` | 该邮箱已被注册 |
| `1002` | 用户名已被占用 |
| `1003` | 密码格式不符合要求 |

---

### 4.2 登录

使用邮箱 + 密码登录。

```
POST /api/auth/login
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | `string` | 是 | 注册时使用的邮箱 |
| `password` | `string` | 是 | 密码 |

```json
{
  "email": "xiaoming@example.com",
  "password": "abc123"
}
```

**响应体**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "小明",
      "email": "xiaoming@example.com",
      "avatar": "https://cdn.example.com/avatars/1.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> 字段含义同 [注册响应](#41-注册)。

**业务错误**

| code | 说明 |
|------|------|
| `1101` | 邮箱或密码错误 |
| `1102` | 账号已被禁用 |
| `1103` | 登录过于频繁，请稍后再试 |

---

### 4.3 退出登录

使当前 token 失效。

```
POST /api/auth/logout
```

**请求头**

```http
Authorization: Bearer <token>
```

**请求体**

无。

**响应体**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 5. 用户模块 `/api/user`

> 以下接口均需携带 `Authorization` 头。

### 5.1 获取当前用户信息

```
GET /api/user/me
```

**响应体**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "小明",
    "email": "xiaoming@example.com",
    "avatar": "https://cdn.example.com/avatars/1.jpg",
    "createdAt": "2026-07-01T12:00:00.000Z"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `number` | 用户 ID |
| `username` | `string` | 用户名 |
| `email` | `string` | 邮箱 |
| `avatar` | `string` \| `null` | 头像 URL |
| `createdAt` | `string` | 注册时间（ISO 8601） |

---

### 5.2 更新用户信息

```
PATCH /api/user/me
```

**请求体**（所有字段均为可选）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | `string` | 否 | 新用户名，2–20 字符 |
| `avatar` | `string` | 否 | 新头像 URL |

```json
{ "username": "小明的爸爸" }
```

**响应体** — 同 [获取当前用户信息](#51-获取当前用户信息)。

---

## 6. 家庭模块 `/api/family` *(规划中)*

家庭相册、日程管理、家庭留言等功能将在后续版本中接入，届时补充此部分。

---

## 7. 错误码对照表

### 7.1 通用错误

| code | 说明 |
|------|------|
| `0` | 成功 |
| `401` | 未认证（token 缺失、过期或无效） |
| `403` | 无权限 |
| `404` | 资源不存在 |
| `422` | 请求参数校验失败，`message` 中返回具体原因 |
| `429` | 请求过于频繁 |
| `500` | 服务器内部错误 |

### 7.2 认证错误 (`1xxx`)

| code | 说明 |
|------|------|
| `1001` | 该邮箱已被注册 |
| `1002` | 用户名已被占用 |
| `1003` | 密码格式不符合要求 |
| `1101` | 邮箱或密码错误 |
| `1102` | 账号已被禁用 |
| `1103` | 登录过于频繁，请稍后再试 |

### 7.3 用户错误 (`2xxx`)

| code | 说明 |
|------|------|
| `2001` | 用户不存在 |

---

## 8. TypeScript 类型定义

以下类型与前端 [`types.ts`](../src/api/types.ts) 保持一致，可直接用于项目中：

```typescript
// === 通用结构 ===

/** 统一响应包装 */
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

/** 分页参数 */
interface PaginationParams {
  page: number;
  pageSize: number;
}

/** 分页响应 */
interface PaginatedData<T> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// === 用户 ===

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  createdAt?: string;
}

// === 认证 ===

/** POST /api/auth/register */
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/** POST /api/auth/login */
interface LoginRequest {
  email: string;
  password: string;
}

/** 认证成功返回（登录 & 注册通用） */
interface AuthResponse {
  user: User;
  token: string;
}

// === 用户 ===

/** PATCH /api/user/me */
interface UpdateUserRequest {
  username?: string;
  avatar?: string;
}
```

---

> **维护者**: 前端开发团队  
> **相关文档**: [README.md](../README.md)
