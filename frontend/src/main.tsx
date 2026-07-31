import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { warmup } from './api/client'
import './index.css'
import router from './router.tsx'

// 提前唤醒 Render 后端（免费版休眠后冷启动需 30~60s）
warmup()

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
