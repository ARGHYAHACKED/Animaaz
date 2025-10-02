import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings } from 'lucide-react';

interface Anime {
  _id: string;
  title: string;
  coverImage?: string;
  genres?: string[];
  rating?: number;
}

interface AnimeDetails extends Anime {
  description?: string;
  episodes?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  trailerUrl?: string;
  screenshots?: string[];
  [key: string]: any;
}

const AdminContentManagement: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [totalAnime, setTotalAnime] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<AnimeDetails | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  // Screenshot file input handler
  const handleScreenshotFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setScreenshotFiles(Array.from(e.target.files));
    }
  };
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  // Dummy Likes/Views modal state
  const [dummyEditOpen, setDummyEditOpen] = useState(false);
  const [dummyEditForm, setDummyEditForm] = useState({ dummyLikes: '', dummyViews: '' });
  // Dummy Likes/Views form change handler
  const handleDummyEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDummyEditForm(prev => ({ ...prev, [name]: value }));
  };
  // Dummy Likes/Views submit handler
  const handleDummyEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnime) return;
    setEditLoading(true);
    try {
      await axios.put(`/api/anime/${selectedAnime._id}`, {
        dummyLikes: Number(dummyEditForm.dummyLikes),
        dummyViews: Number(dummyEditForm.dummyViews),
      });
      // Refresh details
      const res = await axios.get(`/api/anime/${selectedAnime._id}`);
      setSelectedAnime(res.data);
      setDummyEditOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update dummy counters');
    } finally {
      setEditLoading(false);
    }
  };
  const pageSize = 25;

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try admin dashboard endpoint first for count
        const statsRes = await axios.get('/api/admin/dashboard');
        setTotalAnime(statsRes.data?.stats?.totalAnime ?? 0);
        // Fetch anime for current page
        const res = await axios.get(`/api/anime?limit=${pageSize}&page=${page}&search=${encodeURIComponent(search)}`);
        setAnimeList(res.data.anime || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch anime');
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [page, search]);

  // Handler to open details modal
  const handleAnimeClick = async (animeId: string) => {
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    setSelectedAnime(null);
    setEditMode(false);
    setEditForm({});
    try {
      const res = await axios.get(`/api/anime/${animeId}`);
      setSelectedAnime(res.data);
    } catch (err) {
      setSelectedAnime({ _id: animeId, title: 'Failed to load details' });
    } finally {
      setDetailsLoading(false);
    }
  };

  // Edit button handler
  const handleEditClick = () => {
    if (!selectedAnime) return;
    setEditMode(true);
    setEditForm({
      title: selectedAnime.title || '',
      title_english: selectedAnime.title_english || '',
      title_japanese: selectedAnime.title_japanese || '',
      title_synonyms: selectedAnime.title_synonyms?.join(', ') || '',
      alternativeTitles: selectedAnime.alternativeTitles?.join(', ') || '',
      description: selectedAnime.description || '',
      background: selectedAnime.background || '',
      tags: selectedAnime.tags?.join(', ') || '',
      genres: selectedAnime.genres?.join(', ') || '',
      coverImage: selectedAnime.coverImage || '',
      bannerImage: selectedAnime.bannerImage || '',
      images: selectedAnime.images || [],
      trailerUrl: selectedAnime.trailer?.url || '',
      producers: selectedAnime.producers?.map((p: any) => p.name).join(', ') || '',
      studios: selectedAnime.studios?.map((s: any) => s.name).join(', ') || '',
      licensors: selectedAnime.licensors?.map((l: any) => l.name).join(', ') || '',
      aired_from: selectedAnime.aired?.from ? new Date(selectedAnime.aired.from).toISOString().slice(0,10) : '',
      aired_to: selectedAnime.aired?.to ? new Date(selectedAnime.aired.to).toISOString().slice(0,10) : '',
      aired_string: selectedAnime.aired?.string || '',
      duration: selectedAnime.duration || '',
      totalEpisodes: selectedAnime.totalEpisodes || '',
      status: selectedAnime.status || '',
      season: selectedAnime.season || '',
      year: selectedAnime.year || '',
      studio: selectedAnime.studio || '',
      director: selectedAnime.director || '',
      commentsEnabled: selectedAnime.commentsEnabled ?? true,
      featured: selectedAnime.featured ?? false,
      trending: selectedAnime.trending ?? false,
      banner: selectedAnime.banner ?? false,
      topAiring: selectedAnime.topAiring ?? false,
      topWeek: selectedAnime.topWeek ?? false,
      forYou: selectedAnime.forYou ?? false,
      watchLinks: selectedAnime.watchLinks || [],
    });
  };

  // Edit form change handler
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    const isCheckbox = target.type === 'checkbox';
    setEditForm((prev: any) => ({ ...prev, [name]: isCheckbox ? (target as HTMLInputElement).checked : value }));
  };

  // Removed screenshot URL management and add/remove logic (only file upload is supported now)

  // Edit form submit handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnime) return;
    setEditLoading(true);
    try {
      const validSeasons = ['spring', 'summer', 'fall', 'winter'];
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('title_english', editForm.title_english);
      formData.append('title_japanese', editForm.title_japanese);
      formData.append('title_synonyms', JSON.stringify(editForm.title_synonyms.split(',').map((s: string) => s.trim()).filter(Boolean)));
      formData.append('alternativeTitles', JSON.stringify(editForm.alternativeTitles.split(',').map((s: string) => s.trim()).filter(Boolean)));
      formData.append('description', editForm.description);
      formData.append('background', editForm.background);
      formData.append('tags', JSON.stringify(editForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean)));
      formData.append('genres', JSON.stringify(editForm.genres.split(',').map((g: string) => g.trim()).filter(Boolean)));
      formData.append('coverImage', editForm.coverImage);
      formData.append('bannerImage', editForm.bannerImage);
      formData.append('trailerUrl', editForm.trailerUrl);
      formData.append('producers', JSON.stringify(editForm.producers.split(',').map((p: string) => ({ name: p.trim() })).filter((p: { name: string }) => p.name)));
      formData.append('studios', JSON.stringify(editForm.studios.split(',').map((s: string) => ({ name: s.trim() })).filter((s: { name: string }) => s.name)));
      formData.append('licensors', JSON.stringify(editForm.licensors.split(',').map((l: string) => ({ name: l.trim() })).filter((l: { name: string }) => l.name)));
      formData.append('aired', JSON.stringify({
        from: editForm.aired_from ? new Date(editForm.aired_from) : undefined,
        to: editForm.aired_to ? new Date(editForm.aired_to) : undefined,
        string: editForm.aired_string,
      }));
      formData.append('duration', editForm.duration);
  formData.append('totalEpisodes', editForm.totalEpisodes ? String(parseInt(editForm.totalEpisodes)) : '');
      if (validSeasons.includes(editForm.season)) {
        formData.append('season', editForm.season);
      }
  formData.append('year', editForm.year ? String(parseInt(editForm.year)) : '');
      formData.append('studio', editForm.studio);
      formData.append('director', editForm.director);
      formData.append('commentsEnabled', editForm.commentsEnabled ? 'true' : 'false');
      formData.append('featured', editForm.featured ? 'true' : 'false');
      formData.append('trending', editForm.trending ? 'true' : 'false');
      formData.append('banner', editForm.banner ? 'true' : 'false');
      formData.append('topAiring', editForm.topAiring ? 'true' : 'false');
      formData.append('topWeek', editForm.topWeek ? 'true' : 'false');
      formData.append('forYou', editForm.forYou ? 'true' : 'false');
      formData.append('watchLinks', JSON.stringify(editForm.watchLinks));
      // Screenshot files only
      if (screenshotFiles.length > 0) {
        screenshotFiles.forEach((file) => {
          formData.append('images', file);
        });
      }
      await axios.put(`/api/anime/${selectedAnime._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refresh details
      const res = await axios.get(`/api/anime/${selectedAnime._id}`);
      setSelectedAnime(res.data);
      setEditMode(false);
      setScreenshotFiles([]);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update anime');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete button handler
  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedAnime) return;
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/anime/${selectedAnime._id}`);
      // Refresh anime list
      setDetailsModalOpen(false);
      setDeleteConfirm(false);
      setSelectedAnime(null);
      // Refetch list
      setLoading(true);
      const statsRes = await axios.get('/api/admin/dashboard');
      setTotalAnime(statsRes.data?.stats?.totalAnime ?? 0);
      const res = await axios.get(`/api/anime?limit=${pageSize}&page=${page}&search=${encodeURIComponent(search)}`);
      setAnimeList(res.data.anime || []);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete anime');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeleteConfirm(false);
  };

  const totalPages = Math.max(1, Math.ceil(totalAnime / pageSize));

  return (
    <div className="w-full max-w-6xl mx-auto mt-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Content Management</h1>
          <div className="text-gray-500 mt-1 text-sm">Overview and management for all anime resources.</div>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-medium transition-transform transform hover:scale-[1.01] shadow-lg">
          <Settings className="w-4 h-4" />
          Global Settings
        </button>
      </div>
      <div className="flex gap-6 mb-8">
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-5xl font-extrabold text-purple-600">{totalAnime ?? '--'}</span>
          <span className="text-lg text-gray-700 mt-2">Total Anime</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-600">Anime List</h2>
          <input
            type="text"
            placeholder="Search by anime name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-purple-400"
            style={{ minWidth: 220 }}
          />
        </div>
        {loading ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm animate-pulse">
              <thead>
                <tr className="bg-purple-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Cover</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Genres</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(pageSize)].map((_, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 font-bold text-gray-300">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-2">
                      <div className="w-12 h-16 rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-4 w-12 bg-gray-200 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Cover</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Genres</th>
                  <th className="px-4 py-2 text-left">Rating</th>
                </tr>
              </thead>
              <tbody>
                {animeList.map((anime, idx) => (
                  <tr
                    key={anime._id}
                    className="hover:bg-purple-100 cursor-pointer"
                    onClick={() => handleAnimeClick(anime._id)}
                  >
                    <td className="px-4 py-2 font-bold text-gray-500">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-2">
                      {anime.coverImage ? (
                        <img src={anime.coverImage} alt={anime.title} className="w-12 h-16 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-16 rounded bg-gray-200 flex items-center justify-center text-gray-500">?</div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-semibold">{anime.title}</td>
                    <td className="px-4 py-2">{anime.genres?.join(', ') ?? '--'}</td>
                    <td className="px-4 py-2">{anime.rating ?? '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination controls */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-semibold disabled:opacity-50 transition-transform hover:bg-purple-200 hover:scale-105"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span className="px-4 py-1 rounded bg-purple-600 text-white font-semibold select-none">{page}</span>
          <button
            className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-semibold disabled:opacity-50 transition-transform hover:bg-purple-200 hover:scale-105"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>

        {/* Floating Anime Details Modal */}
        {detailsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fade-in" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-purple-600 text-xl font-bold"
                onClick={() => setDetailsModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              {detailsLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse mb-4" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : selectedAnime ? (
                <>
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-shrink-0">
                      {selectedAnime.coverImage ? (
                        <img src={selectedAnime.coverImage} alt={selectedAnime.title} className="w-40 h-56 rounded-xl object-cover shadow" />
                      ) : (
                        <div className="w-40 h-56 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">?</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-purple-700 mb-2">{selectedAnime.title}</h2>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">Genres:</span> {selectedAnime.genres?.join(', ') ?? '--'}</div>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">Rating:</span> {selectedAnime.rating ?? '--'}</div>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">Episodes:</span> {selectedAnime.episodes ?? '--'}</div>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">Status:</span> {selectedAnime.status ?? '--'}</div>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">Start Date:</span> {selectedAnime.startDate ? new Date(selectedAnime.startDate).toLocaleDateString() : '--'}</div>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">End Date:</span> {selectedAnime.endDate ? new Date(selectedAnime.endDate).toLocaleDateString() : '--'}</div>
                      <div className="mb-2 text-gray-700"><span className="font-semibold">Description:</span> <span className="block mt-1 text-gray-600">{selectedAnime.description ?? '--'}</span></div>
                      {selectedAnime.trailerUrl && (
                        <div className="mt-4">
                          <a href={selectedAnime.trailerUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">Watch Trailer</a>
                        </div>
                      )}
                      {selectedAnime.screenshots && selectedAnime.screenshots.length > 0 && (
                        <div className="mt-4">
                          <div className="font-semibold mb-1">Screenshots:</div>
                          <div className="flex gap-2 flex-wrap">
                            {selectedAnime.screenshots.map((url: string, i: number) => (
                              <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="w-24 h-16 object-cover rounded shadow" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Management Actions */}
                  <div className="flex gap-4 mt-8 justify-end">
                    <button
                      className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow"
                      onClick={handleEditClick}
                      disabled={editLoading || deleteLoading}
                    >
                      Edit
                    </button>
                    <button
                      className="px-5 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow"
                      onClick={() => setDummyEditOpen(true)}
                      disabled={editLoading || deleteLoading}
                    >
                      Edit Dummy Likes/Views
                    </button>
                    <button
                      className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 shadow"
                      onClick={handleDeleteClick}
                      disabled={editLoading || deleteLoading}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Dummy Likes/Views Modal */}
                  {typeof setDummyEditOpen !== 'undefined' && dummyEditOpen && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
                      <form
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative"
                        style={{ maxHeight: '60vh', overflowY: 'auto' }}
                        onSubmit={handleDummyEditSubmit}
                      >
                        <button
                          type="button"
                          className="absolute top-4 right-4 text-gray-500 hover:text-blue-600 text-xl font-bold"
                          onClick={() => setDummyEditOpen(false)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-blue-700">Edit Dummy Likes/Views</h3>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Dummy Likes</label>
                          <input name="dummyLikes" type="number" min="0" value={dummyEditForm.dummyLikes || ''} onChange={handleDummyEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Dummy Views</label>
                          <input name="dummyViews" type="number" min="0" value={dummyEditForm.dummyViews || ''} onChange={handleDummyEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow mt-2" disabled={editLoading}>
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Edit Form Modal */}
                  {editMode && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
                      <form
                        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 relative"
                        style={{ maxHeight: '80vh', overflowY: 'auto' }}
                        onSubmit={handleEditSubmit}
                      >
                        <button
                          type="button"
                          className="absolute top-4 right-4 text-gray-500 hover:text-purple-600 text-xl font-bold"
                          onClick={() => setEditMode(false)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-purple-700">Edit Anime</h3>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Title</label>
                          <input name="title" value={editForm.title} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" required />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">English Title</label>
                          <input name="title_english" value={editForm.title_english} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Japanese Title</label>
                          <input name="title_japanese" value={editForm.title_japanese} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Title Synonyms (comma separated)</label>
                          <input name="title_synonyms" value={editForm.title_synonyms} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Alternative Titles (comma separated)</label>
                          <input name="alternativeTitles" value={editForm.alternativeTitles} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Description</label>
                          <textarea name="description" value={editForm.description} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" rows={3} />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Background</label>
                          <textarea name="background" value={editForm.background} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" rows={2} />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
                          <input name="tags" value={editForm.tags} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Genres (comma separated)</label>
                          <input name="genres" value={editForm.genres} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Cover Image URL</label>
                          <input name="coverImage" value={editForm.coverImage} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Banner Image URL</label>
                          <input name="bannerImage" value={editForm.bannerImage} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Upload Screenshot Files</label>
                          <input type="file" multiple accept="image/*" onChange={handleScreenshotFilesChange} />
                          {screenshotFiles.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">{screenshotFiles.length} file(s) selected</div>
                          )}
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Trailer URL</label>
                          <input name="trailerUrl" value={editForm.trailerUrl} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3 flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Dummy Likes</label>
                            <input name="dummyLikes" type="number" min="0" value={editForm.dummyLikes || ''} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-semibold mb-1">Dummy Views</label>
                            <input name="dummyViews" type="number" min="0" value={editForm.dummyViews || ''} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Producers (comma separated)</label>
                          <input name="producers" value={editForm.producers} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Studios (comma separated)</label>
                          <input name="studios" value={editForm.studios} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Licensors (comma separated)</label>
                          <input name="licensors" value={editForm.licensors} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Aired From</label>
                          <input name="aired_from" value={editForm.aired_from} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" type="date" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Aired To</label>
                          <input name="aired_to" value={editForm.aired_to} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" type="date" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Aired String</label>
                          <input name="aired_string" value={editForm.aired_string} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Duration</label>
                          <input name="duration" value={editForm.duration} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Total Episodes</label>
                          <input name="totalEpisodes" value={editForm.totalEpisodes} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" type="number" min="0" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Status</label>
                          <input name="status" value={editForm.status} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Season</label>
                          <input name="season" value={editForm.season} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Year</label>
                          <input name="year" value={editForm.year} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" type="number" min="0" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Studio</label>
                          <input name="studio" value={editForm.studio} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-semibold mb-1">Director</label>
                          <input name="director" value={editForm.director} onChange={handleEditFormChange} className="w-full border rounded px-3 py-2" />
                        </div>
                        <div className="mb-3 flex gap-4 flex-wrap">
                          <label className="flex items-center gap-2"><input type="checkbox" name="commentsEnabled" checked={!!editForm.commentsEnabled} onChange={handleEditFormChange} /> Comments Enabled</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="featured" checked={!!editForm.featured} onChange={handleEditFormChange} /> Featured</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="trending" checked={!!editForm.trending} onChange={handleEditFormChange} /> Trending</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="banner" checked={!!editForm.banner} onChange={handleEditFormChange} /> Banner</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="topAiring" checked={!!editForm.topAiring} onChange={handleEditFormChange} /> Top Airing</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="topWeek" checked={!!editForm.topWeek} onChange={handleEditFormChange} /> Top Week</label>
                          <label className="flex items-center gap-2"><input type="checkbox" name="forYou" checked={!!editForm.forYou} onChange={handleEditFormChange} /> For You</label>
                        </div>
                        <button type="submit" className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow mt-2" disabled={editLoading}>
                          {editLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Delete Confirmation Modal */}
                  {deleteConfirm && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Delete Anime</h3>
                        <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{selectedAnime.title}</span>? This action cannot be undone.</p>
                        <div className="flex gap-4 justify-end">
                          <button className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold" onClick={handleDeleteCancel} disabled={deleteLoading}>Cancel</button>
                          <button className="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                            {deleteLoading ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500">No details available.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContentManagement;
