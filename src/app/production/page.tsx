'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getStores, getProjects, getProject, updateProject, toggleChecklist, type Store, type Project } from '@/lib/store';

export default function ProductionPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<(Project & { store: Store }) | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const loadData = useCallback(() => {
    setStores(getStores());
    setProjects(getProjects({ year, month }));
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  // 月が変わったら選択をリセット
  useEffect(() => {
    setSelectedId(null);
    setDetail(null);
  }, [year, month]);

  useEffect(() => {
    if (selectedId !== null) setDetail(getProject(selectedId));
  }, [selectedId, projects]);

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

  const handleUpdate = (field: string, value: string) => {
    if (selectedId === null) return;
    updateProject(selectedId, { [field]: value } as unknown as Partial<Project>);
    loadData();
  };

  const handleToggleCheck = (checkId: number) => {
    if (selectedId === null) return;
    toggleChecklist(selectedId, checkId);
    loadData();
  };

  const filtered = storeFilter === 'all' ? projects : projects.filter(p => String(p.store_id) === storeFilter);

  // 週番号でグルーピング・ソート
  const weekGroups = [...new Set(filtered.map(p => p.week_number))].sort((a, b) => a - b).map(wn => ({
    weekNumber: wn,
    projects: filtered.filter(p => p.week_number === wn),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">制作管理</h1>
          <p className="text-gray-500 mt-1">{year}年{month}月 - 動画構成・キャプション・ハッシュタグ・チェックリスト</p>
        </div>
        <div className="flex items-center gap-3">
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
          <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">全店舗</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200"><h2 className="font-bold">プロジェクト一覧</h2></div>
            <div className="max-h-[600px] overflow-y-auto">
              {weekGroups.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">プロジェクトがありません</p>
              ) : weekGroups.map(({ weekNumber, projects: wp }) => (
                <div key={weekNumber}>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                    <span className="text-xs font-bold text-blue-600">W{weekNumber}</span>
                    <span className="text-xs text-gray-500 ml-2">{wp[0]?.week_role}</span>
                  </div>
                  {wp.map(p => {
                    const store = stores.find(s => s.id === p.store_id);
                    return (
                      <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedId === p.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}>
                        <div className="font-medium text-sm">{store?.name}</div>
                        <div className="text-xs text-gray-500">{p.theme}</div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {!detail ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500">左のリストからプロジェクトを選択してください</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{detail.store.name} - W{detail.week_number}</h2>
                    <p className="text-gray-500">{detail.week_role} / {detail.theme}</p>
                  </div>
                  <select value={detail.status} onChange={e => handleUpdate('status', e.target.value)} className="border rounded px-3 py-2 text-sm">
                    <option value="planning">企画中</option>
                    <option value="in_progress">制作中</option>
                    <option value="review">レビュー中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-3"><span className="text-gray-500 block text-xs">メイントーン</span>{detail.store.main_tone}</div>
                  <div className="bg-gray-50 rounded p-3"><span className="text-gray-500 block text-xs">強く出す価値</span>{detail.store.strong_values}</div>
                  <div className="bg-gray-50 rounded p-3"><span className="text-gray-500 block text-xs">避けるべきこと</span><span className="text-red-600">{detail.store.avoid}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">制作パラメータ</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'ターゲット', field: 'target', ph: '例: 30-40代 接待利用' },
                      { label: '訴求軸', field: 'appeal_axis', ph: '例: 季節感、特別感' },
                      { label: '動画尺', field: 'video_duration', ph: '' },
                      { label: 'トーン', field: 'tone', ph: '例: 上品、落ち着いた' },
                    ].map(f => (
                      <div key={f.field}>
                        <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                        <input type="text" value={(detail as unknown as Record<string, string>)[f.field] || ''} onChange={e => handleUpdate(f.field, e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">動画構成案</h3>
                  <textarea value={detail.video_structure} onChange={e => handleUpdate('video_structure', e.target.value)} rows={8} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder={"1. 冒頭で印象カット\n2. 料理または空間で惹きつける\n3. 利用シーンを想起させる\n4. 店舗の魅力を一言で補足する\n5. 最後に予約または来店導線で締める"} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">テロップ案</h3>
                  <textarea value={detail.terop_plan} onChange={e => handleUpdate('terop_plan', e.target.value)} rows={5} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="テロップは最小限で、読みやすさを優先" />
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">BGM方向性</h3>
                  <textarea value={detail.bgm_direction} onChange={e => handleUpdate('bgm_direction', e.target.value)} rows={5} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder={`推奨: ${detail.store.music_tone}`} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">キャプション</h3>
                <p className="text-xs text-gray-500 mb-2">1行目で惹く → 店の魅力を短く → 利用シーン提案 → 行動導線</p>
                <textarea value={detail.caption} onChange={e => handleUpdate('caption', e.target.value)} rows={6} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="キャプションを入力..." />
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">ハッシュタグ</h3>
                <p className="text-xs text-gray-500 mb-2">ブランド系・エリア系・利用シーン系の3層</p>
                <textarea value={detail.hashtags} onChange={e => handleUpdate('hashtags', e.target.value)} rows={3} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="#大嵓埜 #北新地グルメ #会食 #接待..." />
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">最終チェックリスト</h3>
                <div className="space-y-2">
                  {detail.checklist?.map(item => (
                    <label key={item.id} className="flex items-center gap-3 py-1 cursor-pointer">
                      <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(item.id)} className="w-4 h-4 rounded" />
                      <span className={item.checked ? 'line-through text-gray-400' : 'text-gray-700'}>{item.item_text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">メモ</h3>
                <textarea value={detail.notes} onChange={e => handleUpdate('notes', e.target.value)} rows={4} className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="自由メモ..." />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
