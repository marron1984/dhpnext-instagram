'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WEEK_ROLES, WEEKLY_SCHEDULE } from '@/lib/constants';
import { getStores, getProjects, type Store, type Project } from '@/lib/store';

const DAY_LABELS = [
  { key: 'monday_done' as const, label: '月' },
  { key: 'tuesday_done' as const, label: '火' },
  { key: 'wednesday_done' as const, label: '水' },
  { key: 'thursday_done' as const, label: '木' },
];

const MILESTONE_LABELS = [
  { key: 'draft_status' as const, label: '初稿' },
  { key: 'checkback_status' as const, label: 'CB' },
  { key: 'final_status' as const, label: '納品' },
];

function calcProgressPercent(p: Project): number {
  // 日次チェック4項目 + マイルストーン3項目 = 7項目で進捗率を算出
  let score = 0;
  if (p.monday_done) score++;
  if (p.tuesday_done) score++;
  if (p.wednesday_done) score++;
  if (p.thursday_done) score++;
  if (p.draft_status === 'in_progress') score += 0.5;
  if (p.draft_status === 'completed') score++;
  if (p.checkback_status === 'in_progress') score += 0.5;
  if (p.checkback_status === 'completed') score++;
  if (p.final_status === 'in_progress') score += 0.5;
  if (p.final_status === 'completed') score++;
  return Math.round((score / 7) * 100);
}

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
  const getMilestoneColor = (s: string) => {
    switch (s) { case 'completed': return 'bg-green-500'; case 'in_progress': return 'bg-blue-500'; default: return 'bg-gray-300'; }
  };

  // 店舗ごとの集計
  const storeStats = stores.map(store => {
    const sp = projects.filter(p => p.store_id === store.id);
    const done = sp.filter(p => p.status === 'completed').length;
    const inReview = sp.filter(p => p.status === 'review').length;
    const inProgress = sp.filter(p => p.status === 'in_progress').length;
    const avgProgress = sp.length ? Math.round(sp.reduce((sum, p) => sum + calcProgressPercent(p), 0) / sp.length) : 0;
    return { store, projects: sp, done, inReview, inProgress, avgProgress };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">{year}年{month}月の進捗状況</p>
      </div>

      {/* 全体サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 text-center">
          <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
          <p className="text-sm text-gray-500 mt-1">総プロジェクト</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 text-center">
          <p className="text-3xl font-bold text-green-600">{projects.filter(p => p.status === 'completed').length}</p>
          <p className="text-sm text-gray-500 mt-1">完了</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 text-center">
          <p className="text-3xl font-bold text-yellow-600">{projects.filter(p => p.status === 'review').length}</p>
          <p className="text-sm text-gray-500 mt-1">レビュー中</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 text-center">
          <p className="text-3xl font-bold text-blue-600">{projects.filter(p => p.status === 'in_progress').length}</p>
          <p className="text-sm text-gray-500 mt-1">制作中</p>
        </div>
      </div>

      {/* 店舗別 詳細進捗カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {storeStats.map(({ store, projects: sp, done, inReview, inProgress, avgProgress }) => (
          <div key={store.id} className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{store.name}</h3>
                <p className="text-xs text-gray-500">{store.main_tone}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{avgProgress}%</p>
                <p className="text-xs text-gray-500">平均進捗</p>
              </div>
            </div>
            <div className="p-5">
              {/* ステータス内訳バー */}
              <div className="flex gap-3 text-xs mb-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />完了 {done}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />レビュー {inReview}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />制作中 {inProgress}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />企画中 {sp.length - done - inReview - inProgress}</span>
              </div>
              {sp.length > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    {done > 0 && <div className="bg-green-500" style={{ width: `${(done / sp.length) * 100}%` }} />}
                    {inReview > 0 && <div className="bg-yellow-500" style={{ width: `${(inReview / sp.length) * 100}%` }} />}
                    {inProgress > 0 && <div className="bg-blue-500" style={{ width: `${(inProgress / sp.length) * 100}%` }} />}
                  </div>
                </div>
              )}
              {/* 週別の詳細テーブル */}
              {sp.length > 0 && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500">
                      <th className="text-left py-1 font-medium">週</th>
                      <th className="text-left py-1 font-medium">役割</th>
                      {DAY_LABELS.map(d => <th key={d.key} className="text-center py-1 font-medium w-8">{d.label}</th>)}
                      <th className="w-px py-1"><div className="w-px h-4 bg-gray-200 mx-auto" /></th>
                      {MILESTONE_LABELS.map(m => <th key={m.key} className="text-center py-1 font-medium w-10">{m.label}</th>)}
                      <th className="text-right py-1 font-medium w-12">進捗</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sp.map(p => {
                      const pct = calcProgressPercent(p);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="py-1.5 font-medium">W{p.week_number}</td>
                          <td className="py-1.5"><span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${getStatusColor(p.status)}`}>{p.week_role}</span></td>
                          {DAY_LABELS.map(d => (
                            <td key={d.key} className="text-center py-1.5">
                              <span className={`inline-block w-5 h-5 rounded-full text-[10px] leading-5 ${p[d.key] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {p[d.key] ? '✓' : '-'}
                              </span>
                            </td>
                          ))}
                          <td className="py-1.5"><div className="w-px h-4 bg-gray-200 mx-auto" /></td>
                          {MILESTONE_LABELS.map(m => (
                            <td key={m.key} className="text-center py-1.5">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${getMilestoneColor(p[m.key])}`} title={p[m.key] === 'completed' ? '完了' : p[m.key] === 'in_progress' ? '進行中' : '未着手'} />
                            </td>
                          ))}
                          <td className="text-right py-1.5 font-mono font-medium text-gray-700">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {sp.length === 0 && <p className="text-gray-400 text-center text-sm py-2">プロジェクトなし</p>}
            </div>
          </div>
        ))}
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
            <h2 className="font-bold text-lg">凡例</h2>
            <Link href="/workflow" className="text-sm text-blue-600 hover:underline">ワークフロー →</Link>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">日次チェック（月〜木）</h4>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded-full bg-green-500 text-white text-[10px] text-center leading-5">✓</span>完了</span>
                <span className="flex items-center gap-1"><span className="inline-block w-5 h-5 rounded-full bg-gray-100 text-gray-400 text-[10px] text-center leading-5">-</span>未着手</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">マイルストーン（初稿・CB・納品）</h4>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500" />完了</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />進行中</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-300" />未着手</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">ステータスバー</h4>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />完了</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />レビュー</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />制作中</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />企画中</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
