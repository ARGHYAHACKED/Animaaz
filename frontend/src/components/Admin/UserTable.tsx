import React, { useEffect, useState } from 'react';
import api from '../../utils/api';


const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [banLoading, setBanLoading] = useState<string | null>(null);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { page: p, limit: 10 } });
      setUsers(res.data.users || []);
      // Log what is coming from backend for avatar/profilePhoto
      if (res.data.users && res.data.users.length) {
  // console.log('[UserTable] User avatar/profilePhoto sample:', res.data.users.map((u: any) => ({ username: u.username, avatar: u.avatar, profilePhoto: u.profilePhoto })));
      }
      setTotal(res.data.pagination?.total || 0);
      setPage(res.data.pagination?.current || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  const handleBan = async (userId: string) => {
    setBanLoading(userId);
    try {
      await api.post(`/admin/users/${userId}/ban`);
      await load(page);
    } finally {
      setBanLoading(null);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading users...</div>
      ) : (
        <>
          <div className="border-b border-gray-200 mb-4"></div>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-3 text-sm font-semibold text-gray-900">Profile</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Username</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Email</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Joined</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Groups</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Posts</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Role</th>
                <th className="py-3 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <img
                      src={u.avatar || u.profilePhoto || '/default-avatar.png'}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).src = '/default-avatar.png'; }}
                    />
                  </td>
                  <td className="py-3 text-gray-900 font-medium">{u.username}</td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-gray-600 text-center">{u.groupCount}</td>
                  <td className="py-3 text-gray-600 text-center">{u.postCount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${u.isBanned ? 'bg-red-400' : u.role === 'admin' ? 'bg-yellow-400 text-gray-900' : 'bg-green-400'}`}>
                      {u.isBanned ? 'Banned' : u.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2 items-center">
                    <button
                      className="px-2 py-1 rounded bg-gray-200 hover:bg-yellow-200 text-gray-900 text-xs font-semibold"
                      onClick={() => setSelectedUser(u)}
                    >
                      Details
                    </button>
                    <button
                      className={`px-2 py-1 rounded text-xs font-semibold ${u.isBanned ? 'bg-green-400 text-white hover:bg-green-500' : 'bg-red-400 text-white hover:bg-red-500'} disabled:opacity-50`}
                      disabled={banLoading === u._id || u.role === 'admin'}
                      onClick={() => handleBan(u._id)}
                    >
                      {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                    {/* Edit/Delete can be implemented here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-center mt-6 gap-4">
            <button 
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={page===1} 
              onClick={() => load(page-1)}
            >
              Prev
            </button>
            <div className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(total/10))}</div>
            <button 
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={page >= Math.ceil(total/10)} 
              onClick={() => load(page+1)}
            >
              Next
            </button>
          </div>

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-30">
              <div className="absolute top-2 left-2 right-2 bottom-2 bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
                <button
                  className="absolute top-6 right-8 text-gray-400 hover:text-gray-700 text-3xl font-bold z-50"
                  onClick={() => setSelectedUser(null)}
                  style={{zIndex: 100}}
                >
                  ×
                </button>
                {/* Left: Profile */}
                <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-12 px-6 gap-4 min-h-full">
                  <img
                    src={selectedUser.avatar || selectedUser.profilePhoto || '/default-avatar.png'}
                    alt="avatar"
                    className="w-32 h-32 rounded-full border-4 border-yellow-400 object-cover mb-4"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/default-avatar.png'; }}
                  />
                  <div className="text-3xl font-bold text-gray-900">{selectedUser.username}</div>
                  <div className="text-gray-500 text-base">{selectedUser.email}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm font-semibold">Groups: {selectedUser.groupCount}</span>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-semibold">Posts: {selectedUser.postCount}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Joined: {new Date(selectedUser.createdAt).toLocaleString()}</div>
                  <div className="mt-4 flex gap-2">
                    <span className={`px-3 py-1 rounded text-sm font-bold text-white ${selectedUser.isBanned ? 'bg-red-400' : selectedUser.role === 'admin' ? 'bg-yellow-400 text-gray-900' : 'bg-green-400'}`}>
                      {selectedUser.isBanned ? 'Banned' : selectedUser.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  {/* Groups List */}
                  <div className="w-full mt-8">
                    <div className="font-semibold text-gray-800 mb-2 text-left">Groups</div>
                    {selectedUser.groups && selectedUser.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.groups.map((g: any) => (
                          <div key={g._id} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg shadow text-sm">
                            {g.avatar && <img src={g.avatar} alt={g.name} className="w-6 h-6 rounded-full object-cover" />}
                            <span>{g.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">No groups</div>
                    )}
                  </div>
                </div>
                {/* Right: Details */}
                <div className="flex-1 flex flex-col py-12 px-8 overflow-y-auto max-h-full">
                  <div className="font-bold text-2xl text-gray-900 mb-6">Posts</div>
                  {selectedUser.posts && selectedUser.posts.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {selectedUser.posts.map((p: any) => (
                        <div key={p._id} className="w-full bg-gray-50 rounded-xl shadow-lg p-6 flex flex-col gap-2 border border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xl font-bold text-gray-800 break-words">{p.title || 'Untitled'}</span>
                            <span className="text-gray-400 text-xs">{new Date(p.createdAt).toLocaleString()}</span>
                          </div>
                          {p.content && (
                            <div className="text-gray-700 text-base mt-1 whitespace-pre-line break-words">{p.content}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-base">No posts</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersTable;



