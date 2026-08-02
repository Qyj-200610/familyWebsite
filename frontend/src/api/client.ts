import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { navigateTo } from "../utils/navigate";

// ============================================================
// 环境相关 URL 配置
// ============================================================

// 开发时 VITE_API_BASE_URL 留空 → 走 Vite 代理（/api → localhost:8001）
// 生产环境在 Cloudflare Pages 面板设置 VITE_API_BASE_URL 为后端完整地址，如 https://api.example.com/api
const API_BASE: string = import.meta.env.VITE_API_BASE_URL || "/api";

/** 上传文件的基础路径（从 API_BASE 推导，替换 /api → /uploads，兼容尾部斜杠） */
export const UPLOADS_BASE: string = API_BASE.replace(/\/api\/?$/, "/uploads");

/**
 * 将后端返回的相对上传路径（如 /uploads/avatars/xxx.jpg）解析为完整 URL。
 * - 开发时保持相对路径（走 Vite 代理）
 * - 生产时拼接后端域名
 */
export const uploadUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads/")) {
    return path.replace(/^\/uploads/, UPLOADS_BASE);
  }
  return path;
};

// ============================================================
// Axios 实例 — 统一配置、Token 注入、错误处理
// ============================================================

const instance = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,  // Render 免费版冷启动需 30~60s，给足够时间
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

// ---------- 请求拦截：注入 Bearer Token ----------

instance.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData 上传时，无条件删除 Content-Type 让浏览器自动设置 multipart boundary
  // AxiosHeaders 可能对键名做归一化，直接判断 instanceof 更安全
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// ---------- 响应拦截：解包 + 统一错误处理 ----------

instance.interceptors.response.use(
  // 2xx：判断业务 code
  (response) => {
    const { code, message, data } = response.data;
    if (code === 0) {
      // 成功 → 直接返回 data 载荷，调用方无需重复 .data
      return data;
    }
    // 业务错误 → 抛出带后端提示的异常
    return Promise.reject(new Error(message || "请求失败"));
  },

  // 非 2xx：HTTP 层错误
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 → 自动清除登录态并跳转
      if (status === 401) {
        useAuthStore.getState().logout();
        navigateTo("/login");
        return Promise.reject(new Error("登录已过期，请重新登录"));
      }

      return Promise.reject(
        new Error(data?.message || `请求错误 (${status})`),
      );
    }

    // 网络超时 / 断网
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("请求超时，请检查网络"));
    }

    // 其他网络错误（DNS 失败、连接拒绝等）→ 统一返回友好提示
    return Promise.reject(new Error("网络错误，请检查连接"));
  },
);

// ============================================================
// 类型安全的封装层
//
// 响应拦截器已将 AxiosResponse 解包为 data 载荷，
// 这里通过显式类型断言让 TS 感知到返回值不再是 AxiosResponse<T> 而是 T。
// ============================================================

const client = {
  get: <T = unknown>(url: string, config?: Parameters<typeof instance.get>[1]) =>
    instance.get(url, config) as Promise<T>,

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof instance.post>[2],
  ) => instance.post(url, data, config) as Promise<T>,

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof instance.put>[2],
  ) => instance.put(url, data, config) as Promise<T>,

  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof instance.patch>[2],
  ) => instance.patch(url, data, config) as Promise<T>,

  delete: <T = unknown>(
    url: string,
    config?: Parameters<typeof instance.delete>[1],
  ) => instance.delete(url, config) as Promise<T>,
};

export default client;

// ============================================================
// 预热 — 应用启动时 ping 后端，唤醒 Render 免费版（防冷启动超时）
// ============================================================
let _warmed = false;

export const warmup = (): void => {
  if (_warmed) return;
  _warmed = true;
  fetch(`${API_BASE}/family/status`).catch(() => {});
};
