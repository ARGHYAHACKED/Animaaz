import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Anime } from '../types';
import api from '../utils/api';
import AnimeCard from '../components/AnimeCard'; // Assuming AnimeCard exists

const MostPopular: React.FC = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get('/anime/popular');
        setAnimeList(res.data || []);
      } catch (err: any) {
        setError('Failed to fetch most popular anime.');
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  if (loading) return <div className="text-center py-20 text-xl font-semibold text-purple-500">Loading...</div>;
  if (error) return <div className="text-center py-20 text-xl font-semibold text-red-600 border border-red-300 bg-red-50 p-4 rounded-lg mx-auto max-w-lg">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50 dark:bg-gray-900 min-h-screen shadow-2xl rounded-xl mt-6">
      <div className="flex items-center justify-between mb-10 pb-4 border-b-4 border-purple-500/50">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white flex items-center tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-8a1 1 0 000 2h2a1 1 0 100-2h-2z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M10 16a6 6 0 100-12 6 6 0 000 12zm0-9a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Most Popular Anime
        </h1>
        <Link
          to="/"
          className="px-4 py-2 text-sm font-semibold rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl dark:bg-purple-500 dark:hover:bg-purple-400"
        >
          ← Back to Home
        </Link>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
        {animeList.map((anime) => (
          // KEY CHANGE 1: Set a fixed height for the card wrapper
          // We use 'h-[420px]' or similar, adjust this value based on your desired card height.
          // The 'relative' class is important for child absolute positioning if needed.
          <div 
            key={anime._id} 
            className="flex flex-col h-[420px] overflow-hidden transition-transform duration-300 hover:scale-[1.03] shadow-md hover:shadow-xl rounded-lg bg-gray-800 dark:bg-gray-800 relative"
          >
            {/* KEY CHANGE 2: AnimeCard should have `flex-grow` or `flex-auto` if it's a flex item,
              and inside AnimeCard, ensure description has text-overflow ellipsis.
              I'm adding a specific class `anime-card-uniform-height` here,
              which you MUST use within your `AnimeCard` component's description element.
            */}
            <AnimeCard anime={anime} classNameForDescription="anime-card-uniform-height" />
          </div>
        ))}
      </div>
      
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
        Results powered by the /anime/popular API endpoint.
      </div>
    </div>
  );
};

export default MostPopular;