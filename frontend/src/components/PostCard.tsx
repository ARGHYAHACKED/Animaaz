import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Heart, Eye, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'discussion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'news':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'recommendation':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'meme':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'love': return '❤️';
      case 'laugh': return '😂';
      case 'angry': return '😠';
      case 'sad': return '😢';
      case 'wow': return '😮';
      default: return '';
    }
  };

  const reactionCounts = post.reactions.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.user.id}`}>
              {post.user.avatar ? (
                <img
                  src={post.user.avatar}
                  alt={post.user.username}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {post.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </Link>
            <div>
              <Link
                to={`/profile/${post.user.id}`}
                className="font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {post.user.username}
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                {post.group && (
                  <>
                    <span>•</span>
                    <Link
                      to={`/groups/${post.group._id}`}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {post.group.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPostTypeColor(post.type)}`}>
            {post.type}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        {post.title && (
          <Link to={`/posts/${post._id}`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {post.title}
            </h3>
          </Link>
        )}
        <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
          {post.content}
        </p>

        {/* Related Anime */}
        {post.relatedAnime && (
          <Link
            to={`/anime/${post.relatedAnime._id}`}
            className="inline-flex items-center space-x-2 mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <img
              src={post.relatedAnime.coverImage}
              alt={post.relatedAnime.title}
              className="w-8 h-8 rounded object-cover"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {post.relatedAnime.title}
            </span>
          </Link>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{post.likes.length}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">{post.comments.length}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{post.views}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Bookmark className="w-4 h-4" />
              <span className="text-sm">{post.bookmarks.length}</span>
            </div>
          </div>

          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex items-center space-x-1">
              {Object.entries(reactionCounts).slice(0, 3).map(([type, count]) => (
                <div key={type} className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{getReactionEmoji(type)}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <Link
            to={`/posts/${post._id}`}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors"
          >
            Read More →
          </Link>
          {post.isPinned && (
            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs px-2 py-1 rounded-full">
              📌 Pinned
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;