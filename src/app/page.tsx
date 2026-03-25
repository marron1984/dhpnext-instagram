'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WEEK_ROLES, WEEKLY_SCHEDULE } from '@/lib/constants';
import { getStores, getProjects, type Store, type Project } from '@/lib/store';

export default function Dashboard() {
  const [stores, setStores] = useState<Store[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  useEffect(() => {
    setStores(getStores());
    setProjects(getProjects({ year, month }));
  }, [year, month]);

  const getStatusColor = (s: string) => {
    switch (s) { case 'completed': return 'bg-green-100 text-green-800'; case 'in_progress': return 'bg-blue-100 text-blue-800'; case 'review': return 'bg-yellow-100 text-yellow-800'; default: return 'bg-gray-100 text-gray-800'; }
  };
  const getStatusLabel = (s: string) => {
    switch (s) { case 'completed': return '完了'; case 'in_progress': return '制作中'; case 'review': return 'レビュー中'; case 'planning': return '企画中'; default: return '未着手'; }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">{year}年{month}月の進捗状況</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stores.map(store => {
          const sp = projects.filter(p => p.store_id === store.id);
          const done = sp.filter(p => p.status === 'completed').length;
          return (
            <div key={store.id} className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <h3 className="font-bold text-lg mb-2">{store.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{store.main_tone}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">進捗: {done}/{sp.length}</span>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${sp.length ? (done / sp.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
        <div className="p-5 border-b border-gray-200"><h2 className="font-bold text-lg">月内投稿設計</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">週</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">役割</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">テーマ</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">目的</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200">
              {WEEK_ROLES.map(wr => (
                <tr key={wr.week}>
                  <td className="px-4 py-3 font-medium">第{wr.week}木曜</td>
                  <td className="px-4 py-3"><span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{wr.role}</span></td>
                  <td className="px-4 py-3">{wr.theme}</td>
                  <td className="px-4 py-3 text-gray-600">{wr.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200"><h2 className="font-bold text-lg">週次スケジュール</h2></div>
          <div className="p-5 space-y-3">
            {WEEKLY_SCHEDULE.map((s, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="font-bold text-blue-600 w-12 shrink-0">{s.day}</span>
                <span className="text-gray-700">{s.tasks}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-lg">今月のプロジェクト</h2>
            <Link href="/production" className="text-sm text-blue-600 hover:underline">すべて見る →</Link>
          </div>
          <div className="p-5">
            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">プロジェクトがありません。<Link href="/calendar" className="text-blue-600 hover:underline ml-1">カレンダーから作成</Link></p>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 8).map(p => {
                  const store = stores.find(s => s.id === p.store_id);
                  return (
                    <Link key={p.id} href="/production" className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50">
                      <div>
                        <span className="font-medium">{store?.name}</span>
                        <span className="text-gray-400 mx-2">|</span>
                        <span className="text-gray-600 text-sm">W{p.week_number} {p.week_role}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(p.status)}`}>{getStatusLabel(p.status)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
