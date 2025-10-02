import React from 'react';
import { Settings } from 'lucide-react';
import AnnouncementManager from '../components/Admin/AnnouncementManager';

const AdminAnnouncements: React.FC = () => {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-blue-200 bg-blue-50 rounded-t-xl px-4 py-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-800">Announcements</h1>
          <div className="text-blue-600 mt-1 text-sm">Manage all site-wide announcements here.</div>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition-transform transform hover:scale-[1.03] shadow-lg border-2 border-yellow-300">
          <Settings className="w-5 h-5" />
          Global Settings
        </button>
      </div>
      <div className="bg-white border border-blue-100 rounded-b-xl shadow p-8">
        <p className="mb-6 text-green-700 font-medium bg-green-50 border border-green-200 rounded-lg px-4 py-2">Create, edit, and delete announcements for your community. You can also manage banners and priorities.</p>
        <AnnouncementManager />
      </div>
    </>
  );
};

export default AdminAnnouncements;
