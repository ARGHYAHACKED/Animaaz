import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { parseSpoilers } from '../../utils/parseSpoilers';

interface PostCardProps {
  p: any;
  user?: { id: string } | null;
  onLike: () => void;
  onTagClick: (tag: string) => void;
}

const PostCard = ({ p, user, onLike, onTagClick }: PostCardProps) => {
  // Debug: log like count for each post
  ('Post:', p._id, 'Likes:', Array.isArray(p.likes) ? p.likes.length : 0, 'Likes array:', p.likes);
  // --- Read More/Show Less state ---
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  useEffect(() => {
    if (contentRef.current) {
      // Check if content is actually clamped (overflows 2 lines)
      const el = contentRef.current;
      setIsClamped(el.scrollHeight > el.clientHeight + 2); // +2 for rounding
    }
  }, [p.content]);
  const hasSpoiler = !!p.spoiler;
  const isManga = p.type === 'manga';
  const navigate = useNavigate();
  const goToPost = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on username (profile link)
    const target = e.target as HTMLElement;
    if (target.closest('.user-link')) return;
    navigate(`/posts/${p._id}`);
  };
  // For spoiler images: track reveal state per image
  const [revealedImages, setRevealedImages] = useState<boolean[]>(() => Array.isArray(p.images) ? p.images.map(() => false) : []);
  useEffect(() => {
    // Reset reveal state if post changes
    setRevealedImages(Array.isArray(p.images) ? p.images.map(() => false) : []);
  }, [p._id]);
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2 cursor-pointer hover:bg-green-50 dark:hover:bg-gray-900 transition-colors"
      onClick={goToPost}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') goToPost(e as any); }}
    >
      {/* Spoiler badge at the top if spoiler */}
      {hasSpoiler && (
        <div className="flex justify-center mb-2">
          <span className="px-3 py-1 rounded-full bg-yellow-300 text-yellow-900 text-sm font-bold shadow flex items-center gap-2">
            <span className="text-lg">⚠️</span> Spoiler
          </span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <img
          src={p.user?.avatar || '/default-avatar.png'}
          alt="avatar"
          className="w-11 h-11 rounded-full object-cover user-link"
          onClick={e => e.stopPropagation()}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">
              <Link
                to={p.user?._id ? `/profile/${p.user._id}` : '#'}
                className="hover:underline user-link"
                onClick={e => e.stopPropagation()}
              >
                {p.user?.username || 'User'}
              </Link>
            </span>
            <span className="text-xs opacity-60">{new Date(p.createdAt).toLocaleString()}</span>
            {hasSpoiler && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 text-xs font-semibold flex items-center gap-1">
                <span className="text-base">★</span> Spoiler
              </span>
            )}
            {isManga && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-200 text-purple-800 text-xs font-semibold flex items-center gap-1">
                <span className="text-base">📚</span> Manga
              </span>
            )}
          </div>
          <div
            className="font-bold text-lg mb-1 hover:underline cursor-pointer"
            onClick={e => { e.stopPropagation(); navigate(`/posts/${p._id}`); }}
          >
            {p.title}
          </div>
          {/* --- Description/content with Read More/Show Less --- */}
          <div className="mb-2 text-sm break-words text-gray-700 dark:text-gray-200">
            <div
              ref={contentRef}
              className={
                expanded
                  ? ''
                  : 'line-clamp-2'
              }
              style={{ display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {parseSpoilers(p.content || '')}
            </div>
            {/* Read More/Show Less link */}
            {!expanded && isClamped && (
              <button
                type="button"
                className="ml-1 text-green-500 hover:underline focus:outline-none text-xs font-semibold"
                style={{ color: '#10b981' }}
                onClick={e => { e.stopPropagation(); setExpanded(true); }}
              >
                Read More
              </button>
            )}
            {expanded && (
              <button
                type="button"
                className="ml-1 text-green-500 hover:underline focus:outline-none text-xs font-semibold"
                style={{ color: '#10b981' }}
                onClick={e => { e.stopPropagation(); setExpanded(false); }}
              >
                Show Less
              </button>
            )}
          </div>
          {Array.isArray(p.tags) && p.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {p.tags.map((tag: string) => (
                <span key={tag} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs cursor-pointer hover:bg-green-200 dark:hover:bg-green-800" onClick={e => { e.stopPropagation(); onTagClick(tag); }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      {Array.isArray(p.images) && p.images.length > 0 && (
        <div className="w-full flex flex-col gap-2">
          {p.images.map((url: string, idx: number) => {
            if (hasSpoiler) {
              const revealed = revealedImages[idx];
              return (
                <div key={idx} className="relative w-full">
                  <img
                    src={url}
                    alt="post"
                    className={`rounded-xl object-cover w-full max-h-96 cursor-pointer transition-all duration-300 ${revealed ? '' : 'blur-md brightness-75'}`}
                    onClick={e => {
                      e.stopPropagation();
                      if (!revealed) {
                        setRevealedImages(arr => arr.map((v, i) => i === idx ? true : v));
                      } else {
                        navigate(`/posts/${p._id}`);
                      }
                    }}
                    title={revealed ? undefined : 'Click to reveal spoiler image'}
                  />
                  {!revealed && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-yellow-300 text-yellow-900 px-3 py-1 rounded-full font-bold shadow">Spoiler Image - Click to Reveal</span>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <img
                  key={idx}
                  src={url}
                  alt="post"
                  className="rounded-xl object-cover w-full max-h-96 cursor-pointer"
                  onClick={e => { e.stopPropagation(); navigate(`/posts/${p._id}`); }}
                />
              );
            }
          })}
        </div>
      )}
      <div className="flex items-center justify-end gap-6 mt-2 border-t pt-2">
        {/* Love react and like count */}
        <button
          type="button"
          className="flex items-center gap-1 font-semibold focus:outline-none hover:scale-110 transition-transform"
          onClick={e => { e.stopPropagation(); onLike(); }}
          aria-label={Array.isArray(p.likes) && user && p.likes.some((l: any) => l.user === user.id) ? 'Unlike' : 'Like'}
        >
          {Array.isArray(p.likes) && user && p.likes.some((l: any) => l.user === user.id) ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ec4899" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ec4899" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 00-7.6 0l-.835.836-.835-.836a5.373 5.373 0 00-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 000-7.6z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ec4899" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 00-7.6 0l-.835.836-.835-.836a5.373 5.373 0 00-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 000-7.6z" />
            </svg>
          )}
          <span className="text-pink-600 dark:text-pink-400">{Array.isArray(p.likes) ? p.likes.length : 0}</span>
        </button>
        {/* Comments count */}
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-300">
          <span className="text-lg">💬</span>
          <span>{Array.isArray(p.comments) ? p.comments.length : 0}</span>
        </div>
      </div>
    </div>
  );
};
// };

export default PostCard;
