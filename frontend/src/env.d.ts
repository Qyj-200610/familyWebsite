/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端 API 基础路径 — 开发时留空走 Vite 代理，生产环境填写完整 URL + /api */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
