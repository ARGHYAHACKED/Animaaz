import React from 'react';

interface AdminPostCardProps {
  post: any;
  onClick: () => void;
}

const AdminPostCard: React.FC<AdminPostCardProps> = ({ post, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:shadow-lg transition" onClick={onClick}>
      <div className="flex items-center gap-3 mb-2">
        <img src={post.user?.avatar || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        <span className="font-semibold">{post.user?.username}</span>
        <span className="text-gray-400 text-xs ml-2">{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      <div className="font-bold text-lg mb-1">{post.title}</div>
      <div className="text-gray-700 mb-2 line-clamp-2">{post.content}</div>
      {post.images && post.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {post.images.slice(0, 2).map((img: string, idx: number) => (
            <img key={idx} src={img} alt="media" className="w-16 h-16 object-cover rounded" />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPostCard;
