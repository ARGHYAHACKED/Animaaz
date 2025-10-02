import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Star, Play } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  classNameForDescription?: string;
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const totalLikes = (anime.likes?.length ?? 0) + (anime.dummyLikes ?? 0);
  const totalViews = (anime.views ?? 0) + (anime.dummyViews ?? 0);

  return (
    <Link to={`/anime/${anime._id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 transform">
        <div className="relative">
          <img
            src={anime.coverImage}
            alt={anime.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>{totalLikes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
            {anime.status === 'ongoing' && '📺 Ongoing'}
            {anime.status === 'completed' && '✅ Completed'}
            {anime.status === 'upcoming' && '🔜 Upcoming'}
          </div>
          {anime.rating > 0 && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded flex items-center space-x-1 text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span>{anime.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-purple-600 text-white rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Play className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {anime.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
            {anime.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {(anime.genres ?? []).slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
            {(anime.genres?.length ?? 0) > 2 && (
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                +{(anime.genres?.length ?? 0) - 2}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{anime.year ?? ''}</span>
            <span>{(anime.totalEpisodes ?? 0) > 0 ? `${anime.totalEpisodes} eps` : 'TBA'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AnimeCard;