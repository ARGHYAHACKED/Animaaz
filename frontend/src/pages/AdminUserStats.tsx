

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  password?: string;
  likedAnime?: Array<{ _id: string; title: string; coverImage?: string }>;
}

const AdminUserStats: React.FC = () => {
  const [stats, setStats] = useState<{ totalUsers: number; onlineUsers: number } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // ...existing code...
  const [likedAnime, setLikedAnime] = useState<any[]>([]);
  const [likedLoading, setLikedLoading] = useState(false);

  useEffect(() => {
    const fetchStatsAndUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsRes = await axios.get('/api/admin/user-stats');
        setStats(statsRes.data);
        const usersRes = await axios.get('/api/admin/users?limit=100');
        setUsers(usersRes.data.users || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch user stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStatsAndUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleInspect = async (user: User) => {
    setSelectedUser(user);
    setLikedLoading(true);
    try {
      const res = await axios.get(`/api/users/${user._id}/liked`);
      setLikedAnime(res.data);
    } catch (err) {
      setLikedAnime([]);
    } finally {
      setLikedLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-4">
      <h1 className="text-3xl font-extrabold mb-6 text-purple-700">User Stats</h1>
      <div className="flex gap-6 mb-8">
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-5xl font-extrabold text-purple-600">{stats?.totalUsers ?? '--'}</span>
          <span className="text-lg text-gray-700 mt-2">Total Users</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center">
          <span className="text-5xl font-extrabold text-green-600">{stats?.onlineUsers ?? '--'}</span>
          <span className="text-lg text-gray-700 mt-2">Online Users</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-600">User List</h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-purple-400"
            style={{ minWidth: 220 }}
          />
        </div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  <th className="px-4 py-2 text-left">Avatar</th>
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  {/* <th className="px-4 py-2 text-left">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-purple-100">
                    <td className="px-4 py-2">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?</div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-semibold">{user.username}</td>
                    <td className="px-4 py-2">{user.email}</td>
          
                    {/* <td className="px-4 py-2">--</td> */}
                    <td className="px-4 py-2">
                      <button
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs"
                        onClick={() => handleInspect(user)}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Full page liked anime modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              className="absolute top-4 right-6 text-gray-400 hover:text-purple-600 text-2xl"
              onClick={() => { setSelectedUser(null); setLikedAnime([]); }}
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-6 text-purple-700">{selectedUser.username}'s Liked Anime</h3>
            {likedLoading ? (
              <div className="text-gray-500">Loading...</div>
            ) : likedAnime.length > 0 ? (
              <ul className="space-y-4">
                {likedAnime.map(anime => (
                  <li key={anime._id} className="flex items-center gap-4">
                    {anime.coverImage ? (
                      <img src={anime.coverImage} alt={anime.title} className="w-16 h-24 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500">?</div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-800 text-lg">{anime.title}</div>
                      <div className="text-xs text-gray-500">{anime.genres?.join(', ')}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No liked anime found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserStats;
