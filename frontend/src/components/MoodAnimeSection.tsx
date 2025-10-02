import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AnimeCard from '../components/AnimeCard';
import { Anime } from '../types';

const MoodAnimeSection: React.FC = () => {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodAnime = async () => {
      setLoading(true);
      try {
        const res = await api.get('/mood/feel-good-vibes'); // "happy" mood
        setAnime(res.data.anime || []);
      } catch (err) {
        setAnime([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMoodAnime();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-pink-500 flex items-center gap-2">
          😊 Random Happy Anime
        </h2>
        <a
          href="/mood/feel-good-vibes"
          className="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow hover:scale-105 transition-transform text-sm"
        >
          View All
        </a>
      </div>``
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse h-72" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {anime.map((a) => (
            <AnimeCard key={a._id} anime={a} />
          ))}
        </div>
      )}
    </section>
  );
};

export default MoodAnimeSection;
