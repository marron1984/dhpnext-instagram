'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getStores, fetchProjects, toggleChecklist, type Project } from '@/lib/store';

export default function ChecklistPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const loadData = useCallback(async () => {
    setProjects(await fetchProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const stores = getStores();

  const goToPrevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else { setMonth(m => m - 1); } };
  const goToNextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else { setMonth(m => m + 1); } };
  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const handleToggle = async (projectId: number, checkId: number) => {
    await toggleChecklist(projectId, checkId);
    loadData();
  };

  const getProgress = (cl: { checked: boolean }[]) => {
    if (!cl || !cl.length) return 0;
    return Math.round((cl.filter(c => c.checked).length / cl.length) * 100);
  };

  const weekNumbers = [...new Set(projects.map(p => p.week_number))].sort((a, b) => a - b);
  const weekGroups = weekNumbers.map(wn => ({
    weekNumber: wn,
    role: projects.find(p => p.week_number === wn)?.week_role || '',
    projects: projects.filter(p => p.week_number === wn),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold">{year}年{month}月</h1>
          <p className="text-[13px] text-[var(--muted)]">最終チェックリスト</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={goToPrevMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">←</button>
          {!isCurrentMonth && <button onClick={goToToday} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px]">今月</button>}
          <button onClick={goToNextMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">→</button>
        </div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg p-4 mb-4">
        <h2 className="text-[13px] font-semibold mb-2">フォント運用ガイド</h2>
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="bg-[var(--accent-light)] rounded-md p-3">
            <h3 className="font-medium mb-0.5">高級・和・上質系</h3>
            <p className="text-[var(--muted)]">Noto Serif JP / Source Han Serif / 游明朝 / ヒラギノ明朝</p>
          </div>
          <div className="bg-[var(--accent-light)] rounded-md p-3">
            <h3 className="font-medium mb-0.5">モダン・洗練系</h3>
            <p className="text-[var(--muted)]">Noto Sans JP / Source Han Sans / 游ゴシック / ヒラギノ角ゴ</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--accent-light)] border border-[var(--border)] rounded-lg px-4 py-3 mb-6 text-[12px] text-[var(--muted)]">
        文字誤りとフォント違和感は発生率が高いため、最終確認は必ず人が行ってください。
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)] text-[13px]">プロジェクトがありません。カレンダーページから一括生成してください。</div>
      ) : (
        <div className="space-y-6">
          {weekGroups.map(({ weekNumber, role, projects: wp }) => {
            const weekChecked = wp.reduce((sum, p) => sum + p.checklist.filter(c => c.checked).length, 0);
            const weekTotal = wp.reduce((sum, p) => sum + p.checklist.length, 0);
            const weekPct = weekTotal ? Math.round((weekChecked / weekTotal) * 100) : 0;
            const weekDone = weekPct === 100;
            return (
              <div key={weekNumber}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[13px] font-semibold">W{weekNumber}</h2>
                    <span className="text-[12px] text-[var(--muted)]">{role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[var(--accent-light)] rounded-full h-1">
                      <div className={`h-1 rounded-full transition-all ${weekDone ? 'bg-[var(--foreground)]' : 'bg-[var(--muted)]'}`} style={{ width: `${weekPct}%` }} />
                    </div>
                    <span className="text-[12px] tabular-nums text-[var(--muted)]">{weekChecked}/{weekTotal}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {wp.map(p => {
                    const progress = getProgress(p.checklist);
                    const allDone = progress === 100;
                    const store = stores.find(s => s.id === p.store_id);
                    return (
                      <div key={p.id} className={`bg-white border rounded-lg ${allDone ? 'border-[var(--foreground)]' : 'border-[var(--border)]'}`}>
                        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--accent-light)]">
                          <span className="text-[13px] font-medium">{store?.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-[var(--accent-light)] rounded-full h-1">
                              <div className={`h-1 rounded-full ${allDone ? 'bg-[var(--foreground)]' : 'bg-[var(--muted)]'}`} style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-[12px] tabular-nums text-[var(--muted)]">{progress}%</span>
                          </div>
                        </div>
                        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1">
                          {p.checklist.map(item => (
                            <label key={item.id} className="flex items-center gap-2 py-0.5 cursor-pointer text-[12px]">
                              <input type="checkbox" checked={item.checked} onChange={() => handleToggle(p.id, item.id)} className="w-3.5 h-3.5 rounded border-[var(--border)] accent-[var(--foreground)]" />
                              <span className={item.checked ? 'line-through text-[var(--muted)]' : ''}>{item.item_text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
