'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getStores, getProjects, updateProject, type Store, type Project } from '@/lib/store';

const DAYS = [
  { key: 'monday_done' as const, label: '月曜', desc: '初稿提出' },
  { key: 'tuesday_done' as const, label: '火曜', desc: 'チェックバック' },
  { key: 'wednesday_done' as const, label: '水曜', desc: '納品日' },
  { key: 'thursday_done' as const, label: '木曜', desc: '投稿（21:00）' },
];

const MILESTONES = [
  { key: 'draft_status' as const, label: '初稿提出', desc: '月曜：動画構成、テロップ、キャプション、ハッシュタグの初稿を提出' },
  { key: 'checkback_status' as const, label: 'チェックバック', desc: '火曜：誤字、文脈、トーン、導線、店の格に合うかを確認・修正' },
  { key: 'final_status' as const, label: '納品完了', desc: '水曜：最終動画、最終キャプション、最終ハッシュタグ、保存先整理' },
];

export default function WorkflowPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const loadData = useCallback(() => {
    setStores(getStores());
    setProjects(getProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const goToPrevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else { setMonth(m => m - 1); } };
  const goToNextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else { setMonth(m => m + 1); } };
  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const toggleDay = (projectId: number, field: keyof Project) => {
    const p = projects.find(pr => pr.id === projectId);
    if (!p) return;
    updateProject(projectId, { [field]: !p[field] } as Partial<Project>);
    loadData();
  };

  const cycleMilestone = (projectId: number, field: keyof Project) => {
    const p = projects.find(pr => pr.id === projectId);
    if (!p) return;
    const order = ['pending', 'in_progress', 'completed'];
    const cur = p[field] as string;
    const next = order[(order.indexOf(cur) + 1) % order.length];
    updateProject(projectId, { [field]: next } as Partial<Project>);
    loadData();
  };

  const mStyle = (s: string) => {
    switch (s) { case 'completed': return 'bg-[var(--foreground)] text-white'; case 'in_progress': return 'bg-[var(--muted)] text-white'; default: return 'bg-[var(--accent-light)] text-[var(--muted)]'; }
  };
  const mLabel = (s: string) => {
    switch (s) { case 'completed': return '完了'; case 'in_progress': return '進行中'; default: return '未着手'; }
  };

  const grouped = projects.reduce<Record<string, Project[]>>((acc, p) => {
    const name = stores.find(s => s.id === p.store_id)?.name || '';
    if (!acc[name]) acc[name] = [];
    acc[name].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold">{year}年{month}月</h1>
          <p className="text-[13px] text-[var(--muted)]">週次ワークフロー</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={goToPrevMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">←</button>
          {!isCurrentMonth && <button onClick={goToToday} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px]">今月</button>}
          <button onClick={goToNextMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">→</button>
        </div>
      </div>

      {/* Day cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {DAYS.map(d => (
          <div key={d.key} className="bg-white border border-[var(--border)] rounded-lg px-4 py-3">
            <h3 className="text-[13px] font-semibold">{d.label}</h3>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">{d.desc}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {MILESTONES.map(m => (
            <div key={m.key} className="border border-[var(--border)] rounded-md p-3">
              <h4 className="text-[13px] font-medium">{m.label}</h4>
              <p className="text-[11px] text-[var(--muted)] mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)] text-[13px]">プロジェクトがありません。カレンダーページから一括生成してください。</div>
      ) : (
        Object.entries(grouped).map(([storeName, storeProjects]) => (
          <div key={storeName} className="bg-white border border-[var(--border)] rounded-lg mb-4">
            <div className="px-5 py-3 border-b border-[var(--border)]"><h2 className="text-[13px] font-semibold">{storeName}</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">週</th>
                  <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">役割</th>
                  {DAYS.map(d => <th key={d.key} className="px-4 py-2.5 text-center font-normal text-[var(--muted)]">{d.label}</th>)}
                  {MILESTONES.map(m => <th key={m.key} className="px-4 py-2.5 text-center font-normal text-[var(--muted)]">{m.label}</th>)}
                </tr></thead>
                <tbody>
                  {storeProjects.map(p => (
                    <tr key={p.id} className="border-b border-[var(--accent-light)] last:border-0 hover:bg-[var(--accent-light)]">
                      <td className="px-4 py-2.5 font-medium">W{p.week_number}</td>
                      <td className="px-4 py-2.5 text-[var(--muted)]">{p.week_role}</td>
                      {DAYS.map(d => (
                        <td key={d.key} className="px-4 py-2.5 text-center">
                          <button onClick={() => toggleDay(p.id, d.key)} className={`w-6 h-6 rounded-full text-[10px] transition-colors ${p[d.key] ? 'bg-[var(--foreground)] text-white' : 'border border-[var(--border)] hover:border-[var(--muted)]'}`}>
                            {p[d.key] ? '✓' : ''}
                          </button>
                        </td>
                      ))}
                      {MILESTONES.map(m => (
                        <td key={m.key} className="px-4 py-2.5 text-center">
                          <button onClick={() => cycleMilestone(p.id, m.key)} className={`text-[11px] px-2.5 py-1 rounded-full transition-colors ${mStyle(p[m.key])}`}>
                            {mLabel(p[m.key])}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
