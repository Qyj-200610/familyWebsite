import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { navigateTo } from "../../utils/navigate";
import PageNav from "../../components/PageNav/PageNav";
import { familyApi } from "../../api";
import "./familyTree.css";

// ============================================================
// 类型定义
// ============================================================

interface Person {
  id: string;
  name: string;     // 姓名缩写
  gender: "male" | "female";
  title: string;    // 辈分称谓
  spouse?: {
    name: string;
    gender: "male" | "female";
    title: string;
  };
  children: Person[];
}

// ============================================================
// 家谱数据 — 依据 docs/FAMILY.md
// ============================================================

const FAMILY_DATA: Person = {
  id: "1",
  name: "Lhf",
  gender: "female",
  title: "外婆",
  spouse: {
    name: "Lqb",
    gender: "male",
    title: "外公",
  },
  children: [
    {
      id: "2",
      name: "Lqq",
      gender: "female",
      title: "母亲",
      spouse: {
        name: "Qd",
        gender: "male",
        title: "父亲",
      },
      children: [
        {
          id: "4",
          name: "Qyj",
          gender: "male",
          title: "本人",
          children: [],
        },
      ],
    },
    {
      id: "3",
      name: "Ljy",
      gender: "male",
      title: "舅舅",
      spouse: {
        name: "Lln",
        gender: "female",
        title: "舅妈",
      },
      children: [
        {
          id: "5",
          name: "Lyj",
          gender: "male",
          title: "表弟",
          children: [],
        },
      ],
    },
  ],
};

// ============================================================
// 头像占位组件（预留照片上传位置）
// ============================================================

function AvatarPlaceholder({
  name,
  title,
  gender,
  large,
}: {
  name: string;
  title?: string;
  gender: "male" | "female";
  large?: boolean;
}) {
  const tooltip = title
    ? `${name}（${title}）— 点击上传照片（待实现）`
    : `${name} — 点击上传照片（待实现）`;

  return (
    <div
      className={`ft-avatar ${large ? "ft-avatar--large" : ""} ${gender === "male" ? "ft-avatar--male" : "ft-avatar--female"
        }`}
      title={tooltip}
    >
      {/* 照片（暂无时显示首字母） */}
      <span className="ft-avatar__initial">{name.charAt(0)}</span>

      {/* 预留上传图标 */}
      <span className="ft-avatar__upload-hint" title="上传照片">
        📷
      </span>
    </div>
  );
}

// ============================================================
// 人物卡片组件
// ============================================================

function PersonCard({
  person,
  isRoot,
  online,
}: {
  person: Person;
  isRoot?: boolean;
  online?: boolean;
}) {
  return (
    <div className={`ft-card ${isRoot ? "ft-card--root" : ""}`}>
      {/* 照片占位区 */}
      <AvatarPlaceholder
        name={person.name}
        title={person.title}
        gender={person.gender}
        large={isRoot}
      />

      {/* 姓名 + 状态指示器 */}
      <div className="ft-card__info">
        <div className="ft-card__name-row">
          <span className="ft-card__name">{person.name}</span>
          <span
            className={`ft-card__status ${online ? "ft-card__status--online" : "ft-card__status--offline"}`}
            title={online ? `${person.name} 在线` : `${person.name} 离线`}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 夫妻组合卡片（本人 + 配偶并排）
// ============================================================

function CoupleCard({
  person,
  statusMap,
}: {
  person: Person;
  statusMap: Record<string, boolean>;
}) {
  return (
    <div className="ft-couple">
      {/* 本人 */}
      <PersonCard person={person} online={statusMap[person.name]} />

      {/* 配偶（如果有） */}
      {person.spouse && (
        <>
          {/* 连接线 + 戒指图标 */}
          <div className="ft-couple__ring">
            <span className="ft-couple__ring-icon">💍</span>
          </div>

          {/* 配偶卡片 */}
          <div className="ft-card ft-card--spouse">
            <AvatarPlaceholder
              name={person.spouse.name}
              title={person.spouse.title}
              gender={person.spouse.gender}
            />
            <div className="ft-card__info">
              <div className="ft-card__name-row">
                <span className="ft-card__name">{person.spouse.name}</span>
                <span
                  className={`ft-card__status ${statusMap[person.spouse.name] ? "ft-card__status--online" : "ft-card__status--offline"}`}
                  title={statusMap[person.spouse.name] ? `${person.spouse.name} 在线` : `${person.spouse.name} 离线`}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// 递归子树
// ============================================================

function SubTree({
  person,
  statusMap,
}: {
  person: Person;
  statusMap: Record<string, boolean>;
}) {
  const { children } = person;
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = children && children.length > 0;

  return (
    <div className="ft-tree">
      {/* 当前节点：夫妻卡片 */}
      <div className="ft-tree__node">
        <CoupleCard person={person} statusMap={statusMap} />

        {/* 折叠按钮 */}
        {hasChildren && (
          <button
            className="ft-tree__toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "展开后代" : "收起后代"}
          >
            {collapsed ? "＋" : "－"}
          </button>
        )}
      </div>

      {/* 子节点区域 */}
      {hasChildren && !collapsed && (
        <div className="ft-tree__offspring">
          {/* 竖线：从夫妻卡片中点向下 */}
          <div className="ft-tree__vline" />

          {/* 子节点容器 */}
          <div className="ft-tree__children-row">
            {/* 兄弟横bar */}
            {children.length > 1 && <div className="ft-tree__hbar" />}

            <div className="ft-tree__children">
              {children.map((child, i) => (
                <div
                  key={child.id}
                  className={`ft-tree__child ${i === 0 ? "ft-tree__child--first" : ""
                    } ${i === children.length - 1
                      ? "ft-tree__child--last"
                      : ""
                    }`}
                >
                  {/* 每个子节点上方的下落竖线 */}
                  <div className="ft-tree__drop" />
                  <SubTree person={child} statusMap={statusMap} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 页面主体
// ============================================================

function FamilyTree() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [introOpen, setIntroOpen] = useState(true);
  const [statusMap, setStatusMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("/login");
    }
  }, [isAuthenticated]);

  // 拉取家族成员在线状态
  useEffect(() => {
    familyApi
      .getStatus()
      .then((res) => {
        const map: Record<string, boolean> = {};
        res.members.forEach((m) => {
          map[m.name] = m.online;
        });
        setStatusMap(map);
      })
      .catch(() => {
        // 静默失败 — 接口不可用时全部显示离线
      });
  }, []);

  return (
    <div className="ft-page">
      {/* 顶部装饰条 */}
      <div className="ft-page__top-decor" />

      {/* 导航 */}
      <PageNav />

      {/* 页面头部 */}
      <section className="ft-hero">
        <div className="ft-hero__bg" />
        <div className="ft-hero__inner">
          <span className="ft-hero__emoji">🌳</span>
          <h1 className="ft-hero__title">家族谱系</h1>
          <p className="ft-hero__subtitle">
            外婆分支 · 三代同堂 — 根深叶茂，源远流长
          </p>
        </div>
      </section>

      {/* 家谱简介 */}
      {introOpen && (
        <section className="ft-intro">
          <div className="ft-intro__card">
            <div className="ft-intro__header">
              <span className="ft-intro__icon">📖</span>
              <h3>关于我们的家谱</h3>
              <button
                className="ft-intro__close"
                onClick={() => setIntroOpen(false)}
                title="收起"
              >
                ✕
              </button>
            </div>
            <div className="ft-intro__body">
              <p>
                本家谱目前记录<strong>外婆（Lhf）</strong>这一分支，自祖辈到同辈共三代。
                点击节点旁的 <strong>－</strong> 可收起分支，<strong>＋</strong> 可展开。
                每个成员头像处留有照片上传位置，后续可点击 📷 上传个人照片。
              </p>
              <div className="ft-intro__legend">
                <span className="ft-intro__legend-item">
                  <span className="ft-intro__dot ft-intro__dot--male" />
                  男性
                </span>
                <span className="ft-intro__legend-item">
                  <span className="ft-intro__dot ft-intro__dot--female" />
                  女性
                </span>
                <span className="ft-intro__legend-item">
                  <span className="ft-intro__dot ft-intro__dot--empty" />
                  暂无照片
                </span>
                <span className="ft-intro__legend-item">
                  💍 夫妻关系
                </span>
                <span className="ft-intro__legend-item">
                  <span className="ft-card__status ft-card__status--online" style={{ display: "inline-block", width: 10, height: 10, verticalAlign: "middle", marginRight: 2 }} />
                  {" "}在线
                </span>
                <span className="ft-intro__legend-item">
                  <span className="ft-card__status ft-card__status--offline" style={{ display: "inline-block", width: 10, height: 10, verticalAlign: "middle", marginRight: 2 }} />
                  {" "}离线
                </span>
                <span className="ft-intro__legend-item">
                  📷 上传照片（待实现）
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {!introOpen && (
        <div className="ft-intro__reopen-wrap">
          <button
            className="ft-intro__reopen"
            onClick={() => setIntroOpen(true)}
          >
            📖 查看家谱说明
          </button>
        </div>
      )}

      {/* 家谱树主体 */}
      <section className="ft-tree-section">
        <div className="ft-tree__canvas">
          <SubTree person={FAMILY_DATA} statusMap={statusMap} />
        </div>
      </section>

      {/* 底部 */}
      <footer className="ft-footer">
        <p>🌿 家和万事兴 · 代代永相传 🌿</p>
      </footer>
    </div>
  );
}

export default FamilyTree;
