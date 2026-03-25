'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getStores, fetchProjects, fetchProject, updateProject, toggleChecklist, type Store, type Project } from '@/lib/store';
import { TARGET_OPTIONS, APPEAL_AXIS_OPTIONS } from '@/lib/constants';

export default function ProductionPage() {
  const [stores] = useState<Store[]>(getStores());
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<(Project & { store: Store }) | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const loadData = useCallback(async () => {
    setProjects(await fetchProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setSelectedId(null); setDetail(null); }, [year, month]);
  useEffect(() => {
    if (selectedId !== null) {
      fetchProject(selectedId).then(setDetail);
    }
  }, [selectedId, projects]);

  const goToPrevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else { setMonth(m => m - 1); } };
  const goToNextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else { setMonth(m => m + 1); } };
  const goToToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const handleUpdate = async (field: string, value: string) => {
    if (selectedId === null) return;
    await updateProject(selectedId, { [field]: value } as unknown as Partial<Project>);
    loadData();
  };

  const handleToggleCheck = async (checkId: number) => {
    if (selectedId === null) return;
    await toggleChecklist(selectedId, checkId);
    loadData();
  };

  const filtered = storeFilter === 'all' ? projects : projects.filter(p => String(p.store_id) === storeFilter);
  const weekGroups = [...new Set(filtered.map(p => p.week_number))].sort((a, b) => a - b).map(wn => ({
    weekNumber: wn,
    projects: filtered.filter(p => p.week_number === wn),
  }));

  const inputCls = 'w-full border border-[var(--border)] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--muted)]';
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold">{year}年{month}月</h1>
          <p className="text-[13px] text-[var(--muted)]">制作管理</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button onClick={goToPrevMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">←</button>
            {!isCurrentMonth && <button onClick={goToToday} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px]">今月</button>}
            <button onClick={goToNextMonth} className="px-2.5 py-1.5 border border-[var(--border)] rounded-md text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]">→</button>
          </div>
          <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="border border-[var(--border)] rounded-md px-3 py-1.5 text-[13px]">
            <option value="all">全店舗</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="w-64 shrink-0">
          <div className="bg-white border border-[var(--border)] rounded-lg">
            <div className="px-4 py-3 border-b border-[var(--border)]"><h2 className="text-[13px] font-semibold">プロジェクト一覧</h2></div>
            <div className="max-h-[600px] overflow-y-auto">
              {weekGroups.length === 0 ? (
                <p className="p-4 text-[13px] text-[var(--muted)]">プロジェクトがありません</p>
              ) : weekGroups.map(({ weekNumber, projects: wp }) => (
                <div key={weekNumber}>
                  <div className="px-4 py-1.5 bg-[var(--accent-light)] border-b border-[var(--border)] sticky top-0">
                    <span className="text-[11px] font-semibold">W{weekNumber}</span>
                    <span className="text-[11px] text-[var(--muted)] ml-1.5">{wp[0]?.week_role}</span>
                  </div>
                  {wp.map(p => {
                    const store = stores.find(s => s.id === p.store_id);
                    return (
                      <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors border-b border-[var(--accent-light)] ${selectedId === p.id ? 'bg-[var(--foreground)] text-white' : 'hover:bg-[var(--accent-light)]'}`}>
                        <div className="font-medium">{store?.name}</div>
                        <div className={`text-[11px] ${selectedId === p.id ? 'text-white/60' : 'text-[var(--muted)]'}`}>{p.theme}</div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!detail ? (
            <div className="bg-white border border-[var(--border)] rounded-lg p-12 text-center text-[var(--muted)] text-[13px]">左のリストからプロジェクトを選択してください</div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-semibold">{detail.store.name} — W{detail.week_number}</h2>
                    <p className="text-[13px] text-[var(--muted)]">{detail.week_role} / {detail.theme}</p>
                  </div>
                  <select value={detail.status} onChange={e => handleUpdate('status', e.target.value)} className="border border-[var(--border)] rounded-md px-3 py-1.5 text-[13px]">
                    <option value="planning">企画中</option>
                    <option value="in_progress">制作中</option>
                    <option value="review">レビュー中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3 text-[12px]">
                  <div className="bg-[var(--accent-light)] rounded-md p-3"><span className="text-[var(--muted)] block text-[11px] mb-0.5">トーン</span>{detail.store.main_tone}</div>
                  <div className="bg-[var(--accent-light)] rounded-md p-3"><span className="text-[var(--muted)] block text-[11px] mb-0.5">強み</span>{detail.store.strong_values}</div>
                  <div className="bg-[var(--accent-light)] rounded-md p-3"><span className="text-[var(--muted)] block text-[11px] mb-0.5">避ける</span>{detail.store.avoid}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                  <h3 className="text-[13px] font-semibold mb-3">制作パラメータ</h3>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-[var(--muted)] block mb-1">ターゲット</label>
                      <select value={detail.target || ''} onChange={e => handleUpdate('target', e.target.value)} className={inputCls}>
                        <option value="">選択してください</option>
                        {TARGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-[var(--muted)] block mb-1">訴求軸</label>
                      <select value={detail.appeal_axis || ''} onChange={e => handleUpdate('appeal_axis', e.target.value)} className={inputCls}>
                        <option value="">選択してください</option>
                        {APPEAL_AXIS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    {[
                      { label: '動画尺', field: 'video_duration', ph: '' },
                      { label: 'トーン', field: 'tone', ph: '例: 上品、落ち着いた' },
                    ].map(f => (
                      <div key={f.field}>
                        <label className="text-[11px] text-[var(--muted)] block mb-1">{f.label}</label>
                        <input type="text" value={(detail as unknown as Record<string, string>)[f.field] || ''} onChange={e => handleUpdate(f.field, e.target.value)} className={inputCls} placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                  <h3 className="text-[13px] font-semibold mb-3">動画構成案</h3>
                  <textarea value={detail.video_structure} onChange={e => handleUpdate('video_structure', e.target.value)} rows={8} className={textareaCls} placeholder={"1. 冒頭で印象カット\n2. 料理または空間で惹きつける\n3. 利用シーンを想起させる\n4. 店舗の魅力を一言で補足する\n5. 最後に予約または来店導線で締める"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                  <h3 className="text-[13px] font-semibold mb-3">テロップ案</h3>
                  <textarea value={detail.terop_plan} onChange={e => handleUpdate('terop_plan', e.target.value)} rows={5} className={textareaCls} placeholder="テロップは最小限で、読みやすさを優先" />
                </div>
                <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                  <h3 className="text-[13px] font-semibold mb-3">BGM方向性</h3>
                  <textarea value={detail.bgm_direction} onChange={e => handleUpdate('bgm_direction', e.target.value)} rows={5} className={textareaCls} placeholder={`推奨: ${detail.store.music_tone}`} />
                </div>
              </div>

              <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                <h3 className="text-[13px] font-semibold mb-1">キャプション</h3>
                <p className="text-[11px] text-[var(--muted)] mb-2">1行目で惹く → 店の魅力を短く → 利用シーン提案 → 行動導線</p>
                <textarea value={detail.caption} onChange={e => handleUpdate('caption', e.target.value)} rows={6} className={textareaCls} placeholder="キャプションを入力..." />
              </div>

              <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                <h3 className="text-[13px] font-semibold mb-1">ハッシュタグ</h3>
                <p className="text-[11px] text-[var(--muted)] mb-2">ブランド系・エリア系・利用シーン系の3層</p>
                <textarea value={detail.hashtags} onChange={e => handleUpdate('hashtags', e.target.value)} rows={3} className={textareaCls} placeholder="#大嵓埜 #北新地グルメ #会食 #接待..." />
              </div>

              <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                <h3 className="text-[13px] font-semibold mb-3">最終チェックリスト</h3>
                <div className="space-y-1.5">
                  {detail.checklist?.map(item => (
                    <label key={item.id} className="flex items-center gap-2.5 py-0.5 cursor-pointer text-[13px]">
                      <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(item.id)} className="w-3.5 h-3.5 rounded border-[var(--border)] accent-[var(--foreground)]" />
                      <span className={item.checked ? 'line-through text-[var(--muted)]' : ''}>{item.item_text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[var(--border)] rounded-lg p-5">
                <h3 className="text-[13px] font-semibold mb-3">メモ</h3>
                <textarea value={detail.notes} onChange={e => handleUpdate('notes', e.target.value)} rows={4} className={textareaCls} placeholder="自由メモ..." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
