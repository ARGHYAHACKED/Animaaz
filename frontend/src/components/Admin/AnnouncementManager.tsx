  
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';


const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [titleBold, setTitleBold] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
 
  const load = async () => {
    setLoading(true);
    const res = await api.get('/admin/announcements');
    let sorted = (res.data || []).slice();
    sorted.sort((a: any, b: any) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      } else {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
    });
    setAnnouncements(sorted);
    setLoading(false);
  };

  useEffect(() => { load(); }, [sortOrder]);

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/admin/announcements', { title, message, bold: titleBold });
    setTitle('');
    setMessage('');
    setTitleBold(false);
    await load();
  };

  const deleteAnnouncement = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      await api.delete(`/admin/announcements/${id}`);
      await load();
    }
  };

  const startEdit = (a: any) => {
    setEditId(a._id);
    setEditTitle(a.title);
    setEditMessage(a.message);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTitle('');
    setEditMessage('');
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    await api.put(`/admin/announcements/${editId}`, { title: editTitle, message: editMessage });
    cancelEdit();
    await load();
  };

  return (
    <div className="w-full">
      {/* Add Announcement Form */}
      <div className="mb-8">
        <form onSubmit={addAnnouncement} className="flex flex-col gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
              className={`flex-1 px-4 py-2 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition font-${titleBold ? 'bold' : 'normal'}`}
              required
            />
            <label className="flex items-center gap-1 text-sm font-medium text-blue-700 cursor-pointer select-none">
              <input type="checkbox" checked={titleBold} onChange={e => setTitleBold(e.target.checked)} className="accent-blue-500" />
              Bold
            </label>
          </div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Message"
            rows={4}
            className="px-4 py-2 rounded-lg border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 bg-white text-gray-900 transition resize-vertical min-h-[80px]"
            required
          />
          <button
            className="px-6 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold shadow transition"
          >
            Add
          </button>
        </form>
      </div>

      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 animate-fade-in">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or message..."
          className="w-full max-w-md px-4 py-2 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="sortOrder" className="text-sm font-medium text-blue-700">Sort:</label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 transition"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="mt-2">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-blue-700">All Announcements</h2>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-semibold px-3 py-1 rounded-full border border-yellow-200">{announcements.length}</span>
        </div>
        {loading ? (
          <div className="text-blue-500 font-medium animate-pulse">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-gray-400 italic">No announcements yet.</div>
        ) : (
          <ul className="space-y-4 text-left">
            {announcements
              .filter(a =>
                a.title.toLowerCase().includes(search.toLowerCase()) ||
                a.message.toLowerCase().includes(search.toLowerCase())
              )
              .map(a => (
                <li
                  key={a._id}
                  className="bg-white border border-blue-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm hover:shadow-md transition-all duration-200 text-left animate-fade-in"
                >
                  {editId === a._id ? (
                    <form onSubmit={saveEdit} className="flex flex-col gap-2 w-full">
                      <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="px-3 py-2 rounded border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-900 font-bold"
                        required
                      />
                      <textarea
                        value={editMessage}
                        onChange={e => setEditMessage(e.target.value)}
                        className="px-3 py-2 rounded border border-yellow-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 bg-white text-gray-900 resize-vertical min-h-[80px]"
                        required
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button type="submit" className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold">Save</button>
                        <button type="button" onClick={cancelEdit} className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-white font-semibold">Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center w-full">
                      <div className="flex-1">
                        <div className={`text-lg text-blue-800 ${a.bold ? 'font-extrabold' : 'font-bold'}`}>{a.title}</div>
                        <div className="text-gray-700 text-base mt-1 whitespace-pre-line">{a.message}</div>
                        {a.createdAt && (
                          <div className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleString()}</div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0 md:ml-4">
                        <button
                          onClick={() => startEdit(a)}
                          className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(a._id)}
                          className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
// Animations
// Add this to your global CSS if not present:
// .animate-fade-in { animation: fadeIn 0.5s; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  );
};

export default AnnouncementManager;
