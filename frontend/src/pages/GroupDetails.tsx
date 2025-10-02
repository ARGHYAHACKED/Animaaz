import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Users, Dot, ChevronRight, X, ArrowLeft, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GroupsDrawer from '../components/GroupsDrawer';
import GroupChat from '../components/GroupChat';
import GroupPolls from '../components/GroupPolls';

type Member = {
  _id: string;
  role?: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
};

type Message = {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  text: string;
  createdAt: string;
};

type Group = {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  cover?: string;
  category?: string;
  tags?: string[];
  createdAt: string;
  members: Member[];
  messages: Message[];
};

const GroupDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  //
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  // Removed local message state, now handled by GroupChat
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showGroupsDrawer, setShowGroupsDrawer] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data);
      
      // Load user's groups from profile endpoint
      if (user) {
        setSidebarLoading(true);
        try {
          const profileRes = await api.get(`/users/${user.id}`);
          setUserGroups(profileRes.data.groups || []);
        } catch (e) {
          setUserGroups([]);
        } finally {
          setSidebarLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const isMember = useMemo(() => {
    return !!group?.members?.some((m: any) => String(m.user?._id || m.user) === String(user?.id));
  }, [group, user]);



  const toggleMembership = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await api.post(`/groups/${id}/${isMember ? 'leave' : 'join'}`);
      await load();
    } catch (error) {
      console.error('Error toggling membership:', error);
    } finally {
      setJoining(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-label="Loading" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-xl text-gray-400">Group not found</div>
        </div>
      </div>
    );
  }

  const channelTabs = [
    { id: 'home', label: 'Home' },
    // { id: 'videos', label: 'Videos' },
    // { id: 'playlists', label: 'Playlists' },
    { id: 'about', label: 'About' }
  ];

  // Only group creator is owner/admin
  // Handle both string and object for createdBy (populated or not)
  const isOwner = !!(
    group && user && (
      (typeof (group as any).createdBy === 'string' && (group as any).createdBy === user.id) ||
      (typeof (group as any).createdBy === 'object' && (group as any).createdBy?._id === user.id)
    )
  );

  // Share handler
  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out the group "${group?.name}" on Anime!`;
    if (navigator.share) {
      navigator.share({ title: group?.name, text, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Group link copied to clipboard!');
    }
  };

  // Helper to reload group (for poll refresh)
  const reloadGroup = async () => {
    if (!id) return;
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Top bar: back + share */}
      <div className="max-w-7xl mx-auto px-4 pt-4 flex items-center gap-2">
        <button
          onClick={() => navigate('/groups')}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          aria-label="Back to groups"
        >
          <ArrowLeft className="h-5 w-5 text-gray-300" />
        </button>
        {isOwner && (
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors ml-1"
            aria-label="Share group"
          >
            <Share2 className="h-5 w-5 text-gray-300" />
          </button>
        )}
      </div>
      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Members ({group.members?.length || 0})
              </h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(group.members || []).map((m) => (
                  <Link
                    key={m._id}
                    to={`/profile/${m.user?._id}`}
                    onClick={() => setShowMembersModal(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    {m.user?.avatar ? (
                      <img
                        src={m.user.avatar}
                        alt={`${m.user.username} avatar`}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-600 grid place-items-center">
                        <span className="text-lg font-semibold text-white">
                          {m.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {m.user?.username || 'Member'}
                      </div>
                      <div className="text-xs text-gray-400">{m.role || 'Member'}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel-style cover */}
      <section className="relative w-full">
        <div className="h-40 md:h-56 w-full bg-gray-900" role="img" aria-label="Group cover">
          {group.cover ? (
            <img
              src={group.cover}
              alt={`${group.name} cover`}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        {/* Channel header */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="-mt-10 md:-mt-12 flex flex-col md:flex-row md:items-end gap-4">
            <div className="shrink-0">
              {group.avatar ? (
                <img
                  src={group.avatar}
                  alt={`${group.name} avatar`}
                  className="h-24 w-24 md:h-28 md:w-28 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
              ) : (
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-xl bg-gray-900 grid place-items-center">
                  <Users className="h-10 w-10 text-gray-500" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white text-balance">{group.name}</h1>
                  <p className="mt-1 text-sm text-gray-400 text-pretty">{group.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <span>{group.members?.length || 0} members</span>
                    <Dot className="h-4 w-4" />
                    <span className="capitalize">{group.category?.replace("-", " ") || "community"}</span>
                    <Dot className="h-4 w-4" />
                    <span>Since {new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {user && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMembership}
                      disabled={joining}
                      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ring-1 ring-gray-700 ${
                        isMember ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-800 text-white hover:bg-gray-700"
                      } disabled:opacity-50`}
                      aria-live="polite"
                    >
                      {joining ? "Loading…" : isMember ? "Leave" : "Join"}
                    </button>
                  </div>
                )}
              </div>

              {/* Channel tabs */}
              <nav className="mt-4 border-b border-gray-800 overflow-x-auto">
                <ul className="flex items-center gap-2">
                  {channelTabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3 md:px-4 py-2 text-sm rounded-t-md whitespace-nowrap ${
                          activeTab === tab.id
                            ? "text-white border-b-2 border-blue-500"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Members stack (top bar) */}
      <section className="mx-auto max-w-7xl px-4 mt-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </h2>
            <button 
              onClick={() => setShowMembersModal(true)}
              className="text-xs text-blue-500 inline-flex items-center hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Overlapping avatars with horizontal scroll */}
          <div className="relative overflow-x-auto">
            <div className="flex items-center">
              {(group.members || []).slice(0, 24).map((m, idx) => (
                <Link
                  key={m._id}
                  to={`/profile/${m.user?._id}`}
                  className={`relative ${idx === 0 ? "" : "-ml-3"} shrink-0 transition-transform hover:scale-110 hover:z-10`}
                  title={`${m.user?.username || 'Member'} • ${m.role || "Member"}`}
                >
                  {m.user?.avatar ? (
                    <img
                      src={m.user.avatar}
                      alt={`${m.user.username} avatar`}
                      className="h-9 w-9 rounded-full ring-2 ring-gray-950 object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gray-800 grid place-items-center ring-2 ring-gray-950">
                      <span className="text-[10px] font-semibold text-gray-400">
                        {m.user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
              {(group.members || []).length > 24 && (
                <button
                  onClick={() => setShowMembersModal(true)}
                  className="-ml-3 h-9 w-9 rounded-full bg-gray-800 grid place-items-center ring-2 ring-gray-950 text-[11px] text-gray-400 hover:bg-gray-700 transition-colors"
                >
                  +{group.members.length - 24}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Groups Drawer Button (bottom right) */}
      {user && (
        <button
          onClick={() => setShowGroupsDrawer(true)}
          className="fixed z-50 bottom-24 right-6 md:bottom-8 md:right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          title="Your Groups"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}
      {user && (
        <GroupsDrawer open={showGroupsDrawer} onClose={() => setShowGroupsDrawer(false)} userId={user.id} />
      )}

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Area - Changes based on active tab */}
        <div className="lg:col-span-2">
          {activeTab === 'about' ? (
            // About Section
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">About this group</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                  <p className="text-white">{group.description || 'No description provided.'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                    <p className="text-white capitalize">{group.category?.replace("-", " ") || "community"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Created</h4>
                    <p className="text-white">{new Date(group.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Total Members</h4>
                    <p className="text-white">{group.members?.length || 0} members</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Total Messages</h4>
                    <p className="text-white">{group.messages?.length || 0} messages</p>
                  </div>
                </div>

                {!!group.tags?.length && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {Array.isArray((group as any).polls) && (
                <GroupPolls
                  groupId={group._id}
                  polls={(group as any).polls}
                  isOwner={isOwner}
                  onPollCreated={reloadGroup}
                />
              )}
              <GroupChat
                groupId={group._id}
                initialMessages={group.messages}
                isMember={isMember}
              />
            </>
          )}
        </div>

        {/* Sidebar (joined groups, skeleton loader) */}
        <aside className="space-y-6 hidden lg:block">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 w-full">
            <h3 className="text-sm font-semibold text-white mb-4">Your Groups</h3>
            {sidebarLoading ? (
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="h-4 w-2/3 bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="h-4 w-1/2 bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="h-4 w-1/3 bg-gray-800 rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-800" />
                  <div className="h-4 w-1/2 bg-gray-800 rounded" />
                </div>
              </div>
            ) : userGroups.length === 0 ? (
              <div className="text-gray-400 text-sm">You haven't joined any groups yet.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {userGroups.map((g: any) => (
                  <Link
                    key={g._id}
                    to={`/groups/${g._id}`}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={g.avatar || '/logo.png'}
                      alt={g.name}
                      className="w-8 h-8 rounded-full object-cover bg-gray-700"
                      style={{ minWidth: 32, minHeight: 32 }}
                    />
                    <span className="text-white text-sm truncate">{g.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>

      {/* Footer spacer on mobile */}
      <div className="h-6" />
    </main>
  );
};

export default GroupDetails;