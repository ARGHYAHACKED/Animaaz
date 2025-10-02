
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parseSpoilers } from '../../utils/parseSpoilers';

const MangaCard = ({ manga }: { manga: any }) => {
  const firstLine = (manga.content || '').split(/\r?\n/)[0];
  const navigate = useNavigate();
  const goToPost = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on user avatar or username
    const target = e.target as HTMLElement;
    if (target.closest('.user-link')) return;
    navigate(`/posts/${manga._id}`);
  };
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2 relative cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-900 transition-colors"
      onClick={goToPost}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') goToPost(e as any); }}
    >
      {/* Manga pill badge always in top right */}
      <div className="absolute top-2 right-2 flex flex-wrap gap-1 z-10">
        <span className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <span role="img" aria-label="Manga">📚</span> Manga
        </span>
        {Array.isArray(manga.tags) && manga.tags.length > 0 && manga.tags.map((tag: string) => (
          <span key={tag} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-semibold">#{tag}</span>
        ))}
      </div>
      <div className="flex items-start gap-3">
        <Link
          to={manga.user?._id ? `/profile/${manga.user._id}` : '#'}
          className="user-link"
          onClick={e => e.stopPropagation()}
        >
          <img src={manga.user?.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              to={manga.user?._id ? `/profile/${manga.user._id}` : '#'}
              className="font-semibold text-base user-link hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {manga.user?.username || 'User'}
            </Link>
            <span className="text-xs opacity-60">{new Date(manga.createdAt).toLocaleString()}</span>
          </div>
          <div className="font-bold text-lg mb-1">{manga.title}</div>
          <div className="mb-2 text-sm break-words text-gray-700 dark:text-gray-200">
            {parseSpoilers(firstLine)}
          </div>
        </div>
      </div>
      {Array.isArray(manga.images) && manga.images.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {manga.images.map((url: string, idx: number) => (
            <img key={idx} src={url} alt="manga" className="rounded-xl object-cover w-full max-h-96" />
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 mt-2 border-t pt-2">
        <Link to={`/posts/${manga._id}`} className="flex items-center gap-1 px-3 py-1.5 rounded bg-purple-500 hover:bg-purple-600 text-white" onClick={e => e.stopPropagation()}>Read</Link>
      </div>
    </div>
  );
};

export default MangaCard;
