# TODOLIST — 待办事项

> 最后更新：2026-08-02（全量代码审查 + debug 修复 + 已知问题归类）

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
- [ ] **路由级别认证守卫** — 当前每个页面通过 `useEffect` + `isAuthenticated` 手动检查，应抽取为共享路由守卫组件，统一拦截未登录访问
- [ ] **深色模式适配完善** — 部分页面（Hero 横幅、功能卡片图标、Toast、食品卡片）使用硬编码颜色，不跟随主题切换

---

## 🟢 低优先级（后续迭代）

- [x] **日程管理** — localStorage 持久化、日程模板编辑（增删）、每日完成状态追踪
  - 涉及文件：[dailyRoutine.tsx](../src/pages/dailyRoutine/dailyRoutine.tsx)
- [ ] **家庭留言** — 留言板/聊天功能
- [ ] **通用组件库** — `src/components/` 下抽取可复用组件（Button, Input, Modal, Toast 等；目前已有 Auth 布局组件和 PageNav）
- [x] ~~**主题切换** — 深色模式 / 跟随系统~~ — 已完成于 2026-08-01
- [ ] **单元测试** — vitest + React Testing Library
- [ ] **E2E 测试** — Playwright
- [ ] **个人中心统计数据** — 照片数、点单数、留言数、家庭成员数（当前硬编码为 0，需后端统计 API）
- [ ] **菜品数据后端化** — 美食点单的 DISHES 常量（23 道菜品）迁移至后端 API
- [ ] **家谱数据后端化** — FAMILY_DATA 常量迁移至后端 API，支持前端界面增删改查

---

## ⚪ 技术债务（2026-08-02 审查新增）

- [ ] **CSS 死代码清理** — PersonalCenter.css 和 Setting.css 各含约 180 行旧导航栏样式（已由 PageNav 替代）
- [ ] **Home.tsx 导航栏合并** — Home 页内联了完整的导航栏实现（约 120 行），与 PageNav 组件功能重复，应统一
- [ ] **dailyRoutine.tsx 位置** — 该组件位于 `pages/` 但非路由页面，实际上为 Home 的子组件，应移至 `components/`
- [ ] **Auth.tsx 位置** — 该组件位于 `pages/auth/` 但非路由页面，是 Login/Register/ForgetPassword 共享的布局组件
- [ ] **video.tsx 内存泄漏** — 组件卸载时 `MediaRecorder.stop()` 异步触发 `onstop` handler 创建新 blob URL，但此时清理已完成，该 URL 永久泄漏
- [ ] **main.tsx import 扩展名** — `import router from './router.tsx'` 显式 `.tsx` 扩展名与其他 import 不一致
- [x] ~~FormData Content-Type 删除逻辑~~ → 已改为无条件删除（2026-08-02）
- [x] ~~UPLOADS_BASE 正则不兼容尾部斜杠~~ → 已修复（2026-08-02）
- [x] ~~authStore JSON 解析静默失败~~ → 已添加 console.warn（2026-08-02）
- [x] ~~接口文档头像大小写为 2MB~~ → interface.md / CLAUDE.md / COMPLETED.md 已全部修正为 5MB（2026-08-02）
- [x] ~~注销导航与 auth guard 竞争~~ → handleLogout 统一导航到 /login（2026-08-02）

---

## ⚪ 已解决的技术债务

- [x] ~~[authApi.logout()](../src/api/auth.ts#L18) 已定义但调用方未使用~~
- [x] ~~[LoginRequest](../src/api/types.ts#L35-L38) 类型已定义但 Login.tsx 未使用（直接传参），已改为类型化参数~~
- [x] ~~[RegisterRequest](../src/api/types.ts#L28-L31) 同上~~
- [x] ~~`authStore` 未做持久化中间件（zustand/middleware persist）~~ — 改为手动 localStorage/sessionStorage 管理，配合「记住我」
- [x] ~~`client.ts` 中的 `window.location.href` 硬跳转在 SPA 中不够优雅~~ — 改为 `navigateTo()` 工具函数（router.navigate 降级）
- [x] ~~`client.ts` FormData Content-Type 处理~~ — 从 `undefined as unknown as string` 改为 `delete config.headers["Content-Type"]`
- [x] ~~后端 `health_check` 未使用统一 `success_response` 函数~~ — 已修正
