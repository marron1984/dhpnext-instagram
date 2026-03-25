'use client';

import { useState, useEffect } from 'react';
import { CLAUDE_TEMPLATES, VIDEO_STRUCTURE_TEMPLATE } from '@/lib/constants';

interface Store {
  id: number;
  name: string;
  slug: string;
  main_tone: string;
  strong_values: string;
  avoid: string;
}

export default function TemplatesPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [target, setTarget] = useState('');
  const [appealAxis, setAppealAxis] = useState('');
  const [duration, setDuration] = useState('15-30秒');
  const [tone, setTone] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then((data: Store[]) => {
      setStores(data);
      if (data.length > 0) setSelectedStore(data[0]);
    });
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateProductionPrompt = () => {
    if (!selectedStore) return '';
    return `このレポジトリを確認し、Instagramリール動画用の制作物を作成してください。

【対象店舗】${selectedStore.name}
【ターゲット】${target || '（未設定）'}
【訴求軸】${appealAxis || selectedStore.strong_values}
【動画尺】${duration}
【トーン】${tone || selectedStore.main_tone}

以下を一式で作成してください：
- 動画構成案（縦型9:16、冒頭3秒で引きを作る）
- テロップ案（最小限で読みやすさ優先）
- キャプション案（1行目で惹く→魅力→シーン提案→行動導線）
- ハッシュタグ案（ブランド系・エリア系・利用シーン系の3層）
- 使用素材提案
- BGM方向性

【重要な注意事項】
- 店名「${selectedStore.name}」の漢字表記は必ず正確に
- 料理名、地名に誤字がないようにする
- 日本語として自然で、日本語フォント前提の構成にする
- 避けるべきこと: ${selectedStore.avoid}
- 強く出す価値: ${selectedStore.strong_values}`;
  };

  const generateRepoName = () => {
    if (!selectedStore) return '';
    const today = new Date().toISOString().split('T')[0];
    return `${today}-${selectedStore.slug}-${appealAxis || 'promotion'}`.replace(/[、。・]/g, '-').replace(/\s+/g, '-');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Claude指示テンプレート</h1>
        <p className="text-gray-500 mt-1">制作指示をワンクリックで生成・コピー</p>
      </div>

      {/* Store selector and params */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-6">
        <h2 className="font-bold mb-4">制作パラメータ設定</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">対象店舗</label>
            <select
              value={selectedStore?.id || ''}
              onChange={e => setSelectedStore(stores.find(s => s.id === Number(e.target.value)) || null)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">ターゲット</label>
            <input
              type="text"
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="30-40代 接待利用"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">訴求軸</label>
            <input
              type="text"
              value={appealAxis}
              onChange={e => setAppealAxis(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="季節感、特別感"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">動画尺</label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="15秒">15秒</option>
              <option value="15-30秒">15-30秒</option>
              <option value="30秒">30秒</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">トーン</label>
            <input
              type="text"
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder={selectedStore?.main_tone || ''}
            />
          </div>
        </div>
      </div>

      {/* Repo name suggestion */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">推奨レポジトリ名:</span>
            <code className="ml-2 text-sm bg-white px-2 py-1 rounded border">{generateRepoName()}</code>
          </div>
          <button
            onClick={() => copyToClipboard(generateRepoName(), 'repo')}
            className="text-sm text-blue-600 hover:underline"
          >
            {copied === 'repo' ? 'コピー済み!' : 'コピー'}
          </button>
        </div>
      </div>

      {/* Template cards */}
      <div className="space-y-6">
        {/* Step 1: Initial check */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">STEP 1</span>
              <span className="font-bold">初回確認指示</span>
            </div>
            <button
              onClick={() => copyToClipboard(CLAUDE_TEMPLATES.initial, 'initial')}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              {copied === 'initial' ? 'コピー済み!' : 'コピー'}
            </button>
          </div>
          <pre className="p-5 text-sm text-gray-700 whitespace-pre-wrap">{CLAUDE_TEMPLATES.initial}</pre>
        </div>

        {/* Step 2: Index */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">STEP 2</span>
              <span className="font-bold">インデックス作成指示</span>
            </div>
            <button
              onClick={() => copyToClipboard(CLAUDE_TEMPLATES.index, 'index')}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              {copied === 'index' ? 'コピー済み!' : 'コピー'}
            </button>
          </div>
          <pre className="p-5 text-sm text-gray-700 whitespace-pre-wrap">{CLAUDE_TEMPLATES.index}</pre>
        </div>

        {/* Step 3: Production (customized) */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mr-2">STEP 3</span>
              <span className="font-bold">制作指示（カスタム生成）</span>
            </div>
            <button
              onClick={() => copyToClipboard(generateProductionPrompt(), 'production')}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              {copied === 'production' ? 'コピー済み!' : 'コピー'}
            </button>
          </div>
          <pre className="p-5 text-sm text-gray-700 whitespace-pre-wrap">{generateProductionPrompt()}</pre>
        </div>

        {/* Video structure reference */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <span className="font-bold">動画構成の基本形（参考）</span>
          </div>
          <pre className="p-5 text-sm text-gray-700 whitespace-pre-wrap">{VIDEO_STRUCTURE_TEMPLATE}</pre>
          <div className="px-5 pb-5">
            <p className="text-xs text-gray-500">
              縦型 9:16 / 冒頭3秒で引き / 料理・空間・人の気配のバランス / テロップ最小限 / 最後に保存・来店・予約導線
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
