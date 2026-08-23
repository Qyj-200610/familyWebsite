import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { navigateTo } from "../utils/navigate";

// ============================================================
// 环境相关 URL 配置
// ============================================================

// API_BASE 取值优先级：
// 1. VITE_API_BASE_URL（可用 .env / Cloudflare Pages 面板环境变量覆盖）
// 2. 生产环境兜底：直接指向 Render 后端 —— 避免因漏配环境变量而静默回退到同源 /api，
//    导致所有 /api 请求打到 Cloudflare Pages 静态站上（POST 返回 405）
// 3. 开发环境：/api → 走 Vite 代理到 localhost:8001
const PRODUCTION_API_URL = "https://familywebsite-qkqd.onrender.com/api";

const API_BASE: string =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : "/api");

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
// JWT 工具 — 无验证解码（仅用于客户端过期检查，不做安全决策）
// ============================================================

interface JwtPayload {
  exp?: number;
  sub?: string;
  type?: string;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // atob 解码 base64（处理 URL-safe base64）
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

/** 检查 token 是否已过期或将在 bufferSec 秒内过期 */
function isTokenExpired(token: string, bufferSec = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return false;
  return Date.now() / 1000 >= payload.exp - bufferSec;
}

// ============================================================
// Token 刷新队列 — 防止并发 401 触发多次刷新
// ============================================================

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

interface QueueItem {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}

let failedQueue: QueueItem[] = [];

function processQueue(error: Error | null, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error || new Error("Token 刷新失败"));
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

async function tryRefreshToken(): Promise<boolean> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return false;

  // 如果 refresh token 本身也过期了，直接放弃
  if (isTokenExpired(refreshToken, 0)) {
    return false;
  }

  try {
    // 使用原生 fetch 而非任何 axios 实例，彻底避免拦截器递归
    const resp = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!resp.ok) return false;

    const json = await resp.json();
    if (json.code !== 0 || !json.data) return false;

    const { token, refreshToken: newRefresh } = json.data;
    useAuthStore.getState().setTokens(token, newRefresh);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// Axios 实例 — 统一配置、Token 注入、错误处理
// ============================================================

export const instance = axios.create({
  baseURL: API_BASE,
  timeout: 60_000, // Render 免费版冷启动需 30~60s，给足够时间
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

// ---------- 请求拦截：注入 Bearer Token + 主动过期检测 ----------

instance.interceptors.request.use(async (config) => {
  const { token, refreshToken } = useAuthStore.getState();

  // FormData 上传时，无条件删除 Content-Type 让浏览器自动设置 multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (!token) return config;

  // --- 主动过期检测：token 已过期则立即尝试刷新或清除 ---
  if (isTokenExpired(token)) {
    if (refreshToken && !isTokenExpired(refreshToken, 0)) {
      // Token 过期但 refresh token 仍有效 → 尝试静默刷新
      const ok = await tryRefreshToken();
      if (ok) {
        const { token: newToken } = useAuthStore.getState();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
        return config;
      }
    }

    // 刷新失败或无 refresh token → 立即清除过期 token
    useAuthStore.getState().logout();
    navigateTo("/login");
    // 拒绝请求，避免发起带过期 token 的调用
    return Promise.reject(new Error("Token 已过期，请重新登录"));
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---------- 响应拦截：解包 + 401 自动刷新 + 统一错误处理 ----------

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
  async (error: unknown) => {
    // 非 AxiosError（如请求拦截器主动拒绝）→ 透传原始错误消息
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;
      const config = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // 401 → 尝试静默刷新，失败则清除登录态
      if (status === 401 && config && !config._retry) {
        // 排除刷新端点本身（防止循环）
        if (config.url?.includes("/auth/refresh")) {
          useAuthStore.getState().logout();
          navigateTo("/login");
          return Promise.reject(new Error("登录已过期，请重新登录"));
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = tryRefreshToken();

          try {
            const ok = await refreshPromise;
            if (ok) {
              const { token: newToken } = useAuthStore.getState();
              processQueue(null, newToken);
              // 用新 token 重试原请求
              config._retry = true;
              config.headers.Authorization = `Bearer ${newToken}`;
              return instance(config);
            }
            // 刷新失败
            processQueue(new Error("Token 刷新失败"), null);
            useAuthStore.getState().logout();
            navigateTo("/login");
            return Promise.reject(new Error("登录已过期，请重新登录"));
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        }

        // 已有刷新在进行中 → 将当前请求加入队列等待
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              config._retry = true;
              config.headers.Authorization = `Bearer ${newToken}`;
              resolve(instance(config));
            },
            reject: (err: Error) => reject(err),
          });
        });
      }

      // 非 401 或已重试过 → 直接抛出
      return Promise.reject(
        new Error(
          (data as Record<string, unknown>)?.message
            ? String((data as Record<string, unknown>).message)
            : `请求错误 (${status})`,
        ),
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
  get: <T = unknown>(
    url: string,
    config?: Parameters<typeof instance.get>[1],
  ) => instance.get(url, config) as Promise<T>,

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
