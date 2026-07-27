// ============================================================
// 轻量级导航工具 — 避免 client.ts ↔ router.tsx 循环依赖
// ============================================================

type NavigateFn = (to: string) => void;

let _navigate: NavigateFn | null = null;

/** 由 router 初始化时调用，注入导航函数 */
export function setGlobalNavigate(navigate: NavigateFn) {
  _navigate = navigate;
}

/** SPA 内导航；若尚未初始化则降级为 window.location.href */
export function navigateTo(path: string) {
  if (_navigate) {
    _navigate(path);
  } else {
    window.location.href = path;
  }
}
