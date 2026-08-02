import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import AuthGuard from "./components/AuthGuard/AuthGuard";
import Home from "./pages/home/Home";
import Login from "./pages/auth/login/Login";
import Register from "./pages/auth/register/Register";
import RegisterSuccess from "./pages/auth/registerSuccess/RegisterSuccess";
import ForgetPassword from "./pages/auth/forgetPassword/forgetPassword";
import Setting from "./pages/user/setting/Setting";
import PersonalCenter from "./pages/user/personalCenter/PersonalCenter";
import PhotoAlbum from "./pages/photoAlbum/photoAlbum";
import FoodOrder from "./pages/foodOrder/foodOrder";
import FamilyTree from "./pages/familyTree/familyTree";
import VideoPage from "./pages/familyTree/video/video";
import NotFound from "./pages/notFound/NotFound";
import { setGlobalNavigate } from "./utils/navigate";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/register-success",
    element: <RegisterSuccess />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/home",
    element: <AuthGuard><Home /></AuthGuard>,
  },
  {
    path: "/setting",
    element: <AuthGuard><Setting /></AuthGuard>,
  },
  {
    path: "/personal-center",
    element: <AuthGuard><PersonalCenter /></AuthGuard>,
  },
  {
    path: "/photo-album",
    element: <AuthGuard><PhotoAlbum /></AuthGuard>,
  },
  {
    path: "/food-order",
    element: <AuthGuard><FoodOrder /></AuthGuard>,
  },
  {
    path: "/family-tree",
    element: <AuthGuard><FamilyTree /></AuthGuard>,
  },
  {
    path: "/family-tree/video",
    element: <AuthGuard><VideoPage /></AuthGuard>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// 将 SPA 导航能力注入给非组件代码（如 axios 拦截器）使用
setGlobalNavigate((to: string) => router.navigate(to));

export default router;
