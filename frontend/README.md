# Family Website — 前端

家庭门户网站的 React SPA 前端，使用 TypeScript + Vite 构建。

## 技术栈

- **React 19** + TypeScript
- **Vite 8** (Rolldown)
- **React Router 7** (SPA 路由)
- **Zustand 5** (状态管理)
- **Axios** (HTTP 客户端)

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器 → http://localhost:5175
```

开发服务器配置了代理：
- `/api` → `http://localhost:8001`
- `/uploads` → `http://localhost:8001`

确保后端服务已在 `localhost:8001` 运行。

## 构建

```bash
npm run build      # TypeScript 检查 + Vite 生产构建
npm run preview    # 预览生产构建
```

## 项目结构

```
src/
├── main.tsx              # 应用入口
├── App.tsx               # 首页（未登录时的展示页）
├── router.tsx            # 路由定义
├── api/
│   ├── client.ts         # Axios 实例（拦截器、Token 注入、统一错误处理）
│   ├── index.ts          # API 统一导出
│   ├── types.ts          # TypeScript 类型定义
│   ├── auth.ts           # 认证 API
│   ├── user.ts           # 用户 API
│   ├── photo.ts          # 相册 API
│   ├── food.ts           # 美食点单 API
│   └── family.ts         # 家谱 API
├── store/
│   └── authStore.ts      # Zustand 认证状态
├── components/
│   └── PageNav/          # 共享导航栏组件
├── utils/
│   └── navigate.ts       # 全局导航工具
├── svg/                  # SVG 图标资源
└── pages/
    ├── home/             # 首页（已登录）
    ├── auth/             # 登录、注册、注册成功、忘记密码
    ├── photoAlbum/       # 家庭相册
    ├── foodOrder/        # 美食点单
    ├── familyTree/       # 家谱图
    │   └── video/         # 视频预览页
    ├── dailyRoutine/     # 日常日程侧边栏
    ├── user/
    │   ├── setting/      # 用户设置
    │   └── personalCenter/ # 个人中心
    └── notFound/         # 404
```

## API 约定

- 后端统一响应格式 `{code, message, data}`，axios 拦截器自动解包 `data`
- 认证 Token 通过 `Authorization: Bearer <token>` 传递
- 401 响应自动跳转登录页
