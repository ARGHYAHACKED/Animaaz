import React from 'react';

const AnimeEditMetaTab = ({ anime, onChange }: { anime: any, onChange: (data: any) => void }) => {
  // TODO: Add form fields for meta info
  return (
    <div>
      <label className="block mb-2 text-gray-900 dark:text-white">Year
        <input type="number" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300" value={anime.year || ''} onChange={e => onChange({ ...anime, year: e.target.value })} />
      </label>
      <label className="block mb-2 text-gray-900 dark:text-white">Status
        <select className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={anime.status || ''} onChange={e => onChange({ ...anime, status: e.target.value })}>
          <option value="upcoming">upcoming</option>
          <option value="ongoing">ongoing</option>
          <option value="completed">completed</option>
        </select>
      </label>
      {/* Add more fields as needed */}
    </div>
  );
};

export default AnimeEditMetaTab;
