import React, { useEffect, useState } from 'react';
import AnimeEditModal from './AnimeEditModal';
import api from '../../utils/api';
import { Anime } from '../../types';

const AnimeManager: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editAnime, setEditAnime] = useState<Anime | null>(null);
  const [animeCount, setAnimeCount] = useState(0);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [counterTarget, setCounterTarget] = useState<Anime | null>(null);
  const [dummyLikes, setDummyLikes] = useState<string>('');
  const [dummyViews, setDummyViews] = useState<string>('');

  // Fetch anime list and count
  const fetchAnime = async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get('/anime', { params: { search: q, limit: 200 } });
      setAnimeList(res.data.anime);
      setAnimeCount(res.data.pagination.total);
    } catch (err) {
      setAnimeList([]);
      setAnimeCount(0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAnime(); }, []);

  // Real-time search (debounced, trimmed)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchAnime(search.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Add/Edit
  const handleSave = async (data: any) => {
    try {
      // Always use multipart/form-data for both create and update
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v instanceof File) {
          formData.append(k, v);
        } else if (Array.isArray(v)) {
          formData.append(k, JSON.stringify(v));
        } else if (v !== null && v !== undefined) {
          // Skip problematic fields that shouldn't be updated
          if (editAnime && (k === 'likes' || k === 'views' || k === 'comments' || k === 'bookmarks')) {
            return;
          }
          formData.append(k, v as any);
        }
      });

      if (editAnime) {
        await api.put(`/anime/${editAnime._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/anime', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModalOpen(false);
      setEditAnime(null);
      fetchAnime();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save anime.');
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this anime?')) return;
    try {
      await api.delete(`/anime/${id}`);
      fetchAnime();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete anime.');
    }
  };

  return (
    <div>
      {/* Real-time count and add button */}
      <div className="flex items-center gap-4 mb-4">
        <button className="px-4 py-2 rounded bg-[#004d40] text-white font-semibold" onClick={() => { setEditAnime(null); setModalOpen(true); }}>+ Add Anime</button>
        <button className="px-4 py-2 rounded bg-white border text-[#004d40] font-semibold relative" onClick={() => setListModalOpen(true)}>
          Anime Count: <span className="font-bold">{animeCount}</span>
        </button>
      </div>
      {/* Floating modal for anime list/search/edit/delete */}
      {listModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
            <button onClick={() => setListModalOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Anime List</h2>
            <input
              className="w-full px-3 py-2 rounded border mb-4 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
              placeholder="Search anime..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-96 overflow-y-auto">
              {loading ? <div className="text-gray-900 dark:text-white">Loading...</div> : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-gray-900 dark:text-white">
                      <th className="py-2 font-semibold">Title</th>
                      <th className="py-2 font-semibold">Year</th>
                      <th className="py-2 font-semibold">Status</th>
                      <th className="py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animeList.map(anime => (
                      <tr key={anime._id} className="border-b hover:bg-gray-700/30 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                        <td className="py-2 whitespace-pre-line">{anime.title}</td>
                        <td className="py-2">{anime.year}</td>
                        <td className="py-2 capitalize">{anime.status}</td>
                        <td className="py-2 flex gap-2">
                          <button className="px-2 py-1 rounded bg-blue-600 text-white" onClick={() => { setEditAnime(anime); setModalOpen(true); setListModalOpen(false); }}>Edit</button>
                          <button className="px-2 py-1 rounded bg-red-600 text-white" onClick={() => handleDelete(anime._id)}>Delete</button>
                          <button className="px-2 py-1 rounded bg-purple-600 text-white" onClick={() => { setCounterTarget(anime); setDummyLikes(String(anime.dummyLikes ?? 0)); setDummyViews(String(anime.dummyViews ?? 0)); }}>Counters</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Add/Edit Modal */}
      <AnimeEditModal open={modalOpen} onClose={() => { setModalOpen(false); setEditAnime(null); }} anime={editAnime} onSave={handleSave} />

      {/* Quick Counters Modal */}
      {counterTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button onClick={() => setCounterTarget(null)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Update Counters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Dummy Likes</label>
                <input value={dummyLikes} onChange={e=>setDummyLikes(e.target.value.replace(/[^0-9]/g,''))} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1">Dummy Views</label>
                <input value={dummyViews} onChange={e=>setDummyViews(e.target.value.replace(/[^0-9]/g,''))} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setCounterTarget(null)} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white">Cancel</button>
                <button onClick={async()=>{
                  try {
                    await api.post(`/admin/anime/${counterTarget._id}/counters`, { dummyLikes: Number(dummyLikes||'0'), dummyViews: Number(dummyViews||'0') });
                    setCounterTarget(null);
                    fetchAnime(search.trim());
                  } catch(e) { alert('Failed to update counters'); }
                }} className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeManager;
