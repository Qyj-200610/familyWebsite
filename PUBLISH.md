# React + FastAPI + Cloudinary + TiDB Cloud 免费部署方案

## 部署架构

采用**前后端分离 + 独立数据库 + 云图片存储**架构，四模块全部免费，无需服务器、备案、信用卡：

| 模块 | 平台 | 用途 |
|------|------|------|
| 前端静态资源 | **Cloudflare Pages** | React 打包页面，GitHub 自动部署，全球 CDN 加速 |
| 后端 API | **Render** | FastAPI 服务，自动部署 + 进程守护 |
| 数据库 | **TiDB Cloud Developer Tier** | MySQL 5.7 兼容，独立持久化，SSL 连接，不受后端重启影响 |
| 图片存储 | **Cloudinary** | 持久化云存储，头像和照片上传，替代 Render 临时磁盘 |

## 数据流转

```
用户浏览器 → Cloudflare Pages（前端页面）
                │
                ├── 页面请求 → Cloudflare Pages CDN → React SPA
                │
                └── API 请求 /api/* → Render（FastAPI）
                         │
                         ├── 业务数据 ⇄ TiDB Cloud（MySQL）
                         │
                         └── 图片上传/访问 → Cloudinary（CDN 加速）
```

前端直接请求 Render 后端 API（`VITE_API_BASE_URL` 指向后端地址），不经过 Cloudflare Pages 反向代理。

## 核心优势

- **零成本**：所有平台提供永久免费额度，无强制付费
- **数据安全**：数据库 + 图片存储独立部署，服务休眠/重启/更新不丢数据
- **自动部署**：关联 GitHub 仓库，`git push` 即自动上线
- **免备案**：平台分配免费二级域名，自定义域名也无需 ICP 备案
- **图片持久化**：Cloudinary 云存储，不依赖 Render 临时磁盘（Render 免费实例的文件系统会在休眠/重启时清空）

## 局限

- Render 免费服务 **15 分钟无访问自动休眠**，再次访问有 20-30 秒冷启动延迟
- Cloudinary 免费额度：25 GB 存储 + 25 GB 月带宽，超出需升级
- 仅适合个人项目、毕设、竞赛展示等低访问量场景
- 不适合高并发、7×24 商用、实时通讯等生产级需求

## 已部署 URL

| 服务 | URL |
|------|-----|
| Frontend | https://family-website-cgh.pages.dev |
| Backend | https://familywebsite-qkqd.onrender.com |

---

