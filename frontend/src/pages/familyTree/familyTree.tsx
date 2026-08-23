import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { navigateTo } from "../../utils/navigate";
import PageNav from "../../components/PageNav/PageNav";
import Page from "../../components/Page/Page";
import ImageWithFallback from "../../components/ImageWithFallback/ImageWithFallback";
import { familyApi, uploadUrl } from "../../api";
import type { FamilyMemberStatus } from "../../api/types";
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
// 头像组件 — 显示用户真实头像 / 占位渐变圆圈
// ============================================================

function Avatar({
  name,
  title,
  gender,
  large,
  avatarUrl,
  online,
}: {
  name: string;
  title?: string;
  gender: "male" | "female";
  large?: boolean;
  avatarUrl: string | null | undefined;
  online?: boolean;
}) {
  const tooltip = (() => {
    const label = title ? `${name}（${title}）` : name;
    return online ? `${label} — 在线` : `${label} — 离线`;
  })();

  return (
    <div
      className={`ft-avatar ${large ? "ft-avatar--large" : ""} ${
        gender === "male" ? "ft-avatar--male" : "ft-avatar--female"
      }`}
      title={tooltip}
    >
      {/* 真实头像或首字母占位 */}
      <ImageWithFallback
        className="ft-avatar__img"
        src={uploadUrl(avatarUrl)}
        alt={name}
        fallback={
          <span className="ft-avatar__initial">{name.charAt(0)}</span>
        }
      />
    </div>
  );
}

// ============================================================
// 人物卡片组件
// ============================================================

function PersonCard({
  person,
  isRoot,
  member,
}: {
  person: Person;
  isRoot?: boolean;
  member?: FamilyMemberStatus;
}) {
  const online = member?.online ?? false;
  const avatarUrl = member?.avatar ?? null;

  return (
    <div className={`ft-card ${isRoot ? "ft-card--root" : ""}`}>
      {/* 头像 */}
      <Avatar
        name={person.name}
        title={person.title}
        gender={person.gender}
        large={isRoot}
        avatarUrl={avatarUrl}
        online={online}
      />

      {/* 姓名 + 状态指示器 */}
      <div className="ft-card__info">
        <div className="ft-card__name-row">
          <span className="ft-card__name">{person.name}</span>
          <span
            className={`ft-card__status ${
              online ? "ft-card__status--online" : "ft-card__status--offline"
            }`}
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
  memberMap,
  isRoot = false,
}: {
  person: Person;
  memberMap: Record<string, FamilyMemberStatus>;
  isRoot?: boolean;
}) {
  return (
    <div className="ft-couple">
      {/* 本人 */}
      <PersonCard
        person={person}
        member={memberMap[person.name]}
        isRoot={isRoot}
      />

      {/* 配偶（如果有） */}
      {person.spouse && (
        <>
          {/* 连接线 + 戒指图标 */}
          <div className="ft-couple__ring">
            <span className="ft-couple__ring-icon">💍</span>
          </div>

          {/* 配偶卡片 */}
          <div className="ft-card ft-card--spouse">
            <Avatar
              name={person.spouse.name}
              title={person.spouse.title}
              gender={person.spouse.gender}
              avatarUrl={memberMap[person.spouse.name]?.avatar ?? null}
              online={memberMap[person.spouse.name]?.online ?? false}
            />
            <div className="ft-card__info">
              <div className="ft-card__name-row">
                <span className="ft-card__name">{person.spouse.name}</span>
                <span
                  className={`ft-card__status ${
                    memberMap[person.spouse.name]?.online
                      ? "ft-card__status--online"
                      : "ft-card__status--offline"
                  }`}
                  title={
                    memberMap[person.spouse.name]?.online
                      ? `${person.spouse.name} 在线`
                      : `${person.spouse.name} 离线`
                  }
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
  memberMap,
  isRoot = false,
}: {
  person: Person;
  memberMap: Record<string, FamilyMemberStatus>;
  isRoot?: boolean;
}) {
  const { children } = person;
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = children && children.length > 0;

  return (
    <div className="ft-tree">
      {/* 当前节点：夫妻卡片 */}
      <div className="ft-tree__node">
        <CoupleCard
          person={person}
          memberMap={memberMap}
          isRoot={isRoot}
        />

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
                  className={`ft-tree__child ${
                    i === 0 ? "ft-tree__child--first" : ""
                  } ${
                    i === children.length - 1
                      ? "ft-tree__child--last"
                      : ""
                  }`}
                >
                  {/* 每个子节点上方的下落竖线 */}
                  <div className="ft-tree__drop" />
                  <SubTree
                    person={child}
                    memberMap={memberMap}
                  />
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
  const [memberMap, setMemberMap] = useState<
    Record<string, FamilyMemberStatus>
  >({});

  // 未登录跳转
  useEffect(() => {
    if (!isAuthenticated) {
      navigateTo("/login");
    }
  }, [isAuthenticated]);

  // 拉取家族成员状态（在线状态 + 头像）
  useEffect(() => {
    familyApi
      .getStatus()
      .then((res) => {
        const map: Record<string, FamilyMemberStatus> = {};
        res.members.forEach((m) => {
          map[m.name] = m;
        });
        setMemberMap(map);
      })
      .catch((err) => {
        // 静默失败 — 接口不可用时全部显示离线
        console.warn("Failed to fetch family status:", err);
      });
  }, []);

  return (
    <Page className="ft-page">
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
                头像自动使用每位成员在系统中设置的个人头像，<strong>在线</strong>成员显示为 🟢，<strong>离线</strong>成员显示为 🔴。
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
                  暂无头像
                </span>
                <span className="ft-intro__legend-item">
                  💍 夫妻关系
                </span>
                <span className="ft-intro__legend-item">
                  <span
                    className="ft-card__status ft-card__status--online"
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      verticalAlign: "middle",
                      marginRight: 2,
                    }}
                  />{" "}
                  在线
                </span>
                <span className="ft-intro__legend-item">
                  <span
                    className="ft-card__status ft-card__status--offline"
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      verticalAlign: "middle",
                      marginRight: 2,
                    }}
                  />{" "}
                  离线
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
          <SubTree
            person={FAMILY_DATA}
            memberMap={memberMap}
            isRoot
          />
        </div>
      </section>

      {/* 底部 */}
      <footer className="ft-footer">
        <p>🌿 家和万事兴 · 代代永相传 🌿</p>
      </footer>
    </Page>
  );
}

export default FamilyTree;
