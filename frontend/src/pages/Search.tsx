import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AnimeCard from '../components/AnimeCard';

const Search: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState<'created' | 'views' | 'rating' | 'title'>('created');
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(true);
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [genres, setGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add refs to track if we should update the URL or if state was just set from URL
  const isInitialMount = useRef(true);
  const justSetFromUrl = useRef(false);

  const fetchGenres = async () => {
    const res = await api.get('/anime/genres');
    setGenres(res.data);
  };

  const fetchAnime = async () => {
    setLoading(true);
    try {
      const res = await api.get('/anime', { 
        params: { 
          page, 
          limit: 20, // Changed from 200 to 20 to match pagination
          search: q || undefined, 
          genre: genre || undefined, 
          sort: sort === 'created' ? undefined : sort 
        } 
      });
      setList(res.data.anime || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching anime:', error);
      setList([]);
      setTotal(0);
    }
    setLoading(false);
  };

  // Initialize from URL - only runs when URL changes
  useEffect(() => {
    const initialQ = params.get('q') || '';
    const initialGenre = params.get('genre') || '';
    const initialSort = (params.get('sort') as any) || 'created';
    const initialPage = parseInt(params.get('page') || '1', 10);

    setReady(false);
    justSetFromUrl.current = true;
    setQ(initialQ);
    setGenre(initialGenre);
    setSort(['created','views','rating','title'].includes(initialSort) ? initialSort : 'created');
    setPage(isNaN(initialPage) ? 1 : initialPage);
    // Wait for all state to be set, then set ready
    setTimeout(() => setReady(true), 0);
  }, [location.search]);

  // Fetch genres on mount
  useEffect(() => { 
    fetchGenres(); 
  }, []);

  // Fetch anime when filters change and ready
  useEffect(() => { 
    if (ready) fetchAnime(); 
  }, [q, genre, sort, page, ready]);

  // Keep URL in sync - with proper checks to prevent infinite loop
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Skip if state was just set from URL
    if (justSetFromUrl.current) {
      justSetFromUrl.current = false;
      return;
    }

    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (genre) next.set('genre', genre);
    if (sort && sort !== 'created') next.set('sort', sort);
    if (page && page !== 1) next.set('page', String(page));

    const newSearch = next.toString();
    const currentSearch = location.search.replace(/^\?/, '');

    // Only update if the search string actually changed
    if (newSearch !== currentSearch) {
      navigate({ pathname: '/search', search: newSearch ? `?${newSearch}` : '' }, { replace: true });
    }
  }, [q, genre, sort, page]);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-semibold mb-4">All Anime</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 order-2 lg:order-1">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-56 w-full flex flex-col">
                  <div className="h-32 w-full bg-gray-300 dark:bg-gray-800 rounded-t-lg" />
                  <div className="flex-1 p-3 flex flex-col gap-2">
                    <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No anime found. Try adjusting your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {list.map((a) => (
                <AnimeCard key={a._id} anime={a} />
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-6">
            <button 
              className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={page === 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <div className="opacity-80 text-sm">
              Page {page} of {Math.max(1, Math.ceil(total / 20))}
            </div>
            <button 
              className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={page >= Math.ceil(total / 20)} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
        <aside className="order-1 lg:order-2">
          {/* Genre filter only */}
          {/* <div className="p-4 rounded border dark:border-gray-700">
            <div className="font-medium mb-2">Genres</div>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => { setGenre(''); setPage(1); }} 
                className={`px-3 py-1 rounded-full text-sm ${genre === '' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                All
              </button>
              {genres.map((g) => (
                <button 
                  key={g} 
                  onClick={() => { setGenre(g); setPage(1); }} 
                  className={`px-3 py-1 rounded-full text-sm ${genre === g ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div> */}
        </aside>
      </div>
    </div>
  );
};

export default Search;