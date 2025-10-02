import React from 'react';

const AnimeEditContentTab = ({ anime, onChange }: { anime: any, onChange: (data: any) => void }) => {
  // TODO: Add form fields for main content
  return (
    <div>
      <label className="block mb-2 text-gray-900 dark:text-white">Title
        <input className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={anime.title || ''} onChange={e => onChange({ ...anime, title: e.target.value })} />
      </label>
      <label className="block mb-2 text-gray-900 dark:text-white">Description
        <textarea className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" rows={3} value={anime.description || ''} onChange={e => onChange({ ...anime, description: e.target.value })} />
      </label>
      {/* Add more fields as needed */}
    </div>
  );
};

export default AnimeEditContentTab;
