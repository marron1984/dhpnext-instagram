'use client';

import { useEffect, useState, useCallback } from 'react';
import { WEEK_ROLES } from '@/lib/constants';
import { getStores, getProjects, createProject, type Store, type Project } from '@/lib/store';

export default function CalendarPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(() => {
    setStores(getStores());
    setProjects(getProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const generateMonthProjects = () => {
    setCreating(true);
    // 既存プロジェクトをlocalStorageから直接取得（stateは古い可能性がある）
    const currentProjects = getProjects({ year, month });
    const allStores = getStores();
    let count = 0;
    for (const store of allStores) {
      for (const wr of WEEK_ROLES) {
        const exists = currentProjects.find(p => p.store_id === store.id && p.week_number === wr.week);
        if (!exists) {
          createProject({ store_id: store.id, year, month, week_number: wr.week, week_role: wr.role, theme: wr.theme });
          count++;
        }
      }
    }
    // state更新を確実にレンダリングさせるためsetTimeoutで分離
    setTimeout(() => {
      loadData();
      setCreating(false);
      if (count > 0) alert(`${count}件のプロジェクトを生成しました`);
      else alert('すべてのプロジェクトは既に存在します');
    }, 0);
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = { completed: 'bg-green-100 text-green-800', in_progress: 'bg-blue-100 text-blue-800', review: 'bg-yellow-100 text-yellow-800', planning: 'bg-gray-100 text-gray-800' };
    const labels: Record<string, string> = { completed: '完了', in_progress: '制作中', review: 'レビュー', planning: '企画' };
    return <span className={`text-xs px-2 py-0.5 rounded ${colors[status] || colors.planning}`}>{labels[status] || '未着手'}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">月間カレンダー</h1>
          <p className="text-gray-500 mt-1">毎週木曜 21:00 投稿スケジュール</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded px-3 py-2 text-sm">
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}年</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded px-3 py-2 text-sm">
            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}月</option>)}
          </select>
          <button onClick={generateMonthProjects} disabled={creating} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
            {creating ? '生成中...' : '月間プロジェクト一括生成'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-28">投稿日</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-24">役割</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">テーマ</th>
            {stores.map(s => <th key={s.id} className="px-4 py-3 text-left font-medium text-gray-600">{s.name}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-gray-200">
            {WEEK_ROLES.map((wr, i) => {
              const thu = thursdays[i];
              return (
                <tr key={wr.week} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium">{thu ? `${month}/${thu.getDate()}(木)` : `第${wr.week}木曜`}</td>
                  <td className="px-4 py-4"><span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{wr.role}</span></td>
                  <td className="px-4 py-4 text-gray-600">{wr.theme}</td>
                  {stores.map(store => {
                    const proj = projects.find(p => p.store_id === store.id && p.week_number === wr.week);
                    return (
                      <td key={store.id} className="px-4 py-4">
                        {proj ? <div>{getStatusBadge(proj.status)}<p className="text-xs text-gray-500 mt-1">{proj.theme}</p></div> : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-bold text-amber-800 mb-2">月内投稿設計の補足</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>第4週は「ただの仕込み動画」にしない → 技術や仕込みは味・価格・体験価値の裏付けとして機能させる</li>
          <li>第5週は「ただ綺麗」では弱い → 必ずどの利用シーンに適しているかまで言い切る</li>
        </ul>
      </div>
    </div>
  );
}
