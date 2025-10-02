

import React, { useEffect, useState } from "react";
import api from "../utils/api";
import UserMilestoneModal from "../components/Admin/UserMilestoneModal";

interface UserInfo {
  _id: string;
  username: string;
  email: string;
}

const AdminMilestones: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    api.get('/admin/users', { params: { limit: 100 } }).then(res => {
      setUsers(res.data.users || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-xl mt-8">
      <h2 className="text-2xl font-bold mb-6 text-purple-700">Set Milestone Anime for Users</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-2 text-sm font-semibold text-gray-900">Name</th>
              <th className="py-2 px-2 text-sm font-semibold text-gray-900">Email</th>
              <th className="py-2 px-2 text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-2">{u.username}</td>
                <td className="py-2 px-2">{u.email}</td>
                <td className="py-2 px-2">
                  <button
                    className="px-4 py-1 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
                    onClick={() => setSelectedUser(u)}
                  >
                    Set Milestones
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedUser && (
        <UserMilestoneModal
          userId={selectedUser._id}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

export default AdminMilestones;
