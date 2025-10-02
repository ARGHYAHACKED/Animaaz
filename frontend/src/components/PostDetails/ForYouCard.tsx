// ...existing code...
import { Link } from 'react-router-dom';

const ForYouCard = ({ post }: { post: any }) => {
  const loveCount = (post.reactions || []).filter((r: any) => r.type === 'love').length;
  return (
    <Link to={`/posts/${post._id}`} className="block">
      <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-1">
          {post.user?.avatar ? (
            <img src={post.user.avatar} alt={post.user.username || 'User'} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {post.user?.username?.charAt(0) || 'U'}
            </div>
          )}
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{post.user?.username || 'User'}</span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}</span>
          </div>
        </div>
        <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1 line-clamp-1">{post.title || 'Untitled Discussion'}</div>
        <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{post.content}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-pink-500 text-base">❤️</span>
          <span className="text-xs text-gray-700 dark:text-gray-300">{loveCount}</span>
        </div>
      </div>
    </Link>
  );
};

export default ForYouCard;
