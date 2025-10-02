import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const UserStats: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalUsers: 0, onlineUsers: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await api.get('/admin/user-stats');
    setStats(res.data || { totalUsers: 0, onlineUsers: 0 });
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading user stats...</div>;

  return (
    <div className="flex gap-6 mb-8">
      <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-start shadow-lg min-w-[200px]">
        <div className="text-sm text-gray-300 mb-2 font-medium">Total Users</div>
        <div className="text-4xl font-bold text-gray-100 mb-4">{stats.totalUsers.toLocaleString()}</div>
        <div className="rounded-full bg-gray-700 p-3">
          <span role="img" aria-label="users" className="text-xl">👥</span>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-start shadow-lg min-w-[200px]">
        <div className="text-sm text-gray-300 mb-2 font-medium">Online Users</div>
        <div className="text-4xl font-bold text-gray-100 mb-4">{stats.onlineUsers.toLocaleString()}</div>
        <div className="rounded-full bg-gray-700 p-3">
          <span role="img" aria-label="online" className="text-xl">🟢</span>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
