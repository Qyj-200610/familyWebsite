import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { warmup } from './api/client'
import './index.css'
import router from './router.tsx'
import { useThemeStore } from './store/themeStore'

// 提前唤醒 Render 后端（免费版休眠后冷启动需 30~60s）
warmup()

// --- 主题初始化 ---

/** 应用已解析的主题到 <html> 元素 */
function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved)
}

// 初始化：从 store 读取偏好并设置 data-theme
const initialTheme = useThemeStore.getState().theme
const initialResolved =
  initialTheme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : initialTheme
applyTheme(initialResolved)

// 监听系统主题变化（仅当用户选择了"跟随系统"时生效）
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
darkModeQuery.addEventListener('change', (e) => {
  const current = useThemeStore.getState()
  if (current.theme === 'system') {
    applyTheme(e.matches ? 'dark' : 'light')
  }
})

// --- 渲染 ---
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
