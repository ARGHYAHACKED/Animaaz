
import React, { useState, useRef, useEffect } from 'react';

interface AnimeEditModalProps {
  open: boolean;
  onClose: () => void;
  anime: any;
  onSave: (data: any) => void;
}

const initialState = {
  title: '',
  alternativeTitles: '',
  description: '',
  tags: '',
  genres: '',
  coverImage: null,
  bannerImage: null,
  images: [],
  status: 'upcoming',
  year: '',
  studio: '',
  director: '',
  totalEpisodes: '',
  trailerYoutubeId: '',
  commentsEnabled: true,
  featured: false,
  trending: false,
  banner: false
};

const AnimeEditModal: React.FC<AnimeEditModalProps> = ({ open, onClose, anime, onSave }) => {
  const [form, setForm] = useState<any>(initialState);
  const [ssFiles, setSsFiles] = useState<FileList | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [bannerImageUrl, setBannerImageUrl] = useState<string>('');

  useEffect(() => {
    if (anime) {
      setForm({
        ...initialState,
        ...anime,
        alternativeTitles: (anime.alternativeTitles || []).join(', '),
        tags: (anime.tags || []).join(', '),
        genres: (anime.genres || []).join(', '),
        year: anime.year || '',
        totalEpisodes: anime.totalEpisodes || '',
        trailerYoutubeId: anime.trailer?.youtube_id || '',
      });
    } else {
      setForm(initialState);
    }
  setSsFiles(null);
  setCoverFile(null);
  setBannerFile(null);
  setBannerImageUrl(anime?.bannerImage || '');
  }, [anime, open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'coverImage' && files && files[0]) setCoverFile(files[0]);
    if (name === 'bannerImage' && files && files[0]) setBannerFile(files[0]);
    if (name === 'images' && files) setSsFiles(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare data for backend
    const nextErrors: string[] = [];
    if (!form.title.trim()) nextErrors.push('Title is required');
    if (!form.description.trim()) nextErrors.push('Description is required');
    if (!anime && !coverFile) nextErrors.push('Cover image is required for new anime');
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;

    const data: any = { ...form };
    data.alternativeTitles = form.alternativeTitles.split(',').map((s: string) => s.trim()).filter(Boolean);
    data.tags = form.tags.split(',').map((s: string) => s.trim()).filter(Boolean);
    data.genres = form.genres.split(',').map((s: string) => s.trim()).filter(Boolean);
    data.year = form.year ? parseInt(form.year) : undefined;
    data.totalEpisodes = form.totalEpisodes ? parseInt(form.totalEpisodes) : undefined;
    data.trailer = { youtube_id: form.trailerYoutubeId };
    if (coverFile) data.coverImage = coverFile;
    if (bannerFile) {
      data.bannerImage = bannerFile;
    } else if (bannerImageUrl && typeof bannerImageUrl === 'string') {
      data.bannerImage = bannerImageUrl;
    }
    if (ssFiles) data.images = Array.from(ssFiles);
    console.log('Submitting anime edit data:', data);
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 sm:px-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-2xl relative text-gray-900 dark:text-white overflow-y-auto max-h-[95vh]">
        <button type="button" onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">&times;</button>
        <h2 className="text-xl font-bold mb-4">{anime ? 'Edit Anime' : 'Add Anime'}</h2>
        {errors.length > 0 && (
          <div className="mb-4 p-3 rounded bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
            <ul className="list-disc ml-5">
              {errors.map((err, i) => (<li key={i}>{err}</li>))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Title *</label>
            <input name="title" required className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.title} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Alternative Titles</label>
            <input name="alternativeTitles" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.alternativeTitles} onChange={handleChange} placeholder="Comma separated" />
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1">Description *</label>
            <textarea name="description" required rows={3} className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.description} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Tags</label>
            <input name="tags" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.tags} onChange={handleChange} placeholder="Comma separated" />
          </div>
          <div>
            <label className="block mb-1">Genres</label>
            <input name="genres" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.genres} onChange={handleChange} placeholder="Comma separated" />
          </div>
          <div>
            <label className="block mb-1">Year</label>
            <input name="year" type="number" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.year} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Status</label>
            <select name="status" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.status} onChange={handleChange}>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Studio</label>
            <input name="studio" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.studio} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Director</label>
            <input name="director" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.director} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Total Episodes</label>
            <input name="totalEpisodes" type="number" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.totalEpisodes} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Trailer YouTube ID</label>
            <input name="trailerYoutubeId" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={form.trailerYoutubeId} onChange={handleChange} />
          </div>
          <div>
            <label className="block mb-1">Cover Image *</label>
            <input name="coverImage" type="file" accept="image/*" className="w-full text-gray-900 dark:text-white" onChange={handleFile} />
            {anime?.coverImage && !coverFile && (
              <img src={anime.coverImage} alt="cover" className="mt-2 h-16 rounded" />
            )}
            {coverFile && (
              <span className="block mt-2 text-xs">{coverFile.name}</span>
            )}
          </div>
          <div>
            <label className="block mb-1">Banner Image (Upload or URL)</label>
            <input name="bannerImage" type="file" accept="image/*" className="w-full text-gray-900 dark:text-white mb-2" onChange={handleFile} />
            <input
              type="text"
              className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300 mb-2"
              placeholder="Banner image URL"
              value={bannerImageUrl}
              onChange={e => {
                setBannerImageUrl(e.target.value);
                setBannerFile(null);
              }}
            />
            {bannerImageUrl && !bannerFile && (
              <img src={bannerImageUrl} alt="banner preview" className="mt-2 h-16 rounded" />
            )}
            {bannerFile && (
              <span className="block mt-2 text-xs">{bannerFile.name}</span>
            )}
          </div>
          <div className="sm:col-span-2">
            <label className="block mb-1">Screenshots</label>
            <input name="images" type="file" accept="image/*" multiple className="w-full text-gray-900 dark:text-white" onChange={handleFile} />
            {anime?.images && Array.isArray(anime.images) && anime.images.length > 0 && !ssFiles && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {anime.images.map((img: string, i: number) => (
                  <img key={i} src={img} alt="ss" className="h-12 rounded" />
                ))}
              </div>
            )}
            {ssFiles && (
              <span className="block mt-2 text-xs">{Array.from(ssFiles).map(f => f.name).join(', ')}</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2 mt-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="commentsEnabled" checked={form.commentsEnabled} onChange={handleChange} /> Comments Enabled
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} /> Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="trending" checked={form.trending} onChange={handleChange} /> Trending
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="banner" checked={form.banner} onChange={handleChange} /> Banner
            </label>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-6">
          <button type="submit" className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" disabled={(!form.title.trim()) || (!form.description.trim()) || (!anime && !coverFile)}>
            Save
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white w-full sm:w-auto">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AnimeEditModal;
