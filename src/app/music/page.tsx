'use client';

import { useEffect, useState, useCallback } from 'react';
import { getStores, getMusicStocks, addMusicStock, deleteMusicStock, type Store, type MusicStock } from '@/lib/store';

export default function MusicPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [music, setMusic] = useState<MusicStock[]>([]);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ store_id: 1, title: '', mood: '', bpm: '', suitable_scene: '', notes: '' });

  const loadData = useCallback(() => {
    setStores(getStores());
    setMusic(getMusicStocks(storeFilter === 'all' ? undefined : Number(storeFilter)));
  }, [storeFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMusicStock({ ...form, store_id: Number(form.store_id), bpm: form.bpm ? Number(form.bpm) : null });
    setForm({ store_id: 1, title: '', mood: '', bpm: '', suitable_scene: '', notes: '' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = (id: number) => {
    if (!confirm('この音楽ストックを削除しますか？')) return;
    deleteMusicStock(id);
    loadData();
  };

  const MusicTable = ({ items }: { items: MusicStock[] }) => (
    <table className="w-full text-sm">
      <thead className="bg-gray-50"><tr>
        <th className="px-4 py-2 text-left font-medium text-gray-600">曲名</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">雰囲気</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">BPM</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">シーン</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">備考</th>
        <th className="px-4 py-2 w-16"></th>
      </tr></thead>
      <tbody className="divide-y divide-gray-100">
        {items.map(m => (
          <tr key={m.id}>
            <td className="px-4 py-2 font-medium">{m.title}</td>
            <td className="px-4 py-2">{m.mood}</td>
            <td className="px-4 py-2">{m.bpm || '—'}</td>
            <td className="px-4 py-2">{m.suitable_scene || '—'}</td>
            <td className="px-4 py-2 text-gray-500">{m.notes || '—'}</td>
            <td className="px-4 py-2"><button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-xs">削除</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">音楽ストック管理</h1>
          <p className="text-gray-500 mt-1">店舗別の音楽在庫管理</p>
        </div>
        <div className="flex gap-3">
          <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">全店舗</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">{showForm ? '閉じる' : '+ 追加'}</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {stores.map(s => (
          <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-bold text-sm">{s.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{s.music_tone}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-6">
          <h2 className="font-bold mb-4">音楽ストック追加</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">店舗</label>
              <select value={form.store_id} onChange={e => setForm({ ...form, store_id: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm">
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">曲名</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">雰囲気</label>
              <input type="text" value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">BPM</label>
              <input type="number" value={form.bpm} onChange={e => setForm({ ...form, bpm: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">向いているシーン</label>
              <input type="text" value={form.suitable_scene} onChange={e => setForm({ ...form, suitable_scene: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">備考</label>
              <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700">登録</button>
        </form>
      )}

      {storeFilter === 'all' ? (
        stores.map(s => {
          const items = music.filter(m => m.store_id === s.id);
          return (
            <div key={s.id} className="bg-white rounded-lg shadow border border-gray-200 mb-6">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <div><h2 className="font-bold">{s.name}</h2><p className="text-xs text-gray-500">{s.music_tone}</p></div>
                <span className="text-sm text-gray-500">{items.length}曲</span>
              </div>
              {items.length === 0 ? <p className="p-5 text-sm text-gray-400">ストックなし</p> : <MusicTable items={items} />}
            </div>
          );
        })
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {music.length === 0 ? <p className="p-8 text-center text-gray-400">ストックなし</p> : <MusicTable items={music} />}
        </div>
      )}
    </div>
  );
}
