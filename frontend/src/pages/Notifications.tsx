import React, { useEffect, useState } from 'react';
import api from '../utils/api';

interface NotificationItem {
  _id: string;
  type: string;
  title?: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
}

const Notifications: React.FC = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setItems(res.data.notifications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await api.post('/notifications/mark-read', {});
    await load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <button onClick={markAllRead} className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm">Mark all read</button>
      </div>
      {loading ? (
        <p className="opacity-70">Loading...</p>
      ) : items.length === 0 ? (
        <p className="opacity-70">You're all caught up.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(n => (
            <li key={n._id} className={`p-4 rounded border dark:border-gray-700 ${n.isRead ? 'opacity-70' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{n.title || n.type}</p>
                  {n.message && <p className="text-sm opacity-80">{n.message}</p>}
                </div>
                <span className="text-xs opacity-70">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;


