
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AnimeCard from '../components/AnimeCard';
import { Link } from 'react-router-dom';

const TopAiring: React.FC = () => {
  const [topAiring, setTopAiring] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurated = async () => {
      setLoading(true);
      try {
        const [topAiringRes, trendingRes] = await Promise.all([
          api.get('/curation/topAiring'),
          api.get('/curation/trending'),
        ]);
        setTopAiring(topAiringRes.data.animeIds || []);
        setTrending(trendingRes.data.animeIds || []);
      } catch (error) {
        setTopAiring([]);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCurated();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Top Airing & Trending Anime</h1>
        <Link to="/" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">Back to Home</Link>
      </div>
      {loading ? (
        <div className="opacity-70">Loading...</div>
      ) : (
        <>
          <h2 className="text-xl font-bold mt-8 mb-2">Top Airing</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {topAiring.length === 0 ? (
              <div className="col-span-full text-blue-600">No curated Top Airing anime.</div>
            ) : (
              topAiring.map((a) => <AnimeCard key={a._id} anime={a} />)
            )}
          </div>
          <h2 className="text-xl font-bold mt-8 mb-2">Trending</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.length === 0 ? (
              <div className="col-span-full text-blue-600">No curated Trending anime.</div>
            ) : (
              trending.map((a) => <AnimeCard key={a._id} anime={a} />)
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TopAiring;
