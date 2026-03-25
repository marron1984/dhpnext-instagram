'use client';

import { useEffect, useState } from 'react';

interface Store {
  id: number;
  name: string;
  music_tone: string;
}

interface MusicStock {
  id: number;
  store_id: number;
  store_name: string;
  title: string;
  mood: string;
  bpm: number | null;
  suitable_scene: string;
  used_in: string;
  notes: string;
}

export default function MusicPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [music, setMusic] = useState<MusicStock[]>([]);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    store_id: 1,
    title: '',
    mood: '',
    bpm: '',
    suitable_scene: '',
    notes: '',
  });

  const loadData = () => {
    fetch('/api/stores').then(r => r.json()).then(setStores);
    const url = storeFilter === 'all' ? '/api/music' : `/api/music?store_id=${storeFilter}`;
    fetch(url).then(r => r.json()).then(setMusic);
  };

  useEffect(() => { loadData(); }, [storeFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        bpm: form.bpm ? Number(form.bpm) : null,
      }),
    });
    setForm({ store_id: 1, title: '', mood: '', bpm: '', suitable_scene: '', notes: '' });
    setShowForm(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この音楽ストックを削除しますか？')) return;
    await fetch(`/api/music/${id}`, { method: 'DELETE' });
    loadData();
  };

  const storeMusic = stores.map(s => ({
    ...s,
    stocks: music.filter(m => m.store_id === s.id),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">音楽ストック管理</h1>
          <p className="text-gray-500 mt-1">店舗別の音楽在庫管理</p>
        </div>
        <div className="flex gap-3">
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            {showForm ? '閉じる' : '+ 追加'}
          </button>
        </div>
      </div>

      {/* Store tone reference */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {stores.map(s => (
          <div key={s.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="font-bold text-sm">{s.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{s.music_tone}</p>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-5 mb-6">
          <h2 className="font-bold mb-4">音楽ストック追加</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">店舗</label>
              <select
                value={form.store_id}
                onChange={e => setForm({ ...form, store_id: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">曲名</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">雰囲気</label>
              <input
                type="text"
                value={form.mood}
                onChange={e => setForm({ ...form, mood: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">BPM</label>
              <input
                type="number"
                value={form.bpm}
                onChange={e => setForm({ ...form, bpm: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">向いているシーン</label>
              <input
                type="text"
                value={form.suitable_scene}
                onChange={e => setForm({ ...form, suitable_scene: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">備考</label>
              <input
                type="text"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700">
            登録
          </button>
        </form>
      )}

      {/* Music list */}
      {storeFilter === 'all' ? (
        storeMusic.map(s => (
          <div key={s.id} className="bg-white rounded-lg shadow border border-gray-200 mb-6">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="font-bold">{s.name}</h2>
                <p className="text-xs text-gray-500">{s.music_tone}</p>
              </div>
              <span className="text-sm text-gray-500">{s.stocks.length}曲</span>
            </div>
            {s.stocks.length === 0 ? (
              <p className="p-5 text-sm text-gray-400">ストックなし</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">曲名</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">雰囲気</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">BPM</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">シーン</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">備考</th>
                    <th className="px-4 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {s.stocks.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 py-2 font-medium">{m.title}</td>
                      <td className="px-4 py-2">{m.mood}</td>
                      <td className="px-4 py-2">{m.bpm || '—'}</td>
                      <td className="px-4 py-2">{m.suitable_scene || '—'}</td>
                      <td className="px-4 py-2 text-gray-500">{m.notes || '—'}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-xs">
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {music.length === 0 ? (
            <p className="p-8 text-center text-gray-400">ストックなし</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">曲名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">雰囲気</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">BPM</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">シーン</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">備考</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {music.map(m => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium">{m.title}</td>
                    <td className="px-4 py-3">{m.mood}</td>
                    <td className="px-4 py-3">{m.bpm || '—'}</td>
                    <td className="px-4 py-3">{m.suitable_scene || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(m.id)} className="text-red-500 hover:text-red-700 text-xs">
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
