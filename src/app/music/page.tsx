'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStores, getMusicStocks, addMusicStock, deleteMusicStock, type Store, type MusicStock } from '@/lib/store';

export default function MusicPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [music, setMusic] = useState<MusicStock[]>([]);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ store_id: 1, title: '', mood: '', bpm: '', suitable_scene: '', drive_url: '', notes: '' });

  const loadData = useCallback(() => {
    setStores(getStores());
    setMusic(getMusicStocks(storeFilter === 'all' ? undefined : Number(storeFilter)));
  }, [storeFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMusicStock({ ...form, store_id: Number(form.store_id), bpm: form.bpm ? Number(form.bpm) : null });
    setForm({ store_id: 1, title: '', mood: '', bpm: '', suitable_scene: '', drive_url: '', notes: '' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('この音楽ストックを削除しますか？')) return;
    deleteMusicStock(id);
    loadData();
  };

  const inputCls = 'w-full border border-[var(--border)] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--muted)]';

  const MusicTable = ({ items }: { items: MusicStock[] }) => (
    <table className="w-full text-[12px]">
      <thead><tr className="border-b border-[var(--border)]">
        <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">曲名</th>
        <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">雰囲気</th>
        <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">BPM</th>
        <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">シーン</th>
        <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">Drive</th>
        <th className="px-4 py-2.5 text-left font-normal text-[var(--muted)]">備考</th>
        <th className="px-4 py-2.5 w-12"></th>
      </tr></thead>
      <tbody>
        {items.map(m => (
          <tr key={m.id} className="border-b border-[var(--accent-light)] last:border-0">
            <td className="px-4 py-2.5 font-medium">{m.title}</td>
            <td className="px-4 py-2.5 text-[var(--muted)]">{m.mood}</td>
            <td className="px-4 py-2.5 text-[var(--muted)]">{m.bpm || '—'}</td>
            <td className="px-4 py-2.5 text-[var(--muted)]">{m.suitable_scene || '—'}</td>
            <td className="px-4 py-2.5">{m.drive_url ? <a href={m.drive_url} target="_blank" rel="noopener noreferrer" className="underline text-[var(--muted)] hover:text-[var(--foreground)]">開く</a> : '—'}</td>
            <td className="px-4 py-2.5 text-[var(--muted)]">{m.notes || '—'}</td>
            <td className="px-4 py-2.5"><button onClick={() => handleDelete(m.id)} className="text-[var(--muted)] hover:text-[var(--foreground)] text-[11px] underline">削除</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-semibold">音楽ストック</h1>
          <p className="text-[13px] text-[var(--muted)]">店舗別の音楽在庫管理</p>
        </div>
        <div className="flex gap-2">
          <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="border border-[var(--border)] rounded-md px-3 py-1.5 text-[13px]">
            <option value="all">全店舗</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="px-3 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px] hover:opacity-80">{showForm ? '閉じる' : '+ 追加'}</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {stores.map(s => (
          <div key={s.id} className="bg-white border border-[var(--border)] rounded-lg px-4 py-3">
            <h3 className="text-[13px] font-medium">{s.name}</h3>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">{s.music_tone}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-[var(--border)] rounded-lg p-5 mb-4">
          <h2 className="text-[13px] font-semibold mb-3">音楽ストック追加</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">店舗</label>
              <select value={form.store_id} onChange={e => setForm({ ...form, store_id: Number(e.target.value) })} className={inputCls}>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">曲名</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">雰囲気</label>
              <input type="text" value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} className={inputCls} required />
            </div>
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">BPM</label>
              <input type="number" value={form.bpm} onChange={e => setForm({ ...form, bpm: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">向いているシーン</label>
              <input type="text" value={form.suitable_scene} onChange={e => setForm({ ...form, suitable_scene: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">Google Drive URL</label>
              <input type="url" value={form.drive_url} onChange={e => setForm({ ...form, drive_url: e.target.value })} className={inputCls} placeholder="https://drive.google.com/..." />
            </div>
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">備考</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls} />
            </div>
          </div>
          <button type="submit" className="mt-3 px-4 py-1.5 bg-[var(--foreground)] text-white rounded-md text-[13px] hover:opacity-80">登録</button>
        </form>
      )}

      {storeFilter === 'all' ? (
        stores.map(s => {
          const items = music.filter(m => m.store_id === s.id);
          return (
            <div key={s.id} className="bg-white border border-[var(--border)] rounded-lg mb-4">
              <div className="px-5 py-3 border-b border-[var(--border)] flex justify-between items-center">
                <div><h2 className="text-[13px] font-semibold">{s.name}</h2><p className="text-[11px] text-[var(--muted)]">{s.music_tone}</p></div>
                <span className="text-[12px] text-[var(--muted)]">{items.length}曲</span>
              </div>
              {items.length === 0 ? <p className="p-4 text-[13px] text-[var(--muted)]">ストックなし</p> : <MusicTable items={items} />}
            </div>
          );
        })
      ) : (
        <div className="bg-white border border-[var(--border)] rounded-lg">
          {music.length === 0 ? <p className="p-8 text-center text-[var(--muted)] text-[13px]">ストックなし</p> : <MusicTable items={music} />}
        </div>
      )}
    </div>
  );
}
