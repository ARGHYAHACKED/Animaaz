import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MessageCircle } from 'lucide-react';
import { Group } from '../types';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  const totalMembers = (group.members?.length || 0) + (group.dummyMembers || 0);

  return (
    <Link to={`/groups/${group._id}`} className="group block">
      {/* Mobile WhatsApp-style row */}
      <div className="flex sm:hidden items-center gap-3 px-3 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-gray-800 transition-all">
        {group.avatar ? (
          <img
            src={group.avatar}
            alt={group.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-purple-400"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <Users className="w-7 h-7 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white truncate">{group.name}</span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5">
              {totalMembers}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{group.description}</div>
        </div>
      </div>
      {/* Desktop card */}
      <div className="hidden sm:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="relative">
          {group.avatar ? (
            <img
              src={group.avatar}
              alt={group.name}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-12 h-12 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium capitalize">
            {group.category.replace('-', ' ')}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {group.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1 mb-2">
            {group.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(group.tags || []).slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {(group.tags || []).length > 2 && (
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                +{group.tags.length - 2}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{totalMembers.toLocaleString()} members</span>
            </div>
            {(group.events && group.events.length > 0) && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{group.events.length} events</span>
              </div>
            )}
          </div>
          {(group.relatedAnime && group.relatedAnime.length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Related Anime</div>
              <div className="flex -space-x-2">
                {group.relatedAnime.slice(0, 3).map((anime, index) => (
                  <div key={anime._id} className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden">
                    <img
                      src={anime.coverImage}
                      alt={anime.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {group.relatedAnime.length > 3 && (
                  <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      +{group.relatedAnime.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;