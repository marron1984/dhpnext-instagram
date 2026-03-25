'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WEEK_ROLES, WEEKLY_SCHEDULE } from '@/lib/constants';
import { getStores, getProjects, type Store, type Project } from '@/lib/store';

const DAY_LABELS = [
  { key: 'monday_done' as const, label: '月', desc: '初稿提出' },
  { key: 'tuesday_done' as const, label: '火', desc: 'チェックバック' },
  { key: 'wednesday_done' as const, label: '水', desc: '納品' },
  { key: 'thursday_done' as const, label: '木', desc: '投稿' },
];

const MILESTONE_LABELS = [
  { key: 'draft_status' as const, label: '初稿', step: 1 },
  { key: 'checkback_status' as const, label: 'CB', step: 2 },
  { key: 'final_status' as const, label: '納品', step: 3 },
];

function calcProgressPercent(p: Project): number {
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

function getCurrentStep(p: Project): string {
  if (p.final_status === 'completed') return '投稿待ち';
  if (p.final_status === 'in_progress') return '納品作業中';
  if (p.checkback_status === 'completed') return '納品準備';
  if (p.checkback_status === 'in_progress') return 'CB中';
  if (p.draft_status === 'completed') return 'CB待ち';
  if (p.draft_status === 'in_progress') return '初稿作成中';
  if (p.monday_done) return '初稿提出済';
  return '未着手';
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
  const getMilestoneColor = (s: string) => {
    switch (s) { case 'completed': return 'bg-green-500'; case 'in_progress': return 'bg-blue-500'; default: return 'bg-gray-300'; }
  };
  const getProgressBarColor = (pct: number) => {
    if (pct === 100) return 'bg-green-500';
    if (pct >= 70) return 'bg-blue-500';
    if (pct >= 30) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  // 週番号でグルーピング
  const weekNumbers = [...new Set(projects.map(p => p.week_number))].sort((a, b) => a - b);

  const weekStats = weekNumbers.map(wn => {
    const wp = projects.filter(p => p.week_number === wn);
    const avgPct = wp.length ? Math.round(wp.reduce((sum, p) => sum + calcProgressPercent(p), 0) / wp.length) : 0;
    const allDone = wp.every(p => p.status === 'completed');
    const weekRole = WEEK_ROLES.find(wr => wr.week === wn);
    return { weekNumber: wn, projects: wp, avgPct, allDone, weekRole };
  });

  // 全体の週次進捗
  const overallPct = projects.length ? Math.round(projects.reduce((sum, p) => sum + calcProgressPercent(p), 0) / projects.length) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">{year}年{month}月の週次進捗管理</p>
      </div>

      {/* 全体進捗バー */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">月間全体進捗</h2>
          <span className="text-2xl font-bold text-blue-600">{overallPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div className={`h-3 rounded-full transition-all ${getProgressBarColor(overallPct)}`} style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex gap-6 text-xs text-gray-500">
          <span>全 {projects.length} 件</span>
          <span className="text-green-600 font-medium">{projects.filter(p => p.status === 'completed').length} 完了</span>
          <span className="text-yellow-600 font-medium">{projects.filter(p => p.status === 'review').length} レビュー中</span>
          <span className="text-blue-600 font-medium">{projects.filter(p => p.status === 'in_progress').length} 制作中</span>
          <span className="text-gray-400">{projects.filter(p => p.status === 'planning').length} 企画中</span>
        </div>
      </div>

      {/* 週別進捗カード */}
      {weekStats.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500 mb-8">
          プロジェクトがありません。<Link href="/calendar" className="text-blue-600 hover:underline ml-1">カレンダーから作成</Link>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {weekStats.map(({ weekNumber, projects: wp, avgPct, allDone, weekRole }) => (
            <div key={weekNumber} className={`bg-white rounded-lg shadow border ${allDone ? 'border-green-300' : 'border-gray-200'}`}>
              {/* 週ヘッダー */}
              <div className="p-5 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${allDone ? 'text-green-600' : 'text-gray-900'}`}>
                      第{weekNumber}週
                    </span>
                    {weekRole && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{weekRole.role}</span>
                    )}
                    {weekRole && (
                      <span className="text-xs text-gray-500">{weekRole.theme}</span>
                    )}
                    {allDone && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">全店完了</span>
                    )}
                  </div>
                  <span className={`text-xl font-bold ${allDone ? 'text-green-600' : 'text-blue-600'}`}>{avgPct}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${getProgressBarColor(avgPct)}`} style={{ width: `${avgPct}%` }} />
                </div>
              </div>

              {/* 週スケジュールステップ */}
              <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between text-xs">
                  {DAY_LABELS.map((d, i) => {
                    const allChecked = wp.every(p => p[d.key]);
                    const someChecked = wp.some(p => p[d.key]);
                    return (
                      <div key={d.key} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${allChecked ? 'bg-green-500 text-white' : someChecked ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {d.label}
                          </span>
                          <span className={`${allChecked ? 'text-green-700 font-medium' : someChecked ? 'text-blue-700' : 'text-gray-400'}`}>
                            {d.desc}
                          </span>
                        </div>
                        {i < DAY_LABELS.length - 1 && (
                          <div className={`w-8 h-0.5 mx-1 ${allChecked ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 店舗ごと詳細 */}
              <div className="p-5 pt-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-100">
                      <th className="text-left py-2 font-medium w-24">店舗</th>
                      <th className="text-left py-2 font-medium w-20">現在地</th>
                      {DAY_LABELS.map(d => <th key={d.key} className="text-center py-2 font-medium w-10">{d.label}</th>)}
                      <th className="w-px py-2" />
                      {MILESTONE_LABELS.map(m => <th key={m.key} className="text-center py-2 font-medium w-10">{m.label}</th>)}
                      <th className="py-2 font-medium w-28 text-right">進捗</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {wp.map(p => {
                      const store = stores.find(s => s.id === p.store_id);
                      const pct = calcProgressPercent(p);
                      const step = getCurrentStep(p);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="py-2.5 font-medium text-gray-900">{store?.name}</td>
                          <td className="py-2.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${getStatusColor(p.status)}`}>{step}</span>
                          </td>
                          {DAY_LABELS.map(d => (
                            <td key={d.key} className="text-center py-2.5">
                              <span className={`inline-block w-5 h-5 rounded-full text-[10px] leading-5 ${p[d.key] ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                {p[d.key] ? '✓' : '-'}
                              </span>
                            </td>
                          ))}
                          <td className="py-2.5"><div className="w-px h-4 bg-gray-200 mx-auto" /></td>
                          {MILESTONE_LABELS.map(m => (
                            <td key={m.key} className="text-center py-2.5">
                              <span className={`inline-block w-3 h-3 rounded-full ${getMilestoneColor(p[m.key])}`} title={p[m.key] === 'completed' ? '完了' : p[m.key] === 'in_progress' ? '進行中' : '未着手'} />
                            </td>
                          ))}
                          <td className="py-2.5">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div className={`h-1.5 rounded-full ${getProgressBarColor(pct)}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="font-mono font-medium text-gray-700 w-8 text-right">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 下部: 月内投稿設計 + 週次スケジュール */}
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
              <h4 className="text-sm font-medium text-gray-700 mb-2">週ステップ（ヘッダー丸印）</h4>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-green-500" />全店完了</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-blue-500" />一部完了</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded-full bg-gray-200" />未着手</span>
              </div>
            </div>
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
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-green-500" />完了</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-blue-500" />進行中</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-gray-300" />未着手</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
