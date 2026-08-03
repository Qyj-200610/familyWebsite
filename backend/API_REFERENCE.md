# Family Website API 接口文档

> 三张数据库表（`users`、`albums`、`photos`）的所有接口，按表分类。
> 
> **注意**：本文档为后端开发快速参考。完整的前后端接口规范（含 TypeScript 类型定义、请求/响应示例）请参见 [frontend/docs/interface.md](../frontend/docs/interface.md)。

---

## 统一响应格式

```json
{
  "code": 0,       // 0 = 成功，非 0 = 业务错误码
  "message": "...",
  "data": { ... }  // 载荷
}
```

## 统一错误码

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

---

# 一、users 表

## 1.1 注册

```
POST /api/auth/register
```

**认证**：无需

**请求体**：
```json
{
  "username": "string (2-50)", 
  "email": "string (邮箱格式, ≤255)",
  "password": "string (8-128, 须包含大小写字母和数字)"
}
```

**数据库操作**：
- `SELECT` users 查邮箱/用户名是否已存在
- `INSERT` 新用户到 users 表

**成功响应** (code=0)：
```json
{ "code": 0, "message": "账号 xxx 注册成功，请登录", "data": null }
```

**错误码**：`1001` 邮箱已注册, `1002` 用户名已被占用, `1000` 注册失败

---

## 1.2 登录

```
POST /api/auth/login
```

**认证**：无需

**请求体**：
```json
{
  "email": "string (邮箱格式)",
  "password": "string (≥1)"
}
```

**数据库操作**：
- `SELECT` users 按 email 查询
- `UPDATE` users 更新 last_login_at 字段

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "success",
  "data": {
    "user": {
      "id": 1,
      "username": "Qyj",
      "email": "xxx@qq.com",
      "avatar": "https://res.cloudinary.com/.../family-website/avatars/abc123",
      "lastLoginAt": "2026-07-30T12:00:00Z",
      "createdAt": "2026-07-01T00:00:00Z"
    },
    "token": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**错误码**：`1101` 邮箱或密码错误

---

## 1.3 退出登录

```
POST /api/auth/logout
```

**认证**：需要 Bearer Token

**数据库操作**：无（仅前端清除 token）

**成功响应**：`{ "code": 0, "message": "已退出登录", "data": null }`

---

## 1.4 刷新 Token

```
POST /api/auth/refresh
```

**认证**：无需（使用 refresh token 本身作为凭证）

**请求体**：
```json
{
  "refreshToken": "string (非空)"
}
```

**数据库操作**：
- `SELECT` users 按 ID 查询（从 refresh token 中解析）

**成功响应** (code=0)：同 1.2 登录响应（返回新的 access + refresh token 对 + user 信息）

**错误码**：`1102` 刷新令牌无效或已过期, `1103` 刷新令牌格式错误, `1104` 用户不存在

---

## 1.5 重置密码

```
POST /api/auth/reset-password
```

**认证**：无需

**请求体**：
```json
{
  "email": "string (邮箱格式)",
  "newPassword": "string (8-128, 须包含大小写字母和数字)"
}
```

**数据库操作**：
- `SELECT` users 按 email 查询
- `UPDATE` users 更新 password 字段

**成功响应** (code=0)：`{ "code": 0, "message": "密码已重置，请使用新密码登录", "data": null }`

**错误码**：`1201` 该邮箱未注册, `1200` 密码重置失败

---

## 1.6 获取个人信息

```
GET /api/user/me
```

**认证**：需要 Bearer Token

**数据库操作**：无（直接返回已认证的 user 对象）

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "success",
  "data": {
    "id": 1,
    "username": "Qyj",
    "email": "xxx@qq.com",
    "avatar": "/uploads/avatars/xxx.jpg",
    "lastLoginAt": "2026-07-30T12:00:00Z",
    "createdAt": "2026-07-01T00:00:00Z"
  }
}
```

---

## 1.7 更新个人资料

```
PATCH /api/user/me
```

**认证**：需要 Bearer Token

**请求体**（均可选）：
```json
{
  "username": "string (2-50)",
  "avatar": "string (≤500)"
}
```

**数据库操作**：
- `SELECT` users 检查新用户名是否已存在
- `UPDATE` users 更新 username / avatar 字段

**成功响应** (code=0)：返回完整 user 对象（同 1.5）

**错误码**：`2002` 用户名已被占用, `2000` 更新失败

---

## 1.8 上传头像

```
POST /api/user/me/avatar
```

**认证**：需要 Bearer Token

**请求体**：`multipart/form-data`
| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | File | 头像文件，仅 jpg/png/webp，最大 5 MB |

**数据库操作**：
- `UPDATE` users 更新 avatar 字段为 Cloudinary public_id（如 `family-website/avatars/{uuid}`）

**文件存储**：Cloudinary（`family-website/avatars/` 目录），通过 `get_url()` 生成公网访问 URL

**成功响应** (code=0)：返回完整 user 对象（同 1.6）

**错误码**：`2003` 未选择文件, `2004` 不支持的文件格式, `2005` 不支持的文件类型, `2006` 文件内容为空, `2007` 文件内容不是有效图片, `2008` 图片存储未配置, `2009` 图片存储服务不可用, `2010` 文件大小超出限制

---

## 1.9 家谱在线状态

```
GET /api/family/status
```

**认证**：可选（带 token 则匹配在线状态）

**数据库操作**：
- `SELECT` users 查询 username + avatar（限定家族成员名单）

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "success",
  "data": {
    "members": [
      { "name": "Lhf", "online": false, "avatar": null },
      { "name": "Ljy", "online": false, "avatar": null },
      { "name": "Lln", "online": false, "avatar": null },
      { "name": "Lqb", "online": false, "avatar": null },
      { "name": "Lqq", "online": false, "avatar": null },
      { "name": "Lyj", "online": false, "avatar": null },
      { "name": "Qd",  "online": false, "avatar": null },
      { "name": "Qyj", "online": false, "avatar": null }
    ]
  }
}
```

**逻辑**：若请求携带有效 JWT，且 token 对应的 `username` 匹配家族成员名，则该成员 `online: true`。头像通过 `get_url()` 转换为 Cloudinary 公网 URL。

---

## 1.10 个人统计

```
GET /api/user/me/stats
```

**认证**：需要 Bearer Token

**数据库操作**：
- `SELECT COUNT(*)` photos 统计上传照片数

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "success",
  "data": {
    "photoCount": 5,
    "foodOrderCount": 0,
    "familyMemberCount": 8
  }
}
```

> **注意**：`foodOrderCount` 当前固定为 0（点单系统不存储订单）。

---

# 二、albums 表

## 2.1 创建相册

```
POST /api/albums
```

**认证**：需要 Bearer Token

**请求体**：
```json
{
  "name": "string (1-100)",
  "isPublic": true
}
```

**数据库操作**：
- `INSERT` 新记录到 albums 表
- `SELECT` users 获取创建者信息

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "相册创建成功",
  "data": {
    "id": 1,
    "name": "家庭旅行",
    "isPublic": true,
    "createdBy": 1,
    "creator": { "id": 1, "username": "Qyj" },
    "photoCount": 0,
    "createdAt": "2026-07-30T12:00:00Z",
    "coverPhoto": null
  }
}
```

**错误码**：`3201` 相册名称不能为空

---

## 2.2 获取相册列表

```
GET /api/albums
```

**认证**：需要 Bearer Token

**数据库操作**：
- `SELECT` albums（公开相册 + 自己的私有相册）
- `SELECT` photos（预加载，计算封面和照片数）
- `SELECT` users（预加载创建者信息）

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "success",
  "data": [
    {
      "id": 1,
      "name": "家庭旅行",
      "isPublic": true,
      "createdBy": 1,
      "creator": { "id": 1, "username": "Qyj" },
      "photoCount": 5,
      "createdAt": "2026-07-30T12:00:00Z",
      "coverPhoto": { ... }
    }
  ]
}
```

---

## 2.3 获取相册详情（含照片列表）

```
GET /api/albums/{album_id}
```

**认证**：需要 Bearer Token

**路径参数**：`album_id` — 相册 ID

**数据库操作**：
- `SELECT` albums 按 ID
- `SELECT` photos 预加载
- `SELECT` users 预加载创建者和上传者

**私有相册**：仅创建者可访问（否则 403）

**成功响应** (code=0)：
```json
{
  "code": 0, "message": "success",
  "data": {
    "id": 1,
    "name": "家庭旅行",
    "isPublic": true,
    "createdBy": 1,
    "creator": { "id": 1, "username": "Qyj" },
    "photoCount": 2,
    "createdAt": "2026-07-30T12:00:00Z",
    "coverPhoto": { ... },
    "photos": [
      {
        "id": 10,
        "filename": "abc123.jpg",
        "originalFilename": "DSC0001.jpg",
        "fileSize": 2048576,
        "contentType": "image/jpeg",
        "description": "全家福",
        "uploadedBy": 1,
        "uploader": { "id": 1, "username": "Qyj" },
        "albumId": 1,
        "createdAt": "2026-07-30T12:00:00Z"
      }
    ]
  }
}
```

**错误码**：`3202` 相册不存在, `3203` 无权访问

---

## 2.4 删除相册

```
DELETE /api/albums/{album_id}
```

**认证**：需要 Bearer Token

**注意**：关联照片的 `album_id` 设为 NULL（SET NULL），**照片文件不删除**。

**数据库操作**：
- `SELECT` albums 按 ID
- `DELETE` albums（照片 album_id 自动置 NULL）

**成功响应** (code=0)：`{ "code": 0, "message": "相册已删除", "data": null }`

**错误码**：`3202` 相册不存在, `3204` 只能删除自己创建的相册

---

## 2.5 上传照片到相册

```
POST /api/albums/{album_id}/photos/upload
```

**认证**：需要 Bearer Token

**路径参数**：`album_id` — 目标相册 ID

**请求体**：`multipart/form-data`
| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | File | 照片文件，仅 jpg/png/webp，最大 10 MB |
| `description` | string (可选) | 照片描述 |

**数据库操作**：
- `SELECT` albums 按 ID（校验存在和权限）
- `INSERT` 新记录到 photos 表
- `SELECT` users 获取上传者信息

**文件存储**：Cloudinary（`family-website/photos/` 目录），filename 为 Cloudinary public_id，通过 `get_url()` 生成公网 URL

**成功响应** (code=0)：返回 Photo 对象（同照片格式）

**错误码**：`3001-3008` 文件校验/存储错误, `3202` 相册不存在, `3203` 无权访问

---

## 2.6 获取相册内照片列表

```
GET /api/albums/{album_id}/photos?skip=0&limit=50
```

**认证**：需要 Bearer Token

**查询参数**：
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `skip` | 0 | 偏移量 |
| `limit` | 50 | 每页数量 |

**数据库操作**：
- `SELECT` albums 按 ID（校验存在和权限）
- `SELECT` photos 按 album_id 分页
- `SELECT` users 预加载上传者

**私有相册**：仅创建者可访问

**成功响应** (code=0)：Photo 对象数组（同照片格式）

**错误码**：`3202` 相册不存在, `3203` 无权访问

---

# 三、photos 表

## 3.1 上传照片（无相册）

```
POST /api/photos/upload
```

**认证**：需要 Bearer Token

**请求体**：`multipart/form-data`
| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | File | 照片文件，仅 jpg/png/webp，最大 10 MB |
| `description` | string (可选) | 照片描述 |

**数据库操作**：
- `INSERT` 新记录到 photos 表（album_id = NULL）
- `SELECT` users 获取上传者信息

**文件存储**：Cloudinary（`family-website/photos/` 目录），filename 为 Cloudinary public_id

**成功响应** (code=0)：返回 Photo 对象

**错误码**：`3001-3008` 文件校验/存储错误

---

## 3.2 获取照片列表

```
GET /api/photos?skip=0&limit=50
```

**认证**：需要 Bearer Token

**查询参数**：
| 参数 | 默认值 | 说明 |
|------|--------|------|
| `skip` | 0 | 偏移量 |
| `limit` | 50 | 每页数量 |

**数据库操作**：
- `SELECT` photos 分页 + 公开/本人过滤
- `SELECT` users 预加载上传者

**返回规则**：只返回公开相册的照片 + 自己上传的照片

**成功响应** (code=0)：Photo 对象数组

---

## 3.3 删除照片

```
DELETE /api/photos/{photo_id}
```

**认证**：需要 Bearer Token

**数据库操作**：
- `SELECT` photos 按 ID
- `DELETE` photos（服务层显式清理 Cloudinary 文件，best-effort）

**成功响应** (code=0)：`{ "code": 0, "message": "照片已删除", "data": null }`

**错误码**：`3101` 照片不存在, `3102` 只能删除自己上传的照片

---

# 四、food 邮件通知（不涉及数据库表）

## 4.1 提交美食点单

```
POST /api/food/orders
```

**认证**：需要 Bearer Token

**请求体**：
```json
{
  "items": [
    { "dishId": 1, "dishName": "番茄炒蛋", "quantity": 2 }
  ],
  "note": "少放盐"
}
```

**数据库操作**：无（仅发送 SMTP 邮件）

**成功响应** (code=0)：`{ "code": 0, "message": "点单成功！订单已通过邮件通知", "data": null }`

**错误码**：`4001` 订单不能为空, `4002` 邮件发送失败

---

# 五、数据库表结构

> 当前 TiDB Cloud 实际结构（`family_website` 库）

## users

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | bigint | PK, auto_increment | 主键 |
| `username` | varchar(50) | NOT NULL | 用户名 |
| `email` | varchar(100) | UNIQUE, NOT NULL | 邮箱 |
| `password` | varchar(100) | NOT NULL | bcrypt 哈希密码 |
| `avatar` | varchar(255) | NULL | 头像路径 |
| `last_login_at` | datetime | NULL | 最后登录时间 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 注册时间 |

## albums

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | bigint | PK, auto_increment | 主键 |
| `name` | varchar(100) | NOT NULL | 相册名称 |
| `is_public` | tinyint(1) | NOT NULL, DEFAULT 1 | 是否公开 |
| `created_by` | bigint | FK → users.id, NOT NULL | 创建者 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## photos

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | bigint | PK, auto_increment | 主键 |
| `filename` | varchar(200) | NOT NULL | 存储文件名 (UUID) |
| `original_filename` | varchar(200) | NOT NULL | 原始文件名 |
| `file_size` | bigint | NOT NULL | 文件大小 (bytes) |
| `content_type` | varchar(100) | NOT NULL | MIME 类型 |
| `description` | text | NULL | 照片描述 |
| `uploaded_by` | bigint | FK → users.id, NOT NULL | 上传者 |
| `album_id` | bigint | FK → albums.id, NULL, ON DELETE SET NULL | 所属相册 |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 上传时间 |

---

# 六、模型与数据库对照

| SQLAlchemy 模型属性 | 映射的数据库列 | 类型适配 |
|---------------------|---------------|----------|
| `User.id` | `id` | ✅ |
| `User.username` | `username` | ✅ |
| `User.email` | `email` | String(100) 适配 varchar(100) |
| `User.hashed_password` | `password` | 显式映射 `mapped_column("password", ...)` |
| `User.avatar` | `avatar` | String(255) 适配 varchar(255) |
| `User.last_login` | `last_login_at` | 显式映射 `mapped_column("last_login_at", ...)` |
| `User.created_at` | `created_at` | ✅ |
| `Album.id` | `id` | ✅ |
| `Album.name` | `name` | ✅ |
| `Album.is_public` | `is_public` | ✅ |
| `Album.created_by` | `created_by` | ✅ |
| `Album.created_at` | `created_at` | ✅ |
| `Photo.id` | `id` | ✅ |
| `Photo.filename` | `filename` | String(200) 适配 varchar(200) |
| `Photo.original_filename` | `original_filename` | String(200) 适配 varchar(200) |
| `Photo.file_size` | `file_size` | BigInteger 适配 bigint |
| `Photo.content_type` | `content_type` | String(100) 适配 varchar(100) |
| `Photo.description` | `description` | ✅ |
| `Photo.uploaded_by` | `uploaded_by` | ✅ |
| `Photo.album_id` | `album_id` | ✅ |
| `Photo.created_at` | `created_at` | ✅ |
