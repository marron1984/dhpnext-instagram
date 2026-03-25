'use client';

import { useEffect, useState } from 'react';

interface Store {
  id: number;
  name: string;
  slug: string;
  main_tone: string;
  strong_values: string;
  avoid: string;
  music_tone: string;
}

interface Project {
  id: number;
  store_id: number;
  store_name: string;
  store_slug: string;
  store_tone: string;
  strong_values: string;
  avoid: string;
  music_tone: string;
  week_number: number;
  week_role: string;
  theme: string;
  target: string;
  appeal_axis: string;
  video_duration: string;
  tone: string;
  status: string;
  caption: string;
  hashtags: string;
  bgm_direction: string;
  video_structure: string;
  terop_plan: string;
  notes: string;
  checklist: { id: number; item_text: string; checked: number }[];
}

export default function ProductionPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<Project | null>(null);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [stores, setStores] = useState<Store[]>([]);
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores);
    loadProjects();
  }, [year, month]);

  const loadProjects = () => {
    fetch(`/api/projects?year=${year}&month=${month}`).then(r => r.json()).then(setProjects);
  };

  useEffect(() => {
    if (selectedId) {
      fetch(`/api/projects/${selectedId}`).then(r => r.json()).then(setDetail);
    }
  }, [selectedId]);

  const updateField = async (field: string, value: string) => {
    if (!selectedId) return;
    await fetch(`/api/projects/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    // Refresh detail
    const res = await fetch(`/api/projects/${selectedId}`);
    setDetail(await res.json());
    loadProjects();
  };

  const toggleCheck = async (checkId: number, current: boolean) => {
    await fetch('/api/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: checkId, checked: !current }),
    });
    if (selectedId) {
      const res = await fetch(`/api/projects/${selectedId}`);
      setDetail(await res.json());
    }
  };

  const filtered = storeFilter === 'all' ? projects : projects.filter(p => String(p.store_id) === storeFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">制作管理</h1>
          <p className="text-gray-500 mt-1">動画構成・キャプション・ハッシュタグ・チェックリスト</p>
        </div>
        <select
          value={storeFilter}
          onChange={e => setStoreFilter(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option value="all">全店舗</option>
          {stores.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-6">
        {/* Project list */}
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold">プロジェクト一覧</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">プロジェクトがありません</p>
              ) : (
                filtered.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedId === p.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{p.store_name}</div>
                    <div className="text-xs text-gray-500">W{p.week_number} {p.week_role} - {p.theme}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detail view */}
        <div className="flex-1">
          {!detail ? (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center text-gray-500">
              左のリストからプロジェクトを選択してください
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">{detail.store_name} - W{detail.week_number}</h2>
                    <p className="text-gray-500">{detail.week_role} / {detail.theme}</p>
                  </div>
                  <select
                    value={detail.status}
                    onChange={e => updateField('status', e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="planning">企画中</option>
                    <option value="in_progress">制作中</option>
                    <option value="review">レビュー中</option>
                    <option value="completed">完了</option>
                  </select>
                </div>

                {/* Store info */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-3">
                    <span className="text-gray-500 block text-xs">メイントーン</span>
                    <span>{detail.store_tone}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <span className="text-gray-500 block text-xs">強く出す価値</span>
                    <span>{detail.strong_values}</span>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <span className="text-gray-500 block text-xs">避けるべきこと</span>
                    <span className="text-red-600">{detail.avoid}</span>
                  </div>
                </div>
              </div>

              {/* Production details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">制作パラメータ</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">ターゲット</label>
                      <input
                        type="text"
                        value={detail.target}
                        onChange={e => updateField('target', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="例: 30-40代 接待利用"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">訴求軸</label>
                      <input
                        type="text"
                        value={detail.appeal_axis}
                        onChange={e => updateField('appeal_axis', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="例: 季節感、特別感"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">動画尺</label>
                      <input
                        type="text"
                        value={detail.video_duration}
                        onChange={e => updateField('video_duration', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">トーン</label>
                      <input
                        type="text"
                        value={detail.tone}
                        onChange={e => updateField('tone', e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="例: 上品、落ち着いた"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">動画構成案</h3>
                  <textarea
                    value={detail.video_structure}
                    onChange={e => updateField('video_structure', e.target.value)}
                    rows={8}
                    className="w-full border rounded px-3 py-2 text-sm resize-none"
                    placeholder="1. 冒頭で印象カット&#10;2. 料理または空間で惹きつける&#10;3. 利用シーンを想起させる&#10;4. 店舗の魅力を一言で補足する&#10;5. 最後に予約または来店導線で締める"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">テロップ案</h3>
                  <textarea
                    value={detail.terop_plan}
                    onChange={e => updateField('terop_plan', e.target.value)}
                    rows={5}
                    className="w-full border rounded px-3 py-2 text-sm resize-none"
                    placeholder="テロップは最小限で、読みやすさを優先"
                  />
                </div>
                <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                  <h3 className="font-bold mb-3">BGM方向性</h3>
                  <textarea
                    value={detail.bgm_direction}
                    onChange={e => updateField('bgm_direction', e.target.value)}
                    rows={5}
                    className="w-full border rounded px-3 py-2 text-sm resize-none"
                    placeholder={`推奨: ${detail.music_tone}`}
                  />
                </div>
              </div>

              {/* Caption & Hashtags */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">キャプション</h3>
                <p className="text-xs text-gray-500 mb-2">1行目で惹く → 店の魅力を短く → 利用シーン提案 → 行動導線</p>
                <textarea
                  value={detail.caption}
                  onChange={e => updateField('caption', e.target.value)}
                  rows={6}
                  className="w-full border rounded px-3 py-2 text-sm resize-none"
                  placeholder="キャプションを入力..."
                />
              </div>

              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">ハッシュタグ</h3>
                <p className="text-xs text-gray-500 mb-2">ブランド系・エリア系・利用シーン系の3層</p>
                <textarea
                  value={detail.hashtags}
                  onChange={e => updateField('hashtags', e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm resize-none"
                  placeholder="#大嵓埜 #北新地グルメ #会食 #接待..."
                />
              </div>

              {/* Checklist */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">最終チェックリスト</h3>
                <div className="space-y-2">
                  {detail.checklist?.map(item => (
                    <label key={item.id} className="flex items-center gap-3 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!item.checked}
                        onChange={() => toggleCheck(item.id, !!item.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className={item.checked ? 'line-through text-gray-400' : 'text-gray-700'}>
                        {item.item_text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-5">
                <h3 className="font-bold mb-3">メモ</h3>
                <textarea
                  value={detail.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  rows={4}
                  className="w-full border rounded px-3 py-2 text-sm resize-none"
                  placeholder="自由メモ..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
