import React from 'react';

const AnimeEditImagesTab = ({ anime, onChange }: { anime: any, onChange: (data: any) => void }) => {
  // TODO: Add form fields for images
  return (
    <div>
      <label className="block mb-2 text-gray-900 dark:text-white">Cover Image URL
        <input className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={anime.coverImage || ''} onChange={e => onChange({ ...anime, coverImage: e.target.value })} />
      </label>
      <label className="block mb-2 text-gray-900 dark:text-white">Banner Image URL
        <input className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={anime.bannerImage || ''} onChange={e => onChange({ ...anime, bannerImage: e.target.value })} />
      </label>
      {/* Add more fields as needed */}
    </div>
  );
};

export default AnimeEditImagesTab;
