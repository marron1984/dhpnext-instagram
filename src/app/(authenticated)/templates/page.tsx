'use client';

import { useState, useEffect } from 'react';
import { CLAUDE_TEMPLATES, VIDEO_STRUCTURE_TEMPLATE, TARGET_OPTIONS, APPEAL_AXIS_OPTIONS } from '@/lib/constants';
import { getStores, type Store } from '@/lib/store';

export default function TemplatesPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [target, setTarget] = useState('');
  const [appealAxis, setAppealAxis] = useState('');
  const [duration, setDuration] = useState('15-30秒');
  const [tone, setTone] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const s = getStores();
    setStores(s);
    if (s.length) setSelectedStore(s[0]);
  }, []);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const genPrompt = () => {
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

  const genRepoName = () => {
    if (!selectedStore) return '';
    const today = new Date().toISOString().split('T')[0];
    return `${today}-${selectedStore.slug}-${appealAxis || 'promotion'}`.replace(/[、。・]/g, '-').replace(/\s+/g, '-');
  };

  const selectCls = 'w-full border border-[var(--border)] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--muted)]';
  const inputCls = selectCls;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg font-semibold">指示テンプレート</h1>
        <p className="text-[13px] text-[var(--muted)]">制作指示をワンクリックで生成・コピー</p>
      </div>

      {/* Params */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-5 mb-4">
        <h2 className="text-[13px] font-semibold mb-3">制作パラメータ設定</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">対象店舗</label>
            <select value={selectedStore?.id || ''} onChange={e => setSelectedStore(stores.find(s => s.id === Number(e.target.value)) || null)} className={selectCls}>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">ターゲット</label>
            <select value={target} onChange={e => setTarget(e.target.value)} className={selectCls}>
              <option value="">選択してください</option>
              {TARGET_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">訴求軸</label>
            <select value={appealAxis} onChange={e => setAppealAxis(e.target.value)} className={selectCls}>
              <option value="">選択してください</option>
              {APPEAL_AXIS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">動画尺</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className={selectCls}>
              <option value="15秒">15秒</option><option value="15-30秒">15-30秒</option><option value="30秒">30秒</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--muted)] block mb-1">トーン</label>
            <input type="text" value={tone} onChange={e => setTone(e.target.value)} className={inputCls} placeholder={selectedStore?.main_tone || ''} />
          </div>
        </div>
      </div>

      {/* Repo name */}
      <div className="bg-[var(--accent-light)] border border-[var(--border)] rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
        <div className="text-[12px]">
          <span className="text-[var(--muted)]">推奨レポジトリ名:</span>
          <code className="ml-2 bg-white px-2 py-0.5 rounded border border-[var(--border)] text-[13px]">{genRepoName()}</code>
        </div>
        <button onClick={() => copy(genRepoName(), 'repo')} className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)] underline">{copied === 'repo' ? 'コピー済み' : 'コピー'}</button>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {[
          { step: 1, title: '初回確認指示', key: 'initial', text: CLAUDE_TEMPLATES.initial },
          { step: 2, title: 'インデックス作成指示', key: 'index', text: CLAUDE_TEMPLATES.index },
        ].map(t => (
          <div key={t.key} className="bg-white border border-[var(--border)] rounded-lg">
            <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">STEP {t.step}</span>
                <span className="text-[13px] font-semibold">{t.title}</span>
              </div>
              <button onClick={() => copy(t.text, t.key)} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[12px] hover:opacity-80">{copied === t.key ? 'コピー済み' : 'コピー'}</button>
            </div>
            <pre className="p-5 text-[13px] text-[var(--muted)] whitespace-pre-wrap leading-relaxed">{t.text}</pre>
          </div>
        ))}

        <div className="bg-white border border-[var(--border)] rounded-lg">
          <div className="px-5 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[var(--muted)] border border-[var(--border)] px-1.5 py-0.5 rounded">STEP 3</span>
              <span className="text-[13px] font-semibold">制作指示（カスタム生成）</span>
            </div>
            <button onClick={() => copy(genPrompt(), 'production')} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[12px] hover:opacity-80">{copied === 'production' ? 'コピー済み' : 'コピー'}</button>
          </div>
          <pre className="p-5 text-[13px] text-[var(--muted)] whitespace-pre-wrap leading-relaxed">{genPrompt()}</pre>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-lg">
          <div className="px-5 py-3 border-b border-[var(--border)]"><span className="text-[13px] font-semibold">動画構成の基本形（参考）</span></div>
          <pre className="p-5 text-[13px] text-[var(--muted)] whitespace-pre-wrap leading-relaxed">{VIDEO_STRUCTURE_TEMPLATE}</pre>
          <div className="px-5 pb-4"><p className="text-[11px] text-[var(--muted)]">縦型 9:16 / 冒頭3秒で引き / 料理・空間・人の気配のバランス / テロップ最小限 / 最後に保存・来店・予約導線</p></div>
        </div>
      </div>
    </div>
  );
}
