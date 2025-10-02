import React from 'react';
import { Link } from 'react-router-dom';

const ForYouCard = ({ post }: { post: any }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2">
    <div className="flex items-start gap-3">
      <img src={post.user?.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base">{post.user?.username || 'User'}</span>
          <span className="text-xs opacity-60">{new Date(post.createdAt).toLocaleString()}</span>
        </div>
        <div className="font-bold text-lg mb-1">{post.title}</div>
        <div className="mb-2 text-sm break-words text-gray-700 dark:text-gray-200">
          {(post.content || '').split(/\r?\n/)[0]}
        </div>
      </div>
    </div>
    <div className="flex items-center gap-4 mt-2 border-t pt-2">
      <Link to={`/posts/${post._id}`} className="flex items-center gap-1 px-3 py-1.5 rounded bg-green-500 hover:bg-green-600 text-white">View</Link>
    </div>
  </div>
);

export default ForYouCard;
