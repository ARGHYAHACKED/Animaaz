import React from 'react';
import { useNavigate } from 'react-router-dom';

const curationSections = [
  { id: 'trending', label: 'Trending', checked: true },
  { id: 'featured', label: 'Featured', checked: true },
  { id: 'banner', label: 'Home Page', checked: true },
  { id: 'top-airing', label: 'Top Airing', checked: false },
  { id: 'top-week', label: 'Top This Week', checked: false },
  { id: 'for-you', label: 'For You', checked: true },
];

const AdminCurationIndex: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Curation Sections</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {curationSections.map(section => (
          <button
            key={section.id}
            onClick={() => navigate(`/admin/curation/${section.id}`)}
            className="flex items-center justify-between p-6 rounded-xl shadow bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900 transition cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{section.label}</span>
           
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminCurationIndex;
