import React from 'react';

const TrendingTopics: React.FC<{ topics: string[] }> = ({ topics }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
    <h2 className="text-lg font-bold mb-3 text-green-600 dark:text-green-300">Trending Topics</h2>
    <ul className="space-y-2">
      {topics.length === 0 && <li className="text-gray-400 text-sm">No trending topics.</li>}
      {topics.map((topic, idx) => (
        <li key={idx} className="text-sm text-gray-700 dark:text-gray-200">
          <span className="inline-block bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full mr-2">#{topic}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default TrendingTopics;
