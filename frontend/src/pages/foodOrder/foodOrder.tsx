import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authApi, foodApi } from "../../api";

import exitLoginIcon from "../../svg/exitLogin.svg";
import "./foodOrder.css";

// ============================================================
// 类型 & 常量
// ============================================================

type DishCategory = "热菜" | "凉菜" | "汤品" | "主食" | "饮品" | "甜点";

interface Dish {
  id: number;
  name: string;
  category: DishCategory;
  description: string;
  emoji: string;
  recommended?: boolean;
  spicy?: boolean;
}

const CATEGORIES: (DishCategory | "全部")[] = [
  "全部",
  "热菜",
  "凉菜",
  "汤品",
  "主食",
  "饮品",
  "甜点",
];

const DISHES: Dish[] = [
  // ---- 热菜 ----
  { id: 1, name: "宫保鸡丁", category: "热菜", description: "花生与鸡丁的经典搭配，香辣可口", emoji: "🍗", spicy: true, recommended: true },
  { id: 2, name: "红烧肉", category: "热菜", description: "肥而不腻，入口即化，家常美味", emoji: "🥩", recommended: true },
  { id: 3, name: "清蒸鲈鱼", category: "热菜", description: "鲜嫩滑口，原汁原味", emoji: "🐟" },
  { id: 4, name: "西红柿炒鸡蛋", category: "热菜", description: "简单家常，营养美味", emoji: "🍅" },
  { id: 5, name: "麻婆豆腐", category: "热菜", description: "麻辣鲜香，下饭神器", emoji: "🫘", spicy: true },
  { id: 6, name: "蒜蓉西兰花", category: "热菜", description: "清脆爽口，蒜香四溢", emoji: "🥦" },
  { id: 7, name: "地三鲜", category: "热菜", description: "土豆茄子青椒，东北经典", emoji: "🥔" },
  { id: 8, name: "糖醋排骨", category: "热菜", description: "酸甜可口，肉质鲜嫩", emoji: "🍖", recommended: true },

  // ---- 凉菜 ----
  { id: 9, name: "凉拌黄瓜", category: "凉菜", description: "清脆爽口，开胃解腻", emoji: "🥒" },
  { id: 10, name: "皮蛋豆腐", category: "凉菜", description: "嫩滑豆腐配松花蛋，经典凉菜", emoji: "🥚" },
  { id: 11, name: "口水鸡", category: "凉菜", description: "麻辣鲜香，让人回味无穷", emoji: "🐔", spicy: true },

  // ---- 汤品 ----
  { id: 12, name: "酸辣汤", category: "汤品", description: "酸辣开胃，暖身暖胃", emoji: "🥣", spicy: true },
  { id: 13, name: "排骨玉米汤", category: "汤品", description: "清甜鲜美，营养滋补", emoji: "🍖" },
  { id: 14, name: "紫菜蛋花汤", category: "汤品", description: "清淡爽口，简单快手", emoji: "🍲" },

  // ---- 主食 ----
  { id: 15, name: "蛋炒饭", category: "主食", description: "粒粒分明，家常必备", emoji: "🍚" },
  { id: 16, name: "手工水饺", category: "主食", description: "皮薄馅大，家的味道", emoji: "🥟", recommended: true },
  { id: 17, name: "葱油拌面", category: "主食", description: "葱香四溢，简单美味", emoji: "🍜" },

  // ---- 饮品 ----
  { id: 18, name: "冰镇柠檬水", category: "饮品", description: "酸甜清爽，夏日必备", emoji: "🍋" },
  { id: 19, name: "绿豆汤", category: "饮品", description: "清热解暑，传统饮品", emoji: "🫘" },
  { id: 20, name: "奶茶", category: "饮品", description: "香浓丝滑，甜蜜享受", emoji: "🧋" },

  // ---- 甜点 ----
  { id: 21, name: "芒果布丁", category: "甜点", description: "香甜嫩滑，入口即化", emoji: "🍮" },
  { id: 22, name: "红豆沙", category: "甜点", description: "细腻绵密，甜蜜暖心", emoji: "🫘" },
  { id: 23, name: "水果拼盘", category: "甜点", description: "新鲜时令水果，缤纷多彩", emoji: "🍉" },
];

// ============================================================
// FoodOrder 页面组件
// ============================================================

function FoodOrder() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // ---------- 导航栏状态 ----------
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ---------- 菜品筛选 ----------
  const [activeCategory, setActiveCategory] = useState<DishCategory | "全部">("全部");

  // ---------- 购物车 ----------
  const [cartItems, setCartItems] = useState<Map<number, number>>(new Map());
  const [cartOpen, setCartOpen] = useState(false);

  // ---------- 下单弹窗 ----------
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 认证检查
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ---------- 退出登录 ----------
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    logout();
    navigate("/");
  };

  // ---------- 购物车逻辑 ----------
  const handleAddToCart = useCallback((dishId: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      next.set(dishId, (prev.get(dishId) || 0) + 1);
      return next;
    });
  }, []);

  const handleRemoveFromCart = useCallback((dishId: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      next.delete(dishId);
      return next;
    });
  }, []);

  const handleUpdateQuantity = useCallback((dishId: number, delta: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      const newQty = (prev.get(dishId) || 0) + delta;
      if (newQty <= 0) {
        next.delete(dishId);
      } else {
        next.set(dishId, newQty);
      }
      return next;
    });
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems(new Map());
  }, []);

  // ---------- 购物车数据派生 ----------
  const cartDetails = useMemo(() => {
    const items: { dish: Dish; quantity: number }[] = [];
    let totalCount = 0;
    cartItems.forEach((qty, dishId) => {
      const dish = DISHES.find((d) => d.id === dishId);
      if (dish && qty > 0) {
        items.push({ dish, quantity: qty });
        totalCount += qty;
      }
    });
    return { items, totalCount };
  }, [cartItems]);

  // ---------- 筛选后的菜品 ----------
  const filteredDishes = useMemo(() => {
    if (activeCategory === "全部") return DISHES;
    return DISHES.filter((d) => d.category === activeCategory);
  }, [activeCategory]);

  // ---------- 下单逻辑 ----------
  const openOrderModal = () => {
    if (cartDetails.items.length === 0) return;
    setOrderModalOpen(true);
    setOrderNote("");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const closeOrderModal = () => {
    if (submitting) return;
    setOrderModalOpen(false);
  };

  const handleSubmitOrder = async () => {
    if (cartDetails.items.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await foodApi.submitOrder({
        items: cartDetails.items.map((item) => ({
          dishId: item.dish.id,
          dishName: item.dish.name,
          quantity: item.quantity,
        })),
        note: orderNote.trim() || undefined,
      });

      setSubmitSuccess(true);
      handleClearCart();

      // 3 秒后自动关闭弹窗
      setTimeout(() => {
        setOrderModalOpen(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- 头像字母 ----------
  const avatarLetter = user?.username?.charAt(0).toUpperCase() || "U";

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="food">
      {/* ==================== 导航栏 ==================== */}
      <nav className="food__nav">
        <div className="container food__nav-inner">
          <Link to="/home" className="food__logo">
            🏠 我们的家
          </Link>

          <div className="food__user-area" ref={dropdownRef}>
            <button
              className="food__avatar-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="food__avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span className="food__avatar-placeholder">{avatarLetter}</span>
                )}
              </span>
              <span className="food__username">{user?.username || "用户"}</span>
              <span
                className={`food__dropdown-arrow ${
                  dropdownOpen ? "food__dropdown-arrow--open" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {dropdownOpen && (
              <div className="food__dropdown">
                <Link
                  to="/personal-center"
                  className="food__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="food__dropdown-icon">👤</span>
                  个人中心
                </Link>
                <Link
                  to="/setting"
                  className="food__dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="food__dropdown-icon">⚙️</span>
                  设置
                </Link>
                <div className="food__dropdown-divider" />
                <button
                  className="food__dropdown-item food__dropdown-item--danger"
                  onClick={handleLogout}
                >
                  <img src={exitLoginIcon} alt="退出登录" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ==================== 主内容区 ==================== */}
      <main className="food__main">
        <div className="container food__layout">
          {/* ---- 左侧：菜品区 ---- */}
          <div className="food__content">
            {/* 顶部标题栏 */}
            <div className="food__header">
              <div>
                <h2 className="food__title">🍽️ 美食专栏</h2>
                <p className="food__subtitle">
                  共 {DISHES.length} 道菜品 · 点击即可加入点单
                </p>
              </div>
            </div>

            {/* 分类筛选 Tab */}
            <div className="food__categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`food__category-btn ${
                    activeCategory === cat ? "food__category-btn--active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 菜品网格 */}
            <div className="food__grid">
              {filteredDishes.map((dish) => {
                const inCart = cartItems.get(dish.id) || 0;
                return (
                  <div key={dish.id} className="food__card">
                    {/* 图片占位区 */}
                    <div className="food__card-image">
                      <span className="food__card-emoji">{dish.emoji}</span>
                      {dish.recommended && (
                        <span className="food__card-badge">🔥 推荐</span>
                      )}
                    </div>

                    {/* 信息区 */}
                    <div className="food__card-body">
                      <h3 className="food__card-name">
                        {dish.name}
                        {dish.spicy && <span className="food__card-spicy">🌶️</span>}
                      </h3>
                      <p className="food__card-desc">{dish.description}</p>
                    </div>

                    {/* 操作区 */}
                    <div className="food__card-action">
                      {inCart > 0 ? (
                        <div className="food__card-qty-ctrl">
                          <button
                            className="food__card-qty-btn"
                            onClick={() =>
                              handleUpdateQuantity(dish.id, -1)
                            }
                          >
                            −
                          </button>
                          <span className="food__card-qty">{inCart}</span>
                          <button
                            className="food__card-qty-btn"
                            onClick={() => handleAddToCart(dish.id)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="food__card-add-btn"
                          onClick={() => handleAddToCart(dish.id)}
                        >
                          + 加入点单
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---- 右侧：购物车面板 ---- */}
          <aside className={`food__cart ${cartOpen ? "food__cart--open" : ""}`}>
            <div className="food__cart-inner">
              <div className="food__cart-header">
                <h3 className="food__cart-title">
                  🛒 我的点单
                  {cartDetails.totalCount > 0 && (
                    <span className="food__cart-count">{cartDetails.totalCount}</span>
                  )}
                </h3>
                <button
                  className="food__cart-close"
                  onClick={() => setCartOpen(false)}
                >
                  ✕
                </button>
              </div>

              {cartDetails.items.length === 0 ? (
                <div className="food__cart-empty">
                  <span className="food__cart-empty-icon">🛒</span>
                  <p>点单是空的</p>
                  <p className="food__cart-empty-hint">快去挑选美食吧~</p>
                </div>
              ) : (
                <>
                  <ul className="food__cart-list">
                    {cartDetails.items.map(({ dish, quantity }) => (
                      <li key={dish.id} className="food__cart-item">
                        <span className="food__cart-item-emoji">{dish.emoji}</span>
                        <div className="food__cart-item-info">
                          <span className="food__cart-item-name">{dish.name}</span>
                          <div className="food__cart-item-qty">
                            <button
                              className="food__cart-qty-btn"
                              onClick={() => handleUpdateQuantity(dish.id, -1)}
                            >
                              −
                            </button>
                            <span className="food__cart-qty-value">{quantity}</span>
                            <button
                              className="food__cart-qty-btn"
                              onClick={() => handleAddToCart(dish.id)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          className="food__cart-item-remove"
                          onClick={() => handleRemoveFromCart(dish.id)}
                          title="移除此菜品"
                        >
                          🗑️
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="food__cart-footer">
                    <p className="food__cart-summary">
                      共 <strong>{cartDetails.totalCount}</strong> 道菜品
                    </p>
                    <button
                      className="food__cart-submit-btn"
                      onClick={openOrderModal}
                    >
                      提交点单
                    </button>
                    <button
                      className="food__cart-clear-btn"
                      onClick={handleClearCart}
                    >
                      清空点单
                    </button>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* ---- 移动端：购物车浮动按钮 ---- */}
          {cartDetails.totalCount > 0 && (
            <button
              className="food__cart-fab"
              onClick={() => setCartOpen(!cartOpen)}
            >
              <span className="food__cart-fab-icon">🛒</span>
              <span className="food__cart-fab-badge">{cartDetails.totalCount}</span>
            </button>
          )}

          {/* ---- 移动端购物车遮罩 ---- */}
          {cartOpen && (
            <div
              className="food__cart-overlay"
              onClick={() => setCartOpen(false)}
            />
          )}
        </div>
      </main>

      {/* ==================== 下单确认弹窗 ==================== */}
      {orderModalOpen && (
        <div className="food__modal-overlay" onClick={closeOrderModal}>
          <div
            className="food__modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="food__modal-header">
              <h3>确认点单</h3>
              <button
                className="food__modal-close"
                onClick={closeOrderModal}
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <div className="food__modal-body">
              {submitSuccess ? (
                <div className="food__success">
                  <span className="food__success-icon">✅</span>
                  <h4>点单成功！</h4>
                  <p>订单已通过邮件通知，敬请期待美食上桌~</p>
                </div>
              ) : (
                <>
                  {/* 订单摘要 */}
                  <div className="food__modal-summary">
                    <h4>📋 点单明细</h4>
                    <ul className="food__modal-list">
                      {cartDetails.items.map(({ dish, quantity }) => (
                        <li key={dish.id} className="food__modal-item">
                          <span>{dish.emoji} {dish.name}</span>
                          <span>×{quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="food__modal-total-count">
                      共计 <strong>{cartDetails.totalCount}</strong> 道菜品
                    </p>
                  </div>

                  {/* 备注 */}
                  <div className="food__modal-note-area">
                    <label className="food__modal-label">
                      📝 备注（选填）
                    </label>
                    <textarea
                      className="food__modal-note"
                      placeholder="如有特殊需求，请在此注明..."
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      maxLength={500}
                      rows={3}
                      disabled={submitting}
                    />
                  </div>

                  {/* 错误提示 */}
                  {submitError && (
                    <div className="food__modal-error">⚠️ {submitError}</div>
                  )}
                </>
              )}
            </div>

            {!submitSuccess && (
              <div className="food__modal-footer">
                <button
                  className="food__modal-btn food__modal-btn--cancel"
                  onClick={closeOrderModal}
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  className="food__modal-btn food__modal-btn--confirm"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                >
                  {submitting ? "提交中..." : "确认提交"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodOrder;
