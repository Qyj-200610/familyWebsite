# 家庭门户网站 — 前后端接口规范

> **版本**: v1.2.2  
> **最后更新**: 2026-08-17（密码校验与后端对齐；同步 types.ts 移除 ApiResponse/RefreshTokenRequest；登录响应补充 refreshToken）  
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
  - [4.4 重置密码](#44-重置密码)
- [5. 用户模块 `/api/user`](#5-用户模块-apiuser)
  - [5.1 获取当前用户信息](#51-获取当前用户信息)
  - [5.2 更新用户信息](#52-更新用户信息)
- [6. 相册模块 `/api/photos` 与 `/api/albums`](#6-相册模块-apiphotos-与-apialbums)
  - [6.1 获取照片列表](#61-获取照片列表)
  - [6.2 上传照片](#62-上传照片)
  - [6.3 删除照片](#63-删除照片)
  - [6.4 创建相册](#64-创建相册)
  - [6.5 获取相册列表](#65-获取相册列表)
  - [6.6 获取相册详情](#66-获取相册详情)
  - [6.7 删除相册](#67-删除相册)
  - [6.8 上传照片到相册](#68-上传照片到相册)
  - [6.9 获取相册内照片](#69-获取相册内照片)
- [7. 美食模块 `/api/food`](#7-美食模块-apifood)
  - [7.1 提交点单](#71-提交点单)
- [8. 家谱模块 `/api/family`](#8-家谱模块-apifamily)
  - [8.1 获取家族成员在线状态](#81-获取家族成员在线状态)
- [9. 错误码对照表](#9-错误码对照表)
- [10. TypeScript 类型定义](#10-typescript-类型定义)

---

## 1. 约定

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| 协议 | HTTPS |
| Base URL（开发，通过前端代理） | `http://localhost:5175/api` |
| Base URL（后端直连） | `http://localhost:8001/api` |
| Base URL（生产） | `https://<your-domain>/api` |
| 请求体格式 | `application/json; charset=utf-8` |
| 认证方式 | Bearer Token（`Authorization: Bearer <token>`） |

### 1.2 请求头

```http
Content-Type: application/json; charset=utf-8
Authorization: Bearer <token>    <!-- 需要认证的接口必传 -->
```

### 1.3 命名约定

- URL 路径使用小写 + 短横线（kebab-case），如 `/api/auth/reset-password`
- 请求体 / 响应体字段使用 camelCase
- 枚举值使用 UPPER_SNAKE_CASE
- 日期时间统一为 ISO 8601 字符串（`YYYY-MM-DDTHH:mm:ss.sssZ`）

### 1.4 分页约定（列表接口通用）

照片列表接口使用偏移量分页：

```json
{
  "skip": 0,    // 跳过的记录数，默认 0
  "limit": 50   // 每页条数，默认 50
}
```

> 当前接口返回平铺数组，不包含 `total`/`totalPages`。如需总数统计，后续可扩展响应格式。

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
| `code` | `number` | 业务状态码。`0` 表示成功，非 `0` 表示异常（参见 [错误码对照表](#9-错误码对照表)） |
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

**响应体 — 正常**

```json
{
  "code": 0,
  "message": "ok",
  "data": { "status": "healthy", "database": "connected" }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.status` | `string` | `"healthy"` 表示服务正常运行 |
| `data.database` | `string` | `"connected"` 表示数据库可达；`"unreachable"` 表示数据库连接失败 |

**响应体 — 数据库不可达**

```json
{
  "code": 5000,
  "message": "服务异常",
  "data": { "status": "degraded", "database": "unreachable" }
}
```

> 数据库不可达时不视为致命错误，服务仍可响应，但 `code` 为非零值。

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
| `username` | `string` | 是 | 用户名，2–50 个字符 |
| `email` | `string` | 是 | 邮箱地址，需符合邮箱格式 |
| `password` | `string` | 是 | 密码，8–128 个字符，须包含大小写字母和数字 |

```json
{
  "username": "小明",
  "email": "xiaoming@example.com",
  "password": "Abc12345"
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
| `1003` | 密码格式不符合要求（由 Pydantic schema 校验，返回 HTTP 422，无独立业务错误码） |

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
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

> 字段含义同 [注册响应](#41-注册)。

**业务错误**

| code | 说明 |
|------|------|
| `1101` | 邮箱或密码错误 |
| `1102` | 账号已被禁用（预留，后端未实现） |
| `1103` | 登录过于频繁，请稍后再试（预留，后端未实现） |

---

### 4.3 退出登录

通知后端当前用户已退出（前端清除 token，服务端不维护会话状态）。

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
  "message": "已退出登录",
  "data": null
}
```

---

### 4.4 重置密码

通过注册邮箱重置密码（家庭场景简化版，无需邮件验证）。

```
POST /api/auth/reset-password
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | `string` | 是 | 注册时使用的邮箱 |
| `newPassword` | `string` | 是 | 新密码，8–128 个字符，须包含大小写字母和数字 |

```json
{
  "email": "xiaoming@example.com",
  "newPassword": "Newpass123"
}
```

**响应体**

```json
{
  "code": 0,
  "message": "密码已重置，请使用新密码登录",
  "data": null
}
```

**业务错误**

| code | 说明 |
|------|------|
| `1201` | 该邮箱未注册 |

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
    "lastLoginAt": "2026-07-30T12:00:00.000Z",
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
| `lastLoginAt` | `string` \| `null` | 最近登录时间（ISO 8601），从未登录过为 null |
| `createdAt` | `string` | 注册时间（ISO 8601） |

---

### 5.2 更新用户信息

```
PATCH /api/user/me
```

**请求体**（所有字段均为可选）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | `string` | 否 | 新用户名，2–50 字符 |
| `avatar` | `string` | 否 | 新头像 URL |

```json
{ "username": "小明的爸爸" }
```

**响应体** — 同 [获取当前用户信息](#51-获取当前用户信息)。

---

### 5.3 上传头像

```
POST /api/user/me/avatar
```

**请求头**

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体**（multipart/form-data）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | `File` | 是 | 头像图片文件。仅允许 JPEG、PNG、WebP，最大 5 MB |

**响应体** — 同 [获取当前用户信息](#51-获取当前用户信息)，`message` 为 `"头像上传成功"`。

**业务错误**

| code | 说明 |
|------|------|
| `2002` | 用户名已被占用（更新资料时） |
| `2003` | 未选择要上传的文件 |
| `2004` | 不支持的文件格式（扩展名不合法） |
| `2005` | 不支持的文件类型（MIME 类型不合法） |
| `2006` | 文件大小超出限制（最大 5 MB） |
| `2007` | 文件内容不是有效的图片格式（魔数检测失败） |

---

### 5.4 获取用户统计数据

```
GET /api/user/me/stats
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
  "data": {
    "photoCount": 12,
    "foodOrderCount": 0,
    "familyMemberCount": 8
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.photoCount` | `number` | 用户上传的照片总数 |
| `data.foodOrderCount` | `number` | 用户提交的点单次数（当前固定为 0） |
| `data.familyMemberCount` | `number` | 家族成员总数（固定值 8） |

> 此端点用于个人中心统计卡片展示。`foodOrderCount` 固定为 0 是因为点单系统当前不存储历史订单。

---

## 6. 相册模块 `/api/photos` 与 `/api/albums`

> 以下接口均需携带 `Authorization` 头。

### 6.0 全局照片访问说明

`GET /api/photos` 返回当前用户有权访问的所有照片：公开相册的照片、自己创建的相册的照片，以及未归属相册的照片。私有相册中属于其他用户的照片不会被返回。

### 6.1 获取照片列表

```
GET /api/photos?skip=0&limit=50
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `skip` | `number` | 否 | `0` | 跳过的记录数 |
| `limit` | `number` | 否 | `50` | 每页记录数 |

**响应体**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "filename": "a1b2c3d4.jpg",
      "originalFilename": "IMG_001.jpg",
      "fileSize": 2048000,
      "contentType": "image/jpeg",
      "description": "全家福",
      "uploadedBy": 1,
      "uploader": { "id": 1, "username": "小明" },
      "createdAt": "2026-07-15T12:00:00.000Z"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `filename` | `string` | 存储文件名（UUID） |
| `originalFilename` | `string` | 原始上传文件名 |
| `fileSize` | `number` | 文件大小（bytes） |
| `contentType` | `string` | MIME 类型 |
| `description` | `string` \| `null` | 照片描述 |
| `uploadedBy` | `number` | 上传者 ID |
| `uploader` | `object` \| `null` | 上传者简要信息 |
| `createdAt` | `string` | 上传时间（ISO 8601） |

---

### 6.2 上传照片

```
POST /api/photos/upload
```

**请求头**

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**请求体**（multipart/form-data）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | `File` | 是 | 照片文件。仅允许 JPEG、PNG、WebP，最大 10 MB |
| `description` | `string` | 否 | 照片描述（最多 200 字符） |

**响应体** — 同 [照片列表单项](#61-获取照片列表)，`message` 为 `"照片上传成功"`。

**业务错误**

| code | 说明 |
|------|------|
| `3001` | 未选择文件 |
| `3002` | 不支持的文件格式 |
| `3003` | 不支持的文件类型 |
| `3004` | 文件大小超出限制（最大 10 MB） |
| `3005` | 文件内容不是有效的图片格式 |

---

### 6.3 删除照片

```
DELETE /api/photos/{photo_id}
```

**请求头**

```http
Authorization: Bearer <token>
```

**响应体**

```json
{ "code": 0, "message": "照片已删除", "data": null }
```

**业务错误**

| code | HTTP 状态码 | 说明 |
|------|-------------|------|
| `3101` | `404` | 照片不存在 |
| `3102` | `403` | 只能删除自己上传的照片 |

---

### 6.4 创建相册

```
POST /api/albums
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | 是 | 相册名称，1–100 字符 |
| `isPublic` | `boolean` | 否 | 是否公开，默认 `true` |

**响应体** — 返回创建的相册对象，`message` 为 `"相册创建成功"`。

**业务错误**

| code | 说明 |
|------|------|
| `3201` | 相册名称不能为空 |

---

### 6.5 获取相册列表

```
GET /api/albums
```

返回所有公开相册 + 当前用户的私有相册，按创建时间倒序。

**响应体**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "家庭聚会",
      "isPublic": true,
      "createdBy": 1,
      "creator": { "id": 1, "username": "小明" },
      "photoCount": 5,
      "coverPhoto": { ... },
      "createdAt": "2026-07-15T12:00:00.000Z"
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `number` | 相册 ID |
| `name` | `string` | 相册名称 |
| `isPublic` | `boolean` | 是否公开 |
| `createdBy` | `number` | 创建者 ID |
| `creator` | `object` | 创建者简要信息 |
| `photoCount` | `number` | 照片数量 |
| `coverPhoto` | `object` \| `null` | 封面照片（最新一张） |
| `createdAt` | `string` | 创建时间（ISO 8601） |

---

### 6.6 获取相册详情

```
GET /api/albums/{album_id}
```

返回相册完整信息，包含照片列表。私有相册仅创建者可访问。

**业务错误**

| code | HTTP 状态码 | 说明 |
|------|-------------|------|
| `3202` | `404` | 相册不存在 |
| `3203` | `403` | 无权访问该相册 |

---

### 6.7 删除相册

```
DELETE /api/albums/{album_id}
```

删除相册（仅创建者可操作）。关联照片的 `albumId` 将被设为 `null`，照片文件不会被删除。

**业务错误**

| code | HTTP 状态码 | 说明 |
|------|-------------|------|
| `3202` | `404` | 相册不存在 |
| `3204` | `403` | 只能删除自己创建的相册 |

---

### 6.8 上传照片到相册

```
POST /api/albums/{album_id}/photos/upload
```

同 [6.2 上传照片](#62-上传照片)，但照片会关联到指定相册。

**请求体**（multipart/form-data）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | `File` | 是 | 照片文件 |
| `description` | `string` | 否 | 照片描述 |

---

### 6.9 获取相册内照片

```
GET /api/albums/{album_id}/photos?skip=0&limit=50
```

获取指定相册内的照片列表（分页）。私有相册仅创建者可访问。

---

## 7. 美食模块 `/api/food`

> 以下接口均需携带 `Authorization` 头。

### 7.1 提交点单

```
POST /api/food/orders
```

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `items` | `array` | 是 | 菜品列表，每项包含 `dishId`, `dishName`, `quantity` |
| `note` | `string` | 否 | 备注（最多 500 字符） |

```json
{
  "items": [
    { "dishId": 1, "dishName": "家烧六月黄", "quantity": 2 },
    { "dishId": 4, "dishName": "凉拌牛肉", "quantity": 1 }
  ],
  "note": "少放辣椒"
}
```

**响应体**

```json
{ "code": 0, "message": "点单成功！订单已通过邮件通知", "data": null }
```

**业务错误**

| code | 说明 |
|------|------|
| `4001` | 订单不能为空 |
| `4002` | 邮件发送失败（服务器 SMTP 配置问题） |

---

## 8. 家谱模块 `/api/family`

> 此端点支持可选认证。未登录时所有成员显示离线。

### 8.1 获取家族成员在线状态

```
GET /api/family/status
```

**请求头**

```http
Authorization: Bearer <token>    <!-- 可选 -->
```

**请求体**

无。

**响应体**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "members": [
      { "name": "Lhf", "online": true, "avatar": "/uploads/avatars/xxx.jpg" },
      { "name": "Lqb", "online": false, "avatar": null },
      { "name": "Qyj", "online": true, "avatar": "/uploads/avatars/yyy.jpg" }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `data.members` | `array` | 家族成员列表 |
| `members[].name` | `string` | 成员姓名（与家谱图节点 name 对应） |
| `members[].online` | `boolean` | 是否在线（已登录用户 username 匹配成员名时为 true） |
| `members[].avatar` | `string` \| `null` | 成员头像 URL（从 User 表匹配），未注册时为 null |

> 当前家族成员名单（后端和前端需保持同步）：Lhf, Lqb, Lqq, Qd, Qyj, Ljy, Lln, Lyj

---

## 9. 错误码对照表

### 9.1 通用错误

| code | 说明 |
|------|------|
| `0` | 成功 |
| `5000` | 服务异常（如数据库不可达，见健康检查） |

> HTTP 状态码（401/403/404/422/500）在 HTTP 响应头中返回，`code` 字段始终为业务错误码。

### 9.2 认证错误 (`1xxx`)

| code | 说明 |
|------|------|
| `1001` | 该邮箱已被注册 |
| `1002` | 用户名已被占用 |
| `1101` | 邮箱或密码错误 |
| `1201` | 该邮箱未注册 |

### 9.3 用户错误 (`2xxx`)

| code | 说明 |
|------|------|
| `2002` | 用户名已被占用（更新资料时） |
| `2003` | 未选择要上传的文件（头像） |
| `2004` | 不支持的文件格式（头像） |
| `2005` | 不支持的文件类型（头像） |
| `2006` | 文件大小超出限制（头像，最大 5 MB） |
| `2007` | 文件内容不是有效的图片格式（头像魔数检测） |

### 9.4 相册错误 (`3xxx`)

| code | 说明 |
|------|------|
| `3001` | 未选择要上传的文件 |
| `3002` | 不支持的文件格式 |
| `3003` | 不支持的文件类型 |
| `3004` | 文件大小超出限制 |
| `3005` | 文件内容不是有效的图片格式 |
| `3101` | 照片不存在 |
| `3102` | 只能删除自己上传的照片 |
| `3201` | 相册名称不能为空 |
| `3202` | 相册不存在 |
| `3203` | 无权访问该相册 |
| `3204` | 只能操作自己创建的相册 |

### 9.5 美食点单错误 (`4xxx`)

| code | 说明 |
|------|------|
| `4001` | 订单不能为空 |
| `4002` | 邮件发送失败 |

---

## 10. TypeScript 类型定义

以下类型与前端 [`types.ts`](../src/api/types.ts) 保持一致，可直接用于项目中：

```typescript
// === 用户 ===

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  lastLoginAt?: string | null;
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

/** 认证成功返回（登录 & token 刷新通用） */
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// === 用户操作 ===

/** PATCH /api/user/me */
interface UpdateUserRequest {
  username?: string;
  avatar?: string;
}

/** GET /api/user/me/stats */
interface UserStats {
  photoCount: number;
  foodOrderCount: number;
  familyMemberCount: number;
}

// === 认证 ===

/** POST /api/auth/reset-password */
interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

// === 相册 ===

/** 照片上传者 / 相册创建者简要信息 */
interface PhotoUploader {
  id: number;
  username: string;
}

/** 照片 */
interface Photo {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  description: string | null;
  uploadedBy: number;
  uploader: PhotoUploader | null;
  albumId: number | null;
  createdAt: string;
}

/** 相册 */
interface Album {
  id: number;
  name: string;
  isPublic: boolean;
  createdBy: number;
  creator: PhotoUploader | null;
  photoCount: number;
  coverPhoto: Photo | null;
  createdAt: string;
}

/** 相册详情（含照片列表） */
interface AlbumDetail extends Album {
  photos: Photo[];
}

/** POST /api/albums 创建相册 */
interface AlbumCreateRequest {
  name: string;
  isPublic?: boolean;
}

// === 美食点单 ===

/** 订单中的单个菜品 */
interface OrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
}

/** POST /api/food/orders */
interface SubmitOrderRequest {
  items: OrderItem[];
  note?: string;
}

// === 家谱在线状态 ===

/** 单个家族成员在线状态 */
interface FamilyMemberStatus {
  name: string;
  online: boolean;
  avatar: string | null;
}

/** GET /api/family/status */
interface FamilyStatusResponse {
  members: FamilyMemberStatus[];
}
```

---

> **维护者**: 前端开发团队  
> **相关文档**: [README.md](../README.md)
