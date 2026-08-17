# TODOLIST — 待办事项

> 最后更新：2026-08-17（前端重构：抽取共享组件/Hook/校验工具 + 密码校验与后端对齐）

---

## 🔴 高优先级（核心体验）

- [x] **Token 持久化** — 将 token 存入 localStorage，页面刷新后恢复登录态，避免每次刷新都跳回登录页
  - 涉及文件：[authStore.ts](../src/store/authStore.ts)
  - 方案：`setAuth` 时同步写 localStorage/sessionStorage，store 初始化时从 storage 恢复

- [x] **退出登录调用后端 API** — [Home.tsx:34-42](../src/pages/home/Home.tsx#L34-L42) 的 `handleLogout` 已同时调用 `authApi.logout()` 和本地 `logout()`
  - 涉及文件：[Home.tsx](../src/pages/home/Home.tsx)、[FoodOrder.tsx](../src/pages/foodOrder/foodOrder.tsx)、[PhotoAlbum.tsx](../src/pages/photoAlbum/photoAlbum.tsx)、[Setting.tsx](../src/pages/user/setting/Setting.tsx)、[PersonalCenter.tsx](../src/pages/user/personalCenter/PersonalCenter.tsx)

- [x] **"记住我"功能** — [Login.tsx](../src/pages/auth/login/Login.tsx) 中 `remember` 复选框已接入逻辑
  - `remember=true` → token 持久化到 localStorage
  - `remember=false` → token 仅存 sessionStorage

---

## 🟡 中优先级（功能完善）

- [x] **前端接口文档** — `docs/interface.md` 已包含所有 API 端点文档（auth/user/photo/food/health）、错误码对照表、TypeScript 类型定义
  - 涉及文件：[interface.md](interface.md)

- [x] **家庭相册** — 照片上传、时间线浏览、照片查看器、删除确认
  - 涉及文件：[photoAlbum.tsx](../src/pages/photoAlbum/photoAlbum.tsx)、[photoApi](../src/api/photo.ts)

- [x] **美食点单** — 菜品筛选、购物车、订单邮件通知
  - 涉及文件：[foodOrder.tsx](../src/pages/foodOrder/foodOrder.tsx)、[foodApi](../src/api/food.ts)

- [x] **日常日程侧边栏** — 首页左侧日程组件，可折叠、标记完成、显示进度
  - 涉及文件：[dailyRoutine.tsx](../src/pages/dailyRoutine/dailyRoutine.tsx)

- [x] **忘记密码页面** — [Login.tsx:135](../src/pages/auth/login/Login.tsx#L135) 链接已指向 `/forget-password`
  - 涉及文件：[forgetPassword.tsx](../src/pages/auth/forgetPassword/forgetPassword.tsx)
  - 实现为合并页面（邮箱 + 新密码直接重置，家庭场景无需邮件验证）

- [x] **Token 过期自动刷新** — 双 token 机制（access 30min + refresh 7天），请求拦截器主动检测过期并清除，响应拦截器 401 自动静默刷新 + 并发请求排队
  - 涉及文件：[client.ts](../src/api/client.ts)、[authStore.ts](../src/store/authStore.ts)、[auth.ts](../src/api/auth.ts)、[security.py](../../backend/app/core/security.py)、[auth.py](../../backend/app/api/v1/endpoints/auth.py)
- [x] **路由级别认证守卫** — 已抽取 `AuthGuard` 共享路由守卫组件，包裹所有需登录的路由；各页面保留 `isAuthenticated` 空返回作为双重保障
  - 涉及文件：[AuthGuard.tsx](../src/components/AuthGuard/AuthGuard.tsx)、[router.tsx](../src/router.tsx)
- [x] **深色模式适配完善** — 卡片图标容器背景、统计图标背景、食品卡片背景已改为 CSS 变量（`--color-icon-bg-*`、`--color-food-card-bg`），跟随主题切换
  - 涉及文件：[index.css](../src/index.css)、[Home.css](../src/pages/home/Home.css)、[PersonalCenter.css](../src/pages/user/personalCenter/PersonalCenter.css)、[foodOrder.css](../src/pages/foodOrder/foodOrder.css)

---

## 🟢 低优先级（后续迭代）

- [x] **日程管理** — localStorage 持久化、日程模板编辑（增删）、每日完成状态追踪
  - 涉及文件：[dailyRoutine.tsx](../src/pages/dailyRoutine/dailyRoutine.tsx)
- [ ] **家庭留言** — 留言板/聊天功能
- [ ] **通用组件库** — `src/components/` 下抽取可复用组件（Button, Input, Modal, Toast 等；目前已有 Auth 布局、PageNav、ImageWithFallback 组件，以及 `hooks/useRequireAuth` 认证守卫、`utils/validation.ts` 校验工具）
- [x] ~~**主题切换** — 深色模式 / 跟随系统~~ — 已完成于 2026-08-01
- [ ] **单元测试** — vitest + React Testing Library
- [ ] **E2E 测试** — Playwright
- [ ] **个人中心统计数据** — 照片数、点单数、留言数、家庭成员数（当前硬编码为 0，需后端统计 API）
- [ ] **菜品数据后端化** — 美食点单的 DISHES 常量（6 道菜品）迁移至后端 API，支持动态增删改
- [ ] **家谱数据后端化** — FAMILY_DATA 常量迁移至后端 API，支持前端界面增删改查

---

## ⚪ 技术债务（2026-08-02 审查新增）

- [x] **CSS 死代码清理** — PersonalCenter.css 和 Setting.css 旧导航栏样式（约 180 行/文件）已移除，统一由 PageNav 组件处理
  - 涉及文件：[PersonalCenter.css](../src/pages/user/personalCenter/PersonalCenter.css)、[Setting.css](../src/pages/user/setting/Setting.css)
- [x] **Home.tsx 导航栏合并** — Home 页内联导航（约 120 行）已替换为共享 `PageNav` 组件，移除重复的 nav 逻辑（dropdown state、click-outside handler、handleLogout、avatarLetter）
  - 涉及文件：[Home.tsx](../src/pages/home/Home.tsx)
- [x] **dailyRoutine.tsx 位置** — 已从 `pages/dailyRoutine/` 移至 `components/DailyRoutine/`，所有 import 已更新
  - 涉及文件：[DailyRoutine.tsx](../src/components/DailyRoutine/DailyRoutine.tsx)、[Home.tsx](../src/pages/home/Home.tsx)
- [x] **Auth.tsx 位置** — 已从 `pages/auth/Auth.tsx` 移至 `components/Auth/Auth.tsx`，所有 auth 页面 import 已更新
  - 涉及文件：[Auth.tsx](../src/components/Auth/Auth.tsx)、[Login.tsx](../src/pages/auth/login/Login.tsx)、[Register.tsx](../src/pages/auth/register/Register.tsx)、[RegisterSuccess.tsx](../src/pages/auth/registerSuccess/RegisterSuccess.tsx)、[forgetPassword.tsx](../src/pages/auth/forgetPassword/forgetPassword.tsx)
- [x] **video.tsx 内存泄漏** — 新增 `mountedRef` 标记，组件卸载时 `MediaRecorder.onstop` 检查该标记，跳过 blob URL 创建，避免永久泄漏
  - 涉及文件：[video.tsx](../src/pages/familyTree/video/video.tsx)
- [x] **main.tsx import 扩展名** — `import router from './router.tsx'` 已改为 `'./router'`（无扩展名），与其他 import 风格一致
  - 涉及文件：[main.tsx](../src/main.tsx)、[router.tsx](../src/router.tsx)（同步清理所有 `.tsx` 扩展名 import）
- [x] ~~FormData Content-Type 删除逻辑~~ → 已改为无条件删除（2026-08-02）
- [x] ~~UPLOADS_BASE 正则不兼容尾部斜杠~~ → 已修复（2026-08-02）
- [x] ~~authStore JSON 解析静默失败~~ → 已添加 console.warn（2026-08-02）
- [x] ~~接口文档头像大小写为 2MB~~ → interface.md / CLAUDE.md / COMPLETED.md 已全部修正为 5MB（2026-08-02）
- [x] ~~注销导航与 auth guard 竞争~~ → handleLogout 统一导航到 /login（2026-08-02）

---

## ⚪ 技术债务（2026-08-03 审查新增）

- [ ] **video.css 深色模式变量迁移** — 视频页面全部使用硬编码颜色（593 行），需迁移到 CSS 变量体系
  - 涉及文件：[video.css](../src/pages/familyTree/video/video.css)
- [ ] **familyTree 深色模式进一步完善** — 连线/竖线/横条使用硬编码颜色（`#b0aca5`、`#ccc`），需 CSS 变量化
  - 涉及文件：[familyTree.css](../src/pages/familyTree/familyTree.css)
- [ ] **Register.css / forgetPassword.css 空文件清理** — 已删除文件 + 移除对应 TSX 中的 import
- [x] **stale 文件清理** — `pages/dailyRoutine/` 和 `pages/auth/Auth.tsx` 的 stale 副本已删除（2026-08-03）
- [x] **DailyRoutine impure updater** — `setTemplate` 内调用 `saveTemplate` 已移除（2026-08-03）
- [x] **avatarLetter null-safety** — `charAt(0).toUpperCase()` 改为 `charAt(0)?.toUpperCase()`（2026-08-03）
- [x] **client.ts 错误消息吞没** — 响应拦截器改为 `unknown` + `axios.isAxiosError` 守卫（2026-08-03）
- [x] **favicon 生产构建 404** — SVG 移至 `public/` 目录（2026-08-03）
- [x] **App.css/photoAlbum/foodOrder/familyTree 深色模式 CSS 变量迁移** — 核心页面完成（2026-08-03）
- [x] **interface.md stats 端点文档补充** — `GET /api/user/me/stats` 已添加（2026-08-03）

---

## ⚪ 已解决的技术债务

- [x] ~~[authApi.logout()](../src/api/auth.ts#L18) 已定义但调用方未使用~~
- [x] ~~[LoginRequest](../src/api/types.ts#L35-L38) 类型已定义但 Login.tsx 未使用（直接传参），已改为类型化参数~~
- [x] ~~[RegisterRequest](../src/api/types.ts#L28-L31) 同上~~
- [x] ~~`authStore` 未做持久化中间件（zustand/middleware persist）~~ — 改为手动 localStorage/sessionStorage 管理，配合「记住我」
- [x] ~~`client.ts` 中的 `window.location.href` 硬跳转在 SPA 中不够优雅~~ — 改为 `navigateTo()` 工具函数（router.navigate 降级）
- [x] ~~`client.ts` FormData Content-Type 处理~~ — 从 `undefined as unknown as string` 改为 `delete config.headers["Content-Type"]`
- [x] ~~后端 `health_check` 未使用统一 `success_response` 函数~~ — 已修正
