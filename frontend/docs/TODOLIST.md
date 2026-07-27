# TODOLIST — 待办事项

> 最后更新：2026-07-26（debug：修复 Home/PersonalCenter/Setting 三处 logout 未调用后端 API 的问题）

---

## 🔴 高优先级（核心体验）

- [x] **Token 持久化** — 将 token 存入 localStorage，页面刷新后恢复登录态，避免每次刷新都跳回登录页
  - 涉及文件：[authStore.ts](../src/store/authStore.ts)
  - 方案：`setAuth` 时同步写 localStorage，store 初始化时从 localStorage 恢复

- [x] **退出登录调用后端 API** — [Home.tsx:17](../src/pages/home/Home.tsx#L17) 的 `handleLogout` 只调用了本地 `logout()` 清除 state，应同时调用 `authApi.logout()` 通知后端销毁 token
  - 涉及文件：[Home.tsx](../src/pages/home/Home.tsx)

- [x] **"记住我"功能** — [Login.tsx](../src/pages/auth/login/Login.tsx) 中 `remember` 复选框已有 UI，但未接入逻辑
  - `remember=true` → token 持久化到 localStorage
  - `remember=false` → token 仅存 sessionStorage（session 级别，刷新不丢失）

---

## 🟡 中优先级（功能完善）

- [ ] **忘记密码页面** — [Login.tsx:132](../src/pages/auth/login/Login.tsx#L132) 链接当前为 `#`
  - 新建 `/forgot-password` 页面
  - 新建 `/reset-password` 页面（带 token 参数）

- [ ] **第三方登录** — [Login.tsx:150-157](../src/pages/auth/login/Login.tsx#L150-L157) 微信/手机号按钮当前 disabled
  - 微信 OAuth 接入
  - 手机号验证码登录

- [ ] **用户协议 & 隐私政策页面** — [Register.tsx:199-206](../src/pages/auth/register/Register.tsx#L199-L206) 链接当前为 `#`
  - 新建 `/terms` 页面
  - 新建 `/privacy` 页面

- [x] **前端接口文档** — 在 `docs/` 下创建 `interface.md`，记录所有前端 API 调用、请求/响应类型、错误码
  - 涉及文件：[interface.md](interface.md)
  - 已包含：API 约定、统一响应格式、所有端点文档（含健康检查）、错误码对照表、TypeScript 类型定义

- [ ] **Token 过期自动刷新** — 考虑在 `client.ts` 的响应拦截器中接入 refresh token 逻辑

---

## 🟢 低优先级（后续迭代）

- [ ] **家庭相册** — 照片上传、时间线浏览、相册管理
- [ ] **日程管理** — 家庭共享日历、事件创建/提醒
- [ ] **家庭留言** — 留言板/聊天功能
- [ ] **通用组件库** — `src/components/` 下抽取可复用组件（Button, Input, Modal, Toast 等）
- [ ] **单元测试** — vitest + React Testing Library
- [ ] **E2E 测试** — Playwright

---

## ⚪ 技术债务

- [x] ~~[authApi.logout()](../src/api/auth.ts#L18) 已定义但调用方（Home.tsx）未使用~~
- [x] ~~[LoginRequest](../src/api/types.ts#L34-L37) 类型已定义但 Login.tsx 未使用（直接传参），已改为类型化参数~~
- [x] ~~[RegisterRequest](../src/api/types.ts#L28-L31) 同上~~
- [x] ~~`authStore` 未做持久化中间件（zustand/middleware persist）~~ — 改为手动 localStorage/sessionStorage 管理，配合「记住我」
- [x] ~~`client.ts` 中的 `window.location.href` 硬跳转在 SPA 中不够优雅~~ — 改为 `navigateTo()` 工具函数（router.navigate 降级）
