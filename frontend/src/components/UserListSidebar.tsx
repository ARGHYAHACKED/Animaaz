import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
}

const UserListSidebar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/admin/users?limit=100');
  // console.log('UserListSidebar response:', res.data);
        // Defensive: handle missing users property or undefined
        setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-purple-600">User List</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <ul className="space-y-2">
          {users.map(user => (
            <li key={user._id} className="px-3 py-2 rounded hover:bg-purple-50 text-sm text-gray-800">
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default UserListSidebar;
