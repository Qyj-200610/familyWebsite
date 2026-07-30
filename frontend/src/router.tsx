import { createBrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import Home from "./pages/home/Home.tsx";
import Login from "./pages/auth/login/Login.tsx";
import Register from "./pages/auth/register/Register.tsx";
import RegisterSuccess from "./pages/auth/registerSuccess/RegisterSuccess.tsx";
import ForgetPassword from "./pages/auth/forgetPassword/forgetPassword.tsx";
import Setting from "./pages/user/setting/Setting.tsx";
import PersonalCenter from "./pages/user/personalCenter/PersonalCenter.tsx";
import PhotoAlbum from "./pages/photoAlbum/photoAlbum.tsx";
import FoodOrder from "./pages/foodOrder/foodOrder.tsx";
import FamilyTree from "./pages/familyTree/familyTree.tsx";
import VideoPage from "./pages/familyTree/video/video.tsx";
import NotFound from "./pages/notFound/NotFound.tsx";
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
    element: <Home />,
  },
  {
    path: "/setting",
    element: <Setting />,
  },
  {
    path: "/personal-center",
    element: <PersonalCenter />,
  },
  {
    path: "/photo-album",
    element: <PhotoAlbum />,
  },
  {
    path: "/food-order",
    element: <FoodOrder />,
  },
  {
    path: "/family-tree",
    element: <FamilyTree />,
  },
  {
    path: "/family-tree/video",
    element: <VideoPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// 将 SPA 导航能力注入给非组件代码（如 axios 拦截器）使用
setGlobalNavigate((to: string) => router.navigate(to));

export default router;
