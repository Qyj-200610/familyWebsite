# TODOLIST — 待办事项

> 最后更新：2026-08-01（前端 CSS 全面重构 + 无障碍改进 + 后端相册查询优化）

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

- [ ] **Token 过期自动刷新** — 考虑在 `client.ts` 的响应拦截器中接入 refresh token 逻辑

---

## 🟢 低优先级（后续迭代）

- [x] **日程管理** — localStorage 持久化、日程模板编辑（增删）、每日完成状态追踪
  - 涉及文件：[dailyRoutine.tsx](../src/pages/dailyRoutine/dailyRoutine.tsx)
- [ ] **家庭留言** — 留言板/聊天功能
- [ ] **通用组件库** — `src/components/` 下抽取可复用组件（Button, Input, Modal, Toast 等；目前已有 Auth 布局组件）
- [ ] **主题切换** — 深色模式 / 跟随系统（Setting 页面 UI 已预留但 disabled）
- [ ] **单元测试** — vitest + React Testing Library
- [ ] **E2E 测试** — Playwright
- [ ] **个人中心统计数据** — 照片数、点单数、留言数、家庭成员数（当前硬编码为 0）

---

## ⚪ 技术债务

- [x] ~~[authApi.logout()](../src/api/auth.ts#L18) 已定义但调用方未使用~~
- [x] ~~[LoginRequest](../src/api/types.ts#L35-L38) 类型已定义但 Login.tsx 未使用（直接传参），已改为类型化参数~~
- [x] ~~[RegisterRequest](../src/api/types.ts#L28-L31) 同上~~
- [x] ~~`authStore` 未做持久化中间件（zustand/middleware persist）~~ — 改为手动 localStorage/sessionStorage 管理，配合「记住我」
- [x] ~~`client.ts` 中的 `window.location.href` 硬跳转在 SPA 中不够优雅~~ — 改为 `navigateTo()` 工具函数（router.navigate 降级）
- [x] ~~`client.ts` FormData Content-Type 处理~~ — 从 `undefined as unknown as string` 改为 `delete config.headers["Content-Type"]`
- [x] ~~后端 `health_check` 未使用统一 `success_response` 函数~~ — 已修正
