// ...existing code...
import { Link } from 'react-router-dom';

const AnimeRecCard = ({ anime }: { anime: any }) => {
  return (
    <Link to={`/anime/${anime._id}`} className="block">
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-4 items-center hover:shadow-lg transition-shadow">
        {anime.coverImage && (
          <img src={anime.coverImage} alt={anime.title} className="w-16 h-24 object-cover rounded-lg" />
        )}
        <div>
          <div className="font-semibold text-purple-700 dark:text-purple-300">{anime.title}</div>
          {anime.description && (
            <div className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{anime.description}</div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AnimeRecCard;
