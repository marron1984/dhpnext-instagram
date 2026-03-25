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

  const goToPrevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else { setMonth(m => m - 1); }
  };
  const goToNextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else { setMonth(m => m + 1); }
  };
  const goToToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  };
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

  const getMilestoneStyle = (s: string) => {
    switch (s) { case 'completed': return 'bg-green-500 text-white'; case 'in_progress': return 'bg-blue-500 text-white'; default: return 'bg-gray-200 text-gray-600'; }
  };
  const getMilestoneLabel = (s: string) => {
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">週次ワークフロー</h1>
          <p className="text-gray-500 mt-1">{year}年{month}月 - 月〜木の進行管理</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevMonth} className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            ← 前月
          </button>
          {!isCurrentMonth && (
            <button onClick={goToToday} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              今月
            </button>
          )}
          <button onClick={goToNextMonth} className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            翌月 →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {DAYS.map(d => (
          <div key={d.key} className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <h3 className="font-bold text-blue-600">{d.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{d.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-8">
        <h2 className="font-bold text-lg mb-3">3段階管理ポイント</h2>
        <div className="grid grid-cols-3 gap-4">
          {MILESTONES.map(m => (
            <div key={m.key} className="border rounded p-3">
              <h4 className="font-medium text-sm">{m.label}</h4>
              <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">プロジェクトがありません。カレンダーページから一括生成してください。</div>
      ) : (
        Object.entries(grouped).map(([storeName, storeProjects]) => (
          <div key={storeName} className="bg-white rounded-lg shadow border border-gray-200 mb-6">
            <div className="p-5 border-b border-gray-200"><h2 className="font-bold text-lg">{storeName}</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">週</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">役割</th>
                  {DAYS.map(d => <th key={d.key} className="px-4 py-3 text-center font-medium text-gray-600">{d.label}</th>)}
                  {MILESTONES.map(m => <th key={m.key} className="px-4 py-3 text-center font-medium text-gray-600">{m.label}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {storeProjects.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">W{p.week_number}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{p.week_role}</span></td>
                      {DAYS.map(d => (
                        <td key={d.key} className="px-4 py-3 text-center">
                          <button onClick={() => toggleDay(p.id, d.key)} className={`w-8 h-8 rounded-full border-2 transition-colors ${p[d.key] ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-400'}`}>
                            {p[d.key] ? '✓' : ''}
                          </button>
                        </td>
                      ))}
                      {MILESTONES.map(m => (
                        <td key={m.key} className="px-4 py-3 text-center">
                          <button onClick={() => cycleMilestone(p.id, m.key)} className={`text-xs px-3 py-1 rounded-full ${getMilestoneStyle(p[m.key])}`}>
                            {getMilestoneLabel(p[m.key])}
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
