import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { navigateTo } from "../utils/navigate";

// ============================================================
// Axios 实例 — 统一配置、Token 注入、错误处理
// ============================================================

const instance = axios.create({
  baseURL: "/api",
  timeout: 10_000,
  headers: { "Content-Type": "application/json; charset=utf-8" },
});

// ---------- 请求拦截：注入 Bearer Token ----------

instance.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // FormData 上传时，删除默认 Content-Type 让浏览器自动设置 multipart boundary
  if (config.data instanceof FormData && config.headers["Content-Type"]) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// ---------- 响应拦截：解包 + 统一错误处理 ----------

instance.interceptors.response.use(
  // 2xx：判断业务 code
  (response) => {
    // 空响应体（204 No Content 等）直接返回
    if (!response.data) {
      return null;
    }
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

    return Promise.reject(error);
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
