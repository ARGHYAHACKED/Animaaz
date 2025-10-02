import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import AnimeCard from '../components/AnimeCard';

const Featured: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      try {
        const res = await api.get('/curation/featured');
        setList(res.data.animeIds || []);
      } catch (error) {
        setList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Featured Anime</h1>
        <Link to="/" className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">Back to Home</Link>
      </div>
      {loading ? (
        <div className="opacity-70">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((a) => (
            <AnimeCard key={a._id} anime={a} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Featured;
