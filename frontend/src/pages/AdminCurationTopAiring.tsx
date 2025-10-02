import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { Anime } from '../types';

const AdminCurationTopAiring: React.FC = () => {
  const [topAiring, setTopAiring] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [curRes, allRes] = await Promise.all([
          api.get('/curation/topAiring').catch(err => {
            if (err.response && err.response.status === 404) {
              return { data: { animeIds: [] } };
            }
            throw err;
          }),
          api.get('/anime?limit=1000')
        ]);
        setTopAiring(curRes.data.animeIds || []);
        setAllAnime(allRes.data.anime || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = () => {
    if (!selectedToAdd) return;
    const anime = allAnime.find(a => a._id === selectedToAdd);
    if (anime && !topAiring.some(f => f._id === anime._id)) {
      setTopAiring([...topAiring, anime]);
      setSelectedToAdd('');
    }
  };

  const handleRemove = (id: string) => {
    setTopAiring(topAiring.filter(a => a._id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const animeIds = topAiring.map(a => a._id);
      await api.put('/curation/topAiring', { animeIds });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const filteredAnime = allAnime.filter(a =>
    !topAiring.some(f => f._id === a._id) &&
    (a.title.toLowerCase().includes(search.toLowerCase()) || !search)
  );

  return (
    <>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Top Airing</h1>
          <div className="text-gray-500 mt-1 text-sm">Manage the curated list for Top Airing Anime.</div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-medium transition-transform transform hover:scale-[1.01] shadow-lg">
          <Settings className="w-4 h-4" />
          Global Settings
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {topAiring.length === 0 && (
              <div className="mb-4 text-blue-600">No Top Airing curation yet. Add anime and save to create it.</div>
            )}
            <div className="mb-4 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search anime..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-64"
              />
              <select
                value={selectedToAdd}
                onChange={e => setSelectedToAdd(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select anime to add</option>
                {filteredAnime.map(a => (
                  <option key={a._id} value={a._id}>{a.title}</option>
                ))}
              </select>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-1 hover:bg-green-700"
                onClick={handleAdd}
                disabled={!selectedToAdd}
                type="button"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topAiring.map(anime => (
                <div key={anime._id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 shadow">
                  <img src={anime.coverImage} alt={anime.title} className="w-16 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <div className="font-semibold text-lg text-gray-900 dark:text-white">{anime.title}</div>
                  </div>
                  <button
                    className="p-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemove(anime._id)}
                    type="button"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Top Airing List'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminCurationTopAiring;
