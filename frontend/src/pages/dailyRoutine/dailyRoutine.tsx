import { useState, useEffect, useCallback } from "react";
import "./dailyRoutine.css";

/* ===== Types ===== */

interface RoutineItem {
  time: string;
  title: string;
  icon: string;
}

interface NewRoutineForm {
  time: string;
  title: string;
  icon: string;
}

/* ===== Constants ===== */

const LS_TEMPLATE_KEY = "dr_template";
const LS_COLLAPSED_KEY = "dr_collapsed";

/* ===== localStorage helpers ===== */

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `dr_state_${y}-${m}-${d}`;
}

function loadTemplate(): RoutineItem[] {
  try {
    const raw = localStorage.getItem(LS_TEMPLATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted data — fall through
  }
  return [];
}

function saveTemplate(routines: RoutineItem[]): void {
  localStorage.setItem(LS_TEMPLATE_KEY, JSON.stringify(routines));
}

function loadDoneIndices(templateLen: number): Set<number> {
  try {
    const raw = localStorage.getItem(getTodayKey());
    if (raw) {
      const arr: number[] = JSON.parse(raw);
      // filter out stale indices (e.g. after template edit)
      return new Set(arr.filter((i) => i >= 0 && i < templateLen));
    }
  } catch {
    // corrupted — fresh start
  }
  return new Set();
}

function saveDoneIndices(done: Set<number>): void {
  localStorage.setItem(getTodayKey(), JSON.stringify([...done]));
}

function loadCollapsed(): boolean {
  try {
    return localStorage.getItem(LS_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function saveCollapsed(v: boolean): void {
  localStorage.setItem(LS_COLLAPSED_KEY, v ? "1" : "0");
}

/** 清理过期的 dr_state_* 键（只保留今天的） */
function cleanupOldStateKeys(): void {
  const todayKey = getTodayKey();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("dr_state_") && key !== todayKey) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/* ===== Component ===== */

function DailyRoutine() {
  // --- template (master list) ---
  const [template, setTemplate] = useState<RoutineItem[]>(loadTemplate);

  // --- today's done set ---
  const [doneSet, setDoneSet] = useState<Set<number>>(() => loadDoneIndices(loadTemplate().length));

  // --- collapsed ---
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  // --- edit mode (start in edit mode if no template saved yet) ---
  const [editing, setEditing] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_TEMPLATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {
      // corrupted — start in edit mode
    }
    return true;
  });
  const [newForm, setNewForm] = useState<NewRoutineForm>({ time: "08:00", title: "", icon: "📌" });

  // --- derived ---
  const today = new Date();
  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekStr = `星期${weekDays[today.getDay()]}`;
  const doneCount = doneSet.size;
  const total = template.length;

  // On mount: clean old state keys
  useEffect(() => {
    cleanupOldStateKeys();
  }, []);

  // Persist doneSet to localStorage whenever it changes
  useEffect(() => {
    saveDoneIndices(doneSet);
  }, [doneSet]);

  // --- handlers ---

  const toggleDone = useCallback(
    (index: number) => {
      setDoneSet((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    []
  );

  const handleCollapse = useCallback((v: boolean) => {
    setCollapsed(v);
    saveCollapsed(v);
  }, []);

  const enterEdit = useCallback(() => {
    setEditing(true);
    setNewForm({ time: "08:00", title: "", icon: "📌" });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const addRoutine = useCallback(() => {
    const trimmed = newForm.title.trim();
    if (!trimmed) return;
    const item: RoutineItem = {
      time: newForm.time || "08:00",
      title: trimmed,
      icon: newForm.icon || "📌",
    };
    setTemplate((prev) => {
      const next = [...prev, item];
      saveTemplate(next);
      return next;
    });
    setNewForm({ time: "08:00", title: "", icon: "📌" });
  }, [newForm]);

  const deleteRoutine = useCallback(
    (index: number) => {
      setTemplate((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return next;
      });
      // Re-index doneSet because indices shifted
      setDoneSet((oldDone) => {
        const newDone = new Set<number>();
        oldDone.forEach((i) => {
          if (i < index) newDone.add(i);
          else if (i > index) newDone.add(i - 1);
          // i === index → drop
        });
        return newDone;
      });
    },
    []
  );

  // Persist template to localStorage whenever it changes
  useEffect(() => {
    saveTemplate(template);
  }, [template]);

  const resetToday = useCallback(() => {
    setDoneSet(new Set());
  }, []);

  // --- collapsed view ---
  if (collapsed) {
    return (
      <aside className="dr dr--collapsed">
        <button
          className="dr__toggle"
          onClick={() => handleCollapse(false)}
          title="展开日程"
        >
          <span className="dr__toggle-icon">▶</span>
        </button>
        <div className="dr__collapsed-hint">
          <span>📅</span>
          <span className="dr__collapsed-date">{dateStr}</span>
          <span className="dr__collapsed-progress">
            {doneCount}/{total}
          </span>
        </div>
      </aside>
    );
  }

  // --- expanded view ---
  return (
    <aside className="dr">
      {/* 头部 */}
      <div className="dr__head">
        <div className="dr__head-row">
          <h3 className="dr__title">📅 今日日程</h3>
          <div className="dr__head-actions">
            {!editing && (
              <button
                className="dr__action-btn"
                onClick={enterEdit}
                title="管理日程"
              >
                ⚙️
              </button>
            )}
            <button
              className="dr__toggle"
              onClick={() => handleCollapse(true)}
              title="收起日程"
            >
              <span className="dr__toggle-icon">◀</span>
            </button>
          </div>
        </div>
        <p className="dr__date">{dateStr}</p>
        <p className="dr__weekday">{weekStr}</p>

        {/* 进度条 */}
        <div className="dr__progress-bar">
          <div
            className="dr__progress-fill"
            style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : "0%" }}
          />
        </div>
        <p className="dr__progress-text">
          已完成 {doneCount}/{total}
        </p>

        {/* 编辑模式工具栏 */}
        {editing && (
          <div className="dr__edit-toolbar">
            <button className="dr__edit-btn dr__edit-btn--cancel" onClick={cancelEdit}>
              完成编辑
            </button>
            <button className="dr__edit-btn dr__edit-btn--reset" onClick={resetToday}>
              重置今日
            </button>
          </div>
        )}
      </div>

      {/* 日程列表 */}
      <ul className="dr__list">
        {template.map((item, index) => (
          <li
            key={`${index}-${item.time}-${item.title}`}
            className={`dr__item ${doneSet.has(index) ? "dr__item--done" : ""} ${editing ? "dr__item--editing" : ""}`}
            onClick={() => !editing && toggleDone(index)}
          >
            <span className="dr__item-time">{item.time}</span>
            <span className="dr__item-icon">{item.icon}</span>
            <span className="dr__item-title">{item.title}</span>
            {editing ? (
              <button
                className="dr__item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteRoutine(index);
                }}
                title="删除此项"
              >
                ✕
              </button>
            ) : (
              <span className="dr__item-check">
                {doneSet.has(index) ? "✅" : "○"}
              </span>
            )}
          </li>
        ))}

        {template.length === 0 && !editing && (
          <li className="dr__item dr__item--empty">
            <span className="dr__empty-icon">📋</span>
            <span className="dr__empty-text">还没有日程，点击 ⚙️ 开始添加吧</span>
          </li>
        )}

        {/* 新增表单 */}
        {editing && (
          <li className="dr__item dr__item--add-form">
            <input
              className="dr__add-input dr__add-input--time"
              type="text"
              placeholder="08:00"
              value={newForm.time}
              onChange={(e) => setNewForm((f) => ({ ...f, time: e.target.value }))}
            />
            <input
              className="dr__add-input dr__add-input--icon"
              type="text"
              placeholder="📌"
              value={newForm.icon}
              onChange={(e) => setNewForm((f) => ({ ...f, icon: e.target.value }))}
              maxLength={4}
            />
            <input
              className="dr__add-input dr__add-input--title"
              type="text"
              placeholder="新日程…"
              value={newForm.title}
              onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") addRoutine();
              }}
            />
            <button className="dr__add-btn" onClick={addRoutine} title="添加">
              ＋
            </button>
          </li>
        )}
      </ul>

      {/* 底部提示 */}
      <div className="dr__foot">
        <p>{editing ? "⚙️ 管理日程模板" : "👆 点击项目标记完成"}</p>
      </div>
    </aside>
  );
}

export default DailyRoutine;
