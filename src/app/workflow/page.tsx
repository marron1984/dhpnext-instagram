'use client';

import { useEffect, useState } from 'react';

interface Project {
  id: number;
  store_name: string;
  week_number: number;
  week_role: string;
  theme: string;
  status: string;
  monday_done: number;
  tuesday_done: number;
  wednesday_done: number;
  thursday_done: number;
  draft_status: string;
  checkback_status: string;
  final_status: string;
}

const DAYS = [
  { key: 'monday_done', label: '月曜', desc: 'テーマ決定・素材選定・レポジトリ作成' },
  { key: 'tuesday_done', label: '火曜', desc: 'Claude初回指示・インデックス・初稿生成' },
  { key: 'wednesday_done', label: '水曜', desc: 'CheckBack・修正・再生成' },
  { key: 'thursday_done', label: '木曜', desc: '最終確認・投稿セット完成・21:00投稿' },
] as const;

const MILESTONES = [
  { key: 'draft_status', label: '初稿納品', desc: '素材選定、動画構成、テロップ初稿、キャプション初稿、ハッシュタグ初稿' },
  { key: 'checkback_status', label: 'CheckBack', desc: '誤字、文脈、トーン、導線、店の格に合うかを確認' },
  { key: 'final_status', label: '完成納品', desc: '最終動画、最終キャプション、最終ハッシュタグ、保存先整理' },
] as const;

export default function WorkflowPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  const loadData = () => {
    fetch(`/api/projects?year=${year}&month=${month}`).then(r => r.json()).then(setProjects);
  };

  useEffect(() => { loadData(); }, [year, month]);

  const toggleDay = async (projectId: number, field: string, current: number) => {
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: current ? 0 : 1 }),
    });
    loadData();
  };

  const cycleMilestone = async (projectId: number, field: string, current: string) => {
    const order = ['pending', 'in_progress', 'completed'];
    const next = order[(order.indexOf(current) + 1) % order.length];
    await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: next }),
    });
    loadData();
  };

  const getMilestoneStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in_progress': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  const getMilestoneLabel = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'in_progress': return '進行中';
      default: return '未着手';
    }
  };

  // Group by store
  const grouped = projects.reduce<Record<string, Project[]>>((acc, p) => {
    if (!acc[p.store_name]) acc[p.store_name] = [];
    acc[p.store_name].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">週次ワークフロー</h1>
        <p className="text-gray-500 mt-1">{year}年{month}月 - 月〜木の進行管理</p>
      </div>

      {/* Day schedule reference */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {DAYS.map((d, i) => (
          <div key={i} className="bg-white rounded-lg shadow border border-gray-200 p-4">
            <h3 className="font-bold text-blue-600">{d.label}</h3>
            <p className="text-sm text-gray-600 mt-1">{d.desc}</p>
          </div>
        ))}
      </div>

      {/* Milestone reference */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-8">
        <h2 className="font-bold text-lg mb-3">3段階管理ポイント</h2>
        <div className="grid grid-cols-3 gap-4">
          {MILESTONES.map((m, i) => (
            <div key={i} className="border rounded p-3">
              <h4 className="font-medium text-sm">{m.label}</h4>
              <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          プロジェクトがありません。カレンダーページから一括生成してください。
        </div>
      ) : (
        Object.entries(grouped).map(([storeName, storeProjects]) => (
          <div key={storeName} className="bg-white rounded-lg shadow border border-gray-200 mb-6">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-bold text-lg">{storeName}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">週</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">役割</th>
                    {DAYS.map(d => (
                      <th key={d.key} className="px-4 py-3 text-center font-medium text-gray-600">{d.label}</th>
                    ))}
                    {MILESTONES.map(m => (
                      <th key={m.key} className="px-4 py-3 text-center font-medium text-gray-600">{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {storeProjects.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">W{p.week_number}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{p.week_role}</span>
                      </td>
                      {DAYS.map(d => (
                        <td key={d.key} className="px-4 py-3 text-center">
                          <button
                            onClick={() => toggleDay(p.id, d.key, p[d.key as keyof Project] as number)}
                            className={`w-8 h-8 rounded-full border-2 transition-colors ${
                              p[d.key as keyof Project]
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {p[d.key as keyof Project] ? '✓' : ''}
                          </button>
                        </td>
                      ))}
                      {MILESTONES.map(m => (
                        <td key={m.key} className="px-4 py-3 text-center">
                          <button
                            onClick={() => cycleMilestone(p.id, m.key, p[m.key as keyof Project] as string)}
                            className={`text-xs px-3 py-1 rounded-full ${getMilestoneStyle(p[m.key as keyof Project] as string)}`}
                          >
                            {getMilestoneLabel(p[m.key as keyof Project] as string)}
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
