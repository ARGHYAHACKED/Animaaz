import React from 'react';

const CommunitySkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
      {/* Tabs skeleton */}
      <div className="flex space-x-2 justify-center">
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
      </div>
      {/* Post cards skeleton */}
      {[1,2,3].map(i => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex space-x-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunitySkeleton;
