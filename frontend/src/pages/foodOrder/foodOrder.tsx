import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { foodApi } from "../../api";
import PageNav from "../../components/PageNav/PageNav";

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
  image: string;
  emoji: string;
  recommended?: boolean;
  spicy?: boolean;
}

const CATEGORIES: (DishCategory | "全部")[] = [
  "全部", "热菜", "凉菜", "汤品", "主食", "饮品", "甜点",
];

const DISHES: Dish[] = [
  // ---- 热菜 ----
  { id: 1, name: "家烧六月黄", category: "热菜", description: "时令六月黄，家烧做法，蟹黄饱满鲜美", image: "/image/家烧六月黄.jpg", emoji: "🦀", recommended: true },
  { id: 2, name: "烤鸡翅", category: "热菜", description: "外焦里嫩，香气四溢，大人小孩都爱吃", image: "/image/烤鸡翅.jpg", emoji: "🍗" },
  { id: 3, name: "盐水麻虾", category: "热菜", description: "鲜嫩弹牙，原汁原味，经典盐水煮法", image: "/image/盐水麻虾.jpg", emoji: "🦐", recommended: true },
  // ---- 凉菜 ----
  { id: 4, name: "凉拌牛肉", category: "凉菜", description: "酱香浓郁，清爽开胃，夏日必备凉菜", image: "/image/凉拌牛肉.jpg", emoji: "🥩", recommended: true },
  { id: 5, name: "生菜沙拉", category: "凉菜", description: "新鲜时蔬，清脆爽口，健康低脂", image: "/image/生菜沙拉.jpg", emoji: "🥗" },
  // ---- 汤品 ----
  { id: 6, name: "雪梨鲍鱼", category: "汤品", description: "清甜雪梨搭配鲜美鲍鱼，滋补养生靓汤", image: "/image/雪梨鲍鱼.jpg", emoji: "🥣", recommended: true },
];

// ============================================================
// FoodOrder 页面组件
// ============================================================

function FoodOrder() {
  const isAuthenticated = useRequireAuth();

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
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 清理定时器，防止组件卸载后 setState
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

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
      if (newQty <= 0) next.delete(dishId);
      else next.set(dishId, newQty);
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
      // 清除旧定时器（防止多次快速提交导致状态冲突）
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setOrderModalOpen(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="food">
      <div className="food__top-decor" />
      {/* ===== 导航栏 (共享组件) ===== */}
      <PageNav />

      {/* ===== 主内容区 ===== */}
      <main className="food__main">
        <div className="food__layout">
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
                  className={`food__category-btn ${activeCategory === cat ? "food__category-btn--active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 菜品网格 */}
            {filteredDishes.length > 0 ? (
              <div className="food__grid">
              {filteredDishes.map((dish) => {
                const inCart = cartItems.get(dish.id) || 0;
                return (
                  <div key={dish.id} className="food__card">
                    {/* 图片区 */}
                    <div className="food__card-image">
                      <img
                        className="food__card-img"
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <span className="food__card-emoji" style={{ display: "none" }}>{dish.emoji}</span>
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
                          <button className="food__card-qty-btn" onClick={() => handleUpdateQuantity(dish.id, -1)}>−</button>
                          <span className="food__card-qty">{inCart}</span>
                          <button className="food__card-qty-btn" onClick={() => handleAddToCart(dish.id)}>+</button>
                        </div>
                      ) : (
                        <button className="food__card-add-btn" onClick={() => handleAddToCart(dish.id)}>
                          + 加入点单
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              <div className="food__empty-category">
                <span className="food__empty-category-icon">🍽️</span>
                <p>该分类暂无菜品</p>
                <p className="food__empty-category-hint">敬请期待更多美食~</p>
              </div>
            )}
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
                <button className="food__cart-close" onClick={() => setCartOpen(false)}>✕</button>
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
                            <button className="food__cart-qty-btn" onClick={() => handleUpdateQuantity(dish.id, -1)}>−</button>
                            <span className="food__cart-qty-value">{quantity}</span>
                            <button className="food__cart-qty-btn" onClick={() => handleAddToCart(dish.id)}>+</button>
                          </div>
                        </div>
                        <button className="food__cart-item-remove" onClick={() => handleRemoveFromCart(dish.id)} title="移除此菜品">🗑️</button>
                      </li>
                    ))}
                  </ul>

                  <div className="food__cart-footer">
                    <p className="food__cart-summary">
                      共 <strong>{cartDetails.totalCount}</strong> 道菜品
                    </p>
                    <button className="food__cart-submit-btn" onClick={openOrderModal}>提交点单</button>
                    <button className="food__cart-clear-btn" onClick={handleClearCart}>清空点单</button>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* ---- 移动端：购物车浮动按钮 ---- */}
          {cartDetails.totalCount > 0 && (
            <button className="food__cart-fab" onClick={() => setCartOpen(!cartOpen)}>
              <span className="food__cart-fab-icon">🛒</span>
              <span className="food__cart-fab-badge">{cartDetails.totalCount}</span>
            </button>
          )}

          {/* ---- 移动端购物车遮罩 ---- */}
          {cartOpen && (
            <div className="food__cart-overlay" onClick={() => setCartOpen(false)} />
          )}
        </div>
      </main>

      {/* ===== 下单确认弹窗 ===== */}
      {orderModalOpen && (
        <div className="food__modal-overlay" onClick={closeOrderModal}>
          <div className="food__modal" onClick={(e) => e.stopPropagation()}>
            <div className="food__modal-header">
              <h3>确认点单</h3>
              <button className="food__modal-close" onClick={closeOrderModal} disabled={submitting}>✕</button>
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

                  <div className="food__modal-note-area">
                    <label className="food__modal-label">📝 备注（选填）</label>
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

                  {submitError && (
                    <div className="food__modal-error">⚠️ {submitError}</div>
                  )}
                </>
              )}
            </div>

            {!submitSuccess && (
              <div className="food__modal-footer">
                <button className="food__modal-btn food__modal-btn--cancel" onClick={closeOrderModal} disabled={submitting}>取消</button>
                <button className="food__modal-btn food__modal-btn--confirm" onClick={handleSubmitOrder} disabled={submitting}>
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
