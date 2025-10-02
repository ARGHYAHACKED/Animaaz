import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Anime } from '../types';
import AnimeCard from '../components/AnimeCard';

const Genre: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/anime', { params: { genre: name, limit: 30 } });
        setAnime(res.data.anime || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [name]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{name} Anime</h1>
        <Link to="/" className="text-purple-600 dark:text-purple-400 hover:underline">Home</Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {anime.map((a) => (
            <AnimeCard key={a._id} anime={a} />
          ))}
          {anime.length === 0 && (
            <div className="col-span-full text-center opacity-70">No anime found for this genre.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Genre;


