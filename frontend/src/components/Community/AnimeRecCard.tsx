import React from 'react';

const AnimeRecCard = ({ anime }: { anime: any }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-2 items-center">
    <img src={anime.coverImage} alt={anime.title} className="w-24 h-32 object-cover rounded-lg mb-2" />
    <div className="font-bold text-base text-center">{anime.title}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400 text-center line-clamp-2">{anime.description?.slice(0, 80)}...</div>
    <div className="flex flex-wrap gap-1 mt-1 justify-center">
      {anime.genres?.slice(0, 2).map((g: string) => (
        <span key={g} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">{g}</span>
      ))}
    </div>
  </div>
);

export default AnimeRecCard;
