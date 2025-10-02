import React from 'react';

interface AdminPostModalProps {
  post: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onBoostLikes: () => void;
}

const AdminPostModal: React.FC<AdminPostModalProps> = ({ post, onClose, onEdit, onDelete, onBoostLikes }) => {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <div className="text-gray-600 text-sm mb-2">By {post.user?.username} • {new Date(post.createdAt).toLocaleString()}</div>
        <div className="mb-4">{post.content}</div>
        {post.images && post.images.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {post.images.map((img: string, idx: number) => (
              <img key={idx} src={img} alt="media" className="w-24 h-24 object-cover rounded" />
            ))}
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onEdit}>Edit</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={onDelete}>Delete</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={onBoostLikes}>Boost Likes</button>
        </div>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Comments</h3>
          {/* Comments rendering placeholder */}
          <div className="text-gray-400 text-sm">(Comments will be shown here)</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPostModal;
