import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AdminPostCard from '../components/Admin/AdminPostCard';
import AdminPostModal from '../components/Admin/AdminPostModal';


const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<'newest'|'oldest'>('newest');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { limit: 50 };
      if (search) params.search = search;
      // Sorting: newest = createdAt desc, oldest = createdAt asc
      params.sort = sort === 'newest' ? '-createdAt' : 'createdAt';
      const res = await api.get('/community/posts', { params });
      setPosts(res.data.posts || []);
    } catch (err: any) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/community/posts/${selectedPost._id}`);
      setPosts(posts.filter(p => p._id !== selectedPost._id));
      setSelectedPost(null);
    } catch (err: any) {
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Posts</h1>
      <form className="flex gap-2 mb-4" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search posts..."
          className="border rounded px-3 py-2 w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Search</button>
        <select
          className="border rounded px-2 py-2 ml-4"
          value={sort}
          onChange={e => setSort(e.target.value as 'newest'|'oldest')}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </form>
      {loading && <div>Loading posts...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div>
        {posts.map(post => (
          <AdminPostCard key={post._id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>
      {selectedPost && (
        <AdminPostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={() => {}}
          onDelete={handleDelete}
          onBoostLikes={() => {}}
        />
      )}
    </div>
  );
};

export default AdminPosts;
