import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__content">
        <span className="notfound__emoji">🔍</span>
        <h1 className="notfound__code">404</h1>
        <h2 className="notfound__title">页面未找到</h2>
        <p className="notfound__desc">
          你访问的页面不存在，可能已被移除或地址输入有误。
        </p>
        <Link to="/" className="notfound__btn">
          返回首页
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
