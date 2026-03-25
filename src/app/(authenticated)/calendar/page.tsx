'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { WEEK_ROLES } from '@/lib/constants';
import { getStores, fetchProjects, createProjectsBulk, type Store, type Project } from '@/lib/store';

export default function CalendarPage() {
  const [stores] = useState<Store[]>(getStores());
  const [projects, setProjects] = useState<Project[]>([]);
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setProjects(await fetchProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const goToPrevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else { setMonth(m => m - 1); } };
  const goToNextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else { setMonth(m => m + 1); } };
  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const generateMonthProjects = async () => {
    setCreating(true);
    const currentProjects = await fetchProjects({ year, month });
    const toCreate: Array<{ store_id: number; year: number; month: number; week_number: number; week_role: string; theme: string }> = [];
    for (const store of stores) {
      for (const wr of WEEK_ROLES) {
        const exists = currentProjects.find(p => p.store_id === store.id && p.week_number === wr.week);
        if (!exists) {
          toCreate.push({ store_id: store.id, year, month, week_number: wr.week, week_role: wr.role, theme: wr.theme });
        }
      }
    }
    if (toCreate.length > 0) {
      await createProjectsBulk(toCreate);
      alert(`${toCreate.length}件のプロジェクトを生成しました`);
    } else {
      alert('すべてのプロジェクトは既に存在します');
    }
    await loadData();
    setCreating(false);
  };

  const getThursdays = () => {
    const thursdays: Date[] = [];
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      if (date.getDay() === 4) thursdays.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return thursdays;
  };
  const thursdays = getThursdays();

  const statusLabel = (s: string) => {
    switch (s) { case 'completed': return '完了'; case 'in_progress': return '制作中'; case 'review': return 'レビュー'; default: return '企画'; }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold">{year}年{month}月</h1>
          <p className="text-[13px] text-[var(--muted)]">月間カレンダー</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button onClick={goToPrevMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">←</button>
            {!isCurrentMonth && <button onClick={goToToday} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px]">今月</button>}
            <button onClick={goToNextMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">→</button>
          </div>
          <button onClick={generateMonthProjects} disabled={creating} className="px-4 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px] hover:opacity-80 disabled:opacity-50">
            {creating ? '生成中...' : '一括生成'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
        <table className="w-full text-[12px]">
          <thead><tr className="border-b border-[var(--border)]">
            <th className="px-4 py-3 text-left font-normal text-[var(--muted)] w-24">投稿日</th>
            <th className="px-4 py-3 text-left font-normal text-[var(--muted)] w-20">役割</th>
            <th className="px-4 py-3 text-left font-normal text-[var(--muted)] w-28">テーマ</th>
            {stores.map(s => <th key={s.id} className="px-4 py-3 text-left font-normal text-[var(--muted)]">{s.name}</th>)}
          </tr></thead>
          <tbody>
            {WEEK_ROLES.map((wr, i) => {
              const thu = thursdays[i];
              return (
                <tr key={wr.week} className="border-b border-[var(--accent-light)] last:border-0 hover:bg-[var(--accent-light)]">
                  <td className="px-4 py-3 font-medium">{thu ? `${month}/${thu.getDate()}(木)` : `第${wr.week}木曜`}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{wr.role}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{wr.theme}</td>
                  {stores.map(store => {
                    const proj = projects.find(p => p.store_id === store.id && p.week_number === wr.week);
                    return (
                      <td key={store.id} className="px-4 py-3">
                        {proj ? (
                          <span className={`text-[11px] border border-[var(--border)] px-1.5 py-0.5 rounded ${proj.status === 'completed' ? 'bg-[var(--foreground)] text-white border-[var(--foreground)]' : ''}`}>
                            {statusLabel(proj.status)}
                          </span>
                        ) : <span className="text-[var(--border)]">—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-[var(--accent-light)] border border-[var(--border)] rounded-lg p-4 text-[12px] text-[var(--muted)]">
        <p>第4週: 技術や仕込みは味・価格・体験価値の裏付けとして機能させる</p>
        <p>第5週: 必ずどの利用シーンに適しているかまで言い切る</p>
      </div>
    </div>
  );
}
