import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Group } from '../types';
import GroupCard from '../components/GroupCard';
import MoodAnimeSection from '../components/MoodAnimeSection';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const filterOptions = [
  { value: '', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'anime-specific', label: 'Anime Specific' },
  { value: 'genre', label: 'Genre' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'discussion', label: 'Discussion' },
];

const Groups: React.FC = () => {
  // showDropdown state and effect already declared above, remove this duplicate
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    avatar: null as File | null,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.group-filter-dropdown')) setShowDropdown(false);
    };
    if (showDropdown) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showDropdown]);

  // Fetch all groups
// Fetch all groups (without search/category params - filter on frontend)
const load = async () => {
  setLoading(true);
  try {
    const res = await api.get('/groups', {
      params: { limit: 200 },
    });
    setGroups(res.data.groups || []);
  } finally {
    setLoading(false);
  }
};

  // Fetch user's joined groups (match Profile logic)
  const [sidebarLoading, setSidebarLoading] = useState(true);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const fetchJoinedGroups = async () => {
      if (!user?.id) {
        setJoinedGroups([]);
        setSidebarLoading(false);
        return;
      }
      setSidebarLoading(true);
      try {
        const res = await api.get(`/users/${user.id}`);
        setJoinedGroups(res.data.groups || []);
      } catch (err) {
        console.warn("Couldn't fetch joined groups:", err);
        setJoinedGroups([]);
      } finally {
        setSidebarLoading(false);
      }
    };
    fetchJoinedGroups();
  }, [user]);

useEffect(() => {
  load();
}, []); // Load once on mount

  // Create group
  const [isCreating, setIsCreating] = useState(false);
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsCreating(true);
    const formData = new FormData();
    formData.append('name', createForm.name);
    formData.append('description', createForm.description);
    formData.append('category', createForm.category);
    formData.append('tags', createForm.tags);
    if (createForm.avatar) formData.append('avatar', createForm.avatar);

    try {
      await api.post('/groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await load(); // refresh groups first
      setShowCreateForm(false);
      setCreateForm({ name: '', description: '', category: 'general', tags: '', avatar: null });
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Filter groups by searchQuery and category, remove duplicates
  // Filter groups by searchQuery and category, remove duplicates by _id
  const filteredGroups = (() => {
    const arr = groups.filter((group) => {
      const matchesCategory = !categoryFilter || group.category === categoryFilter;
      if (!searchQuery.trim()) return matchesCategory;
      const groupName = group.name?.toLowerCase() || '';
      const search = searchQuery.toLowerCase();
      return groupName.includes(search) && matchesCategory;
    });
    const seen = new Set();
    return arr.filter((g) => {
      if (seen.has(g._id)) return false;
      seen.add(g._id);
      return true;
    });
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
  <div className="max-w-7xl mx-auto px-4 pt-0 pb-28 relative flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text flex items-center gap-3">
                <Users className="w-9 h-9 text-purple-500" />
                Groups
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-lg">
                Join communities 💬 Make friends 🤝 Share vibes ✨
              </p>
            </div>
          </motion.div>

          {/* Search + Filter Bar */}
          <div className="sticky top-0 z-20 backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-sm mb-6 p-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="relative min-w-[140px] group-filter-dropdown">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={() => setShowDropdown((v) => !v)}
              >
                {categoryFilter ? filterOptions.find(opt => opt.value === categoryFilter)?.label : 'All'}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10">
                  {filterOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${categoryFilter === opt.value ? 'bg-purple-500 text-white' : 'text-gray-900 dark:text-white hover:bg-purple-100 dark:hover:bg-gray-800'}`}
                      onClick={() => { setCategoryFilter(opt.value); setShowDropdown(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>


          {/* Groups Grid */}
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-pulse flex flex-col gap-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-2" />
                  <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              layout
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            >
              {filteredGroups.map((group, i) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GroupCard group={group} />
                </motion.div>
              ))}
              {filteredGroups.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-7xl mb-4">🌈</div>
                  <div className="text-xl text-gray-600 dark:text-gray-400 mb-2">
                    No groups yet
                  </div>
                  <div className="text-gray-500">
                    Be the first to start the vibe ✨
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar: User's Joined Groups */}
  <div className="hidden lg:block w-full lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Groups</h3>
            {user ? (
              sidebarLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : joinedGroups.length > 0 ? (
                <ul>
                  {joinedGroups.map((group) => (
                    <li key={group._id} className="mb-2">
                      <Link
                        to={`/groups/${group._id}`}
                        className="flex items-center gap-2 hover:bg-purple-100 dark:hover:bg-purple-900 rounded px-2 py-1"
                      >
                        <img
                          src={group.avatar || '/logo.png'}
                          alt={group.name}
                          className="w-8 h-8 rounded-full object-cover bg-gray-700"
                        />
                        <span className="text-gray-900 dark:text-white truncate">{group.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 dark:text-gray-400">You haven't joined any groups yet.</div>
              )
            ) : (
              <div className="text-gray-500 dark:text-gray-400">Sign in to see your groups.</div>
            )}
          </div>
        </div>

        {/* Floating Create Button */}
        {user && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="fixed bottom-16 right-6 p-5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl hover:scale-105 transition-transform z-50"
          >
            <Plus className="w-7 h-7" />
          </button>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
                  Create New Group
                </h2>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Group Name ✨"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                  <textarea
                    placeholder="Describe your vibe..."
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="anime-specific">Anime Specific</option>
                    <option value="genre">Genre</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="discussion">Discussion</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="flex items-center gap-3">
                    {createForm.avatar ? (
                      <img
                        src={URL.createObjectURL(createForm.avatar)}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-400"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500">
                        📷
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCreateForm({ ...createForm, avatar: e.target.files?.[0] || null })
                      }
                      className="text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    disabled={isCreating}
                  >
                    {isCreating && (
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    )}
                    {isCreating ? 'Creating...' : '🚀 Create Group'}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    {/* Mood Anime Section (Random Happy) */}
    <MoodAnimeSection />
  </div>
  );
};

export default Groups;
