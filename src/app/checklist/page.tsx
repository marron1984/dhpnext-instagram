'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStores, getProjects, toggleChecklist, type Project } from '@/lib/store';

export default function ChecklistPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const loadData = useCallback(() => {
    setProjects(getProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const stores = getStores();

  const handleToggle = (projectId: number, checkId: number) => {
    toggleChecklist(projectId, checkId);
    loadData();
  };

  const getProgress = (cl: { checked: boolean }[]) => {
    if (!cl || !cl.length) return 0;
    return Math.round((cl.filter(c => c.checked).length / cl.length) * 100);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">最終チェックリスト</h1>
        <p className="text-gray-500 mt-1">{year}年{month}月 - 投稿前の最終確認</p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-6">
        <h2 className="font-bold mb-3">フォント運用ガイド</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded p-3">
            <h3 className="font-medium text-gray-700 mb-1">高級・和・上質系</h3>
            <p className="text-gray-600">Noto Serif JP / Source Han Serif / 游明朝 / ヒラギノ明朝</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <h3 className="font-medium text-gray-700 mb-1">モダン・洗練系</h3>
            <p className="text-gray-600">Noto Sans JP / Source Han Sans / 游ゴシック / ヒラギノ角ゴ</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-700"><span className="font-bold">重要:</span> Claudeの文字誤りとフォント違和感は発生率が高いため、最終確認は必ず人が行ってください。</p>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">プロジェクトがありません。カレンダーページから一括生成してください。</div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => {
            const progress = getProgress(p.checklist);
            const allDone = progress === 100;
            const store = stores.find(s => s.id === p.store_id);
            return (
              <div key={p.id} className={`bg-white rounded-lg shadow border ${allDone ? 'border-green-300' : 'border-gray-200'}`}>
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold">{store?.name} - W{p.week_number} {p.week_role}</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${allDone ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-sm text-gray-500">{progress}%</span>
                    {allDone && <span className="text-green-600 font-bold text-sm">完了</span>}
                  </div>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-2">
                    {p.checklist.map(item => (
                      <label key={item.id} className="flex items-center gap-2 py-1 cursor-pointer">
                        <input type="checkbox" checked={item.checked} onChange={() => handleToggle(p.id, item.id)} className="w-4 h-4 rounded" />
                        <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.item_text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
