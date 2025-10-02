import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

interface Group {
  _id: string;
  name: string;
  avatar?: string;
}

interface GroupsDrawerProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const GroupsDrawer: React.FC<GroupsDrawerProps> = ({ open, onClose, userId }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  // ...existing code...

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    api.get(`/users/${userId}`)
      .then(res => setGroups(res.data.groups || []))
      .finally(() => setLoading(false));
  }, [open, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: 9998 }} onClick={onClose} />
      {/* Drawer */}
      <div className="ml-auto w-80 h-full bg-white dark:bg-gray-900/80 shadow-2xl p-6 flex flex-col border-l border-gray-200 dark:border-gray-700 z-[10000]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Your Groups</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-200">✕</button>
        </div>
        {loading ? (
          <div className="text-gray-300">Loading...</div>
        ) : groups.length === 0 ? (
          <div className="text-gray-400">No groups joined yet.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((g) => (
              <Link
                key={g._id}
                to={`/groups/${g._id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 hover:bg-purple-700/40 text-white text-left transition"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src={g.avatar || '/logo.png'}
                  alt={g.name}
                  className="w-8 h-8 rounded-full object-cover bg-gray-700"
                  style={{ minWidth: 32, minHeight: 32 }}
                />
                <span>{g.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsDrawer;
