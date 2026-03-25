'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { WEEK_ROLES, WEEKLY_SCHEDULE } from '@/lib/constants';
import { getStores, fetchProjects, type Store, type Project } from '@/lib/store';

const DAY_LABELS = [
  { key: 'monday_done' as const, label: '月', desc: '初稿提出' },
  { key: 'tuesday_done' as const, label: '火', desc: 'CB' },
  { key: 'wednesday_done' as const, label: '水', desc: '納品' },
  { key: 'thursday_done' as const, label: '木', desc: '投稿' },
];

const MILESTONE_LABELS = [
  { key: 'draft_status' as const, label: '初稿' },
  { key: 'checkback_status' as const, label: 'CB' },
  { key: 'final_status' as const, label: '納品' },
];

function calcPct(p: Project): number {
  let s = 0;
  if (p.monday_done) s++;
  if (p.tuesday_done) s++;
  if (p.wednesday_done) s++;
  if (p.thursday_done) s++;
  if (p.draft_status === 'in_progress') s += 0.5;
  if (p.draft_status === 'completed') s++;
  if (p.checkback_status === 'in_progress') s += 0.5;
  if (p.checkback_status === 'completed') s++;
  if (p.final_status === 'in_progress') s += 0.5;
  if (p.final_status === 'completed') s++;
  return Math.round((s / 7) * 100);
}

function getStep(p: Project): string {
  if (p.final_status === 'completed') return '投稿待ち';
  if (p.final_status === 'in_progress') return '納品中';
  if (p.checkback_status === 'completed') return '納品準備';
  if (p.checkback_status === 'in_progress') return 'CB中';
  if (p.draft_status === 'completed') return 'CB待ち';
  if (p.draft_status === 'in_progress') return '初稿中';
  if (p.monday_done) return '提出済';
  return '未着手';
}

export default function Dashboard() {
  const [stores] = useState<Store[]>(getStores());
  const [projects, setProjects] = useState<Project[]>([]);
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const loadData = useCallback(async () => {
    setProjects(await fetchProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  const goToPrevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else { setMonth(m => m - 1); } };
  const goToNextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else { setMonth(m => m + 1); } };
  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const mColor = (s: string) => s === 'completed' ? 'bg-[var(--foreground)]' : s === 'in_progress' ? 'bg-[var(--muted)]' : 'bg-[var(--border)]';

  const weekNumbers = [...new Set(projects.map(p => p.week_number))].sort((a, b) => a - b);
  const weekStats = weekNumbers.map(wn => {
    const wp = projects.filter(p => p.week_number === wn);
    const avgPct = wp.length ? Math.round(wp.reduce((sum, p) => sum + calcPct(p), 0) / wp.length) : 0;
    const allDone = wp.every(p => p.status === 'completed');
    const weekRole = WEEK_ROLES.find(wr => wr.week === wn);
    return { weekNumber: wn, projects: wp, avgPct, allDone, weekRole };
  });

  const overallPct = projects.length ? Math.round(projects.reduce((sum, p) => sum + calcPct(p), 0) / projects.length) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold">{year}年{month}月</h1>
          <p className="text-[13px] text-[var(--muted)]">週次進捗管理</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={goToPrevMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">←</button>
          {!isCurrentMonth && <button onClick={goToToday} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px]">今月</button>}
          <button onClick={goToNextMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">→</button>
        </div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-lg p-5 mb-6">
        <div className="flex items-end justify-between mb-3">
          <span className="text-[13px] text-[var(--muted)]">全体進捗</span>
          <span className="text-2xl font-semibold tabular-nums">{overallPct}%</span>
        </div>
        <div className="w-full bg-[var(--accent-light)] rounded-full h-1.5">
          <div className="h-1.5 rounded-full bg-[var(--foreground)] transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="flex gap-5 mt-3 text-[12px] text-[var(--muted)]">
          <span>{projects.length} 件</span>
          <span>{projects.filter(p => p.status === 'completed').length} 完了</span>
          <span>{projects.filter(p => p.status === 'review').length} レビュー</span>
          <span>{projects.filter(p => p.status === 'in_progress').length} 制作中</span>
        </div>
      </div>

      {weekStats.length === 0 ? (
        <div className="bg-white border border-[var(--border)] rounded-lg p-12 text-center text-[var(--muted)] text-[13px] mb-6">
          プロジェクトがありません。<Link href="/calendar" className="underline ml-1">カレンダーから作成</Link>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {weekStats.map(({ weekNumber, projects: wp, avgPct, allDone, weekRole }) => (
            <div key={weekNumber} className="bg-white border border-[var(--border)] rounded-lg">
              <div className="px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold">W{weekNumber}</span>
                  {weekRole && <span className="text-[12px] text-[var(--muted)]">{weekRole.role} / {weekRole.theme}</span>}
                  {allDone && <span className="text-[11px] text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">完了</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-[var(--accent-light)] rounded-full h-1">
                    <div className="h-1 rounded-full bg-[var(--foreground)] transition-all" style={{ width: `${avgPct}%` }} />
                  </div>
                  <span className="text-[13px] font-medium tabular-nums w-8 text-right">{avgPct}%</span>
                </div>
              </div>
              <div className="px-5 pb-2 flex items-center gap-1 text-[11px]">
                {DAY_LABELS.map((d, i) => {
                  const allChecked = wp.every(p => p[d.key]);
                  const someChecked = wp.some(p => p[d.key]);
                  return (
                    <div key={d.key} className="flex items-center gap-1">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${allChecked ? 'bg-[var(--foreground)] text-white' : someChecked ? 'bg-[var(--muted)] text-white' : 'bg-[var(--accent-light)] text-[var(--muted)]'}`}>{d.label}</span>
                      <span className={`${allChecked ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>{d.desc}</span>
                      {i < DAY_LABELS.length - 1 && <div className={`w-4 h-px mx-0.5 ${allChecked ? 'bg-[var(--foreground)]' : 'bg-[var(--border)]'}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 pb-4 pt-1">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="text-[var(--muted)] border-b border-[var(--border)]">
                      <th className="text-left py-1.5 font-normal w-24">店舗</th>
                      <th className="text-left py-1.5 font-normal w-16">状態</th>
                      {DAY_LABELS.map(d => <th key={d.key} className="text-center py-1.5 font-normal w-8">{d.label}</th>)}
                      <th className="w-2" />
                      {MILESTONE_LABELS.map(m => <th key={m.key} className="text-center py-1.5 font-normal w-8">{m.label}</th>)}
                      <th className="text-right py-1.5 font-normal w-20">進捗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wp.map(p => {
                      const store = stores.find(s => s.id === p.store_id);
                      const pct = calcPct(p);
                      return (
                        <tr key={p.id} className="border-b border-[var(--accent-light)] last:border-0">
                          <td className="py-2 font-medium">{store?.name}</td>
                          <td className="py-2 text-[var(--muted)]">{getStep(p)}</td>
                          {DAY_LABELS.map(d => (
                            <td key={d.key} className="text-center py-2">
                              <span className={`inline-block w-4 h-4 rounded-full text-[9px] leading-4 text-center ${p[d.key] ? 'bg-[var(--foreground)] text-white' : 'bg-[var(--accent-light)] text-[var(--muted)]'}`}>{p[d.key] ? '✓' : ''}</span>
                            </td>
                          ))}
                          <td />
                          {MILESTONE_LABELS.map(m => (
                            <td key={m.key} className="text-center py-2">
                              <span className={`inline-block w-2 h-2 rounded-full ${mColor(p[m.key])}`} />
                            </td>
                          ))}
                          <td className="text-right py-2">
                            <div className="flex items-center gap-1.5 justify-end">
                              <div className="w-12 bg-[var(--accent-light)] rounded-full h-1">
                                <div className="h-1 rounded-full bg-[var(--foreground)]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="tabular-nums text-[var(--muted)] w-7 text-right">{pct}%</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[var(--border)] rounded-lg">
          <div className="px-5 py-3 border-b border-[var(--border)]"><h2 className="text-[13px] font-semibold">月内投稿設計</h2></div>
          <div className="p-4">
            {WEEK_ROLES.map(wr => (
              <div key={wr.week} className="flex items-start gap-3 py-2 border-b border-[var(--accent-light)] last:border-0 text-[12px]">
                <span className="text-[var(--muted)] w-6 shrink-0">W{wr.week}</span>
                <span className="font-medium w-16 shrink-0">{wr.role}</span>
                <span className="text-[var(--muted)]">{wr.purpose}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-[var(--border)] rounded-lg">
          <div className="px-5 py-3 border-b border-[var(--border)] flex justify-between items-center">
            <h2 className="text-[13px] font-semibold">週次スケジュール</h2>
            <Link href="/workflow" className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]">ワークフロー →</Link>
          </div>
          <div className="p-4">
            {WEEKLY_SCHEDULE.map((s, i) => (
              <div key={i} className="flex gap-3 py-1.5 text-[12px]">
                <span className="font-medium w-8 shrink-0">{s.day}</span>
                <span className="text-[var(--muted)]">{s.tasks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
