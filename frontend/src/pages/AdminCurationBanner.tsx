
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Plus, Save, Search } from 'lucide-react';

interface Anime {
  _id: string;
  title: string;
  coverImage: string;
  bannerImage?: string;
  year?: number;
  status?: string;
}

const AdminCurationBanner: React.FC = () => {
  const [bannerAnime, setBannerAnime] = useState<Anime[]>([]);
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  // Fetch all anime for dropdown
  useEffect(() => {
    axios.get('https://animaaz.onrender.com/api/anime?limit=1000')
      .then(res => setAllAnime(res.data.anime || []))
      .catch(() => {});
  }, []);
  // Add anime from dropdown
  const handleDropdownAdd = () => {
    if (!selectedAnimeId) return;
    const anime = allAnime.find(a => a._id === selectedAnimeId);
    if (anime && !bannerAnime.find(a => a._id === anime._id)) {
      setBannerAnime([...bannerAnime, anime]);
    }
  };
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch current banner anime from curation model
  useEffect(() => {
    setLoading(true);
    axios.get('https://animaaz.onrender.com/api/curation/banner')
      .then(res => setBannerAnime(res.data))
      .catch(() => setError('Failed to load banner anime.'))
      .finally(() => setLoading(false));
  }, []);

  // Search anime by title
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`https://animaaz.onrender.com/api/anime?search=${encodeURIComponent(searchTerm)}&limit=10`);
      setSearchResults(res.data.anime || []);
    } catch {
      setError('Search failed.');
    } finally {
      setLoading(false);
    }
  };

  // Add anime to banner list (if not already present)
  const addBannerAnime = (anime: Anime) => {
    if (!bannerAnime.find(a => a._id === anime._id)) {
      setBannerAnime([...bannerAnime, anime]);
    }
  };

  // Remove anime from banner list
  const removeBannerAnime = (id: string) => {
    setBannerAnime(bannerAnime.filter(a => a._id !== id));
  };

  // Save banner list to backend using curation model
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const animeIds = bannerAnime.map(a => a._id);
      await axios.put('https://animaaz.onrender.com/api/curation/banner', { animeIds });
      setSuccess('Banner list updated!');
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (

    <div className="max-w-4xl mx-auto py-8 bg-white rounded-2xl shadow-lg border border-blue-100">
      <div className="mb-8 pb-4 border-b border-blue-200">
        <h1 className="text-3xl font-extrabold text-blue-900">Homepage Banner</h1>
        <div className="text-blue-500 mt-1 text-sm">Manage the curated list for Homepage Banner Anime.</div>
        {/* Dropdown to select any anime from database */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
          <select
            className="w-full sm:w-2/3 px-4 py-2 rounded-lg border border-blue-300 bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={selectedAnimeId}
            onChange={e => setSelectedAnimeId(e.target.value)}
          >
            <option value="">Select anime to add to banner...</option>
            {allAnime.map(anime => (
              <option key={anime._id} value={anime._id}>{anime.title}</option>
            ))}
          </select>
          <button
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
            onClick={handleDropdownAdd}
            disabled={!selectedAnimeId || !!bannerAnime.find(a => a._id === selectedAnimeId)}
          >
            Add
          </button>
          <button
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-lg"
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-500 font-medium">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-medium">{success}</div>}

      {/* Current Banner Anime */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Current Banner Anime</h2>
        {loading ? (
          <div>Loading...</div>
        ) : bannerAnime.length === 0 ? (
          <div className="text-blue-400">No anime in banner.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bannerAnime.map(anime => (
              <div key={anime._id} className="relative bg-blue-50 rounded-xl shadow p-4 flex flex-col items-center border border-blue-100">
                <img src={anime.bannerImage || anime.coverImage} alt={anime.title} className="w-full h-40 object-cover rounded-lg mb-2 border border-blue-200" />
                <div className="font-semibold text-center mb-1 text-blue-900">{anime.title}</div>
                <div className="text-xs text-blue-500 mb-2">{anime.year} {anime.status && `| ${anime.status}`}</div>
                <button
                  className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white rounded-full p-1 shadow"
                  onClick={() => removeBannerAnime(anime._id)}
                  title="Remove from banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search and Add Anime */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          className="flex-1 px-4 py-2 rounded-l-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-blue-900 placeholder-blue-400"
          placeholder="Search anime by title..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg flex items-center gap-1 font-semibold"
        >
          <Search className="w-4 h-4" /> Search
        </button>
      </form>
      {searchResults.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-2 text-blue-800">Search Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {searchResults.map(anime => (
              <div key={anime._id} className="relative bg-blue-50 rounded-xl shadow p-4 flex flex-col items-center border border-blue-100">
                <img src={anime.bannerImage || anime.coverImage} alt={anime.title} className="w-full h-40 object-cover rounded-lg mb-2 border border-blue-200" />
                <div className="font-semibold text-center mb-1 text-blue-900">{anime.title}</div>
                <div className="text-xs text-blue-500 mb-2">{anime.year} {anime.status && `| ${anime.status}`}</div>
                <button
                  className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow"
                  onClick={() => addBannerAnime(anime)}
                  title="Add to banner"
                  disabled={!!bannerAnime.find(a => a._id === anime._id)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCurationBanner;
