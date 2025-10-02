import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import AnimeCard from '../components/AnimeCard';
// We'll define this component below
import FollowerListModal from '../pages/FollowerModal'; 

// Define a type for users in the followers/following list
interface FollowerUser {
  _id: string;
  username: string;
  avatar: string;
}

const Profile: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ username: '', bio: '' });
  const [avatar, setAvatar] = useState<File|null>(null);
  const [cover, setCover] = useState<File|null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // NEW STATE for follow logic
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowProcessing, setIsFollowProcessing] = useState(false);
  // NEW STATE for modal
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);

  const isOwn = user?.id === id;
  const currentUserId = user?.id; // The logged-in user's ID

  const loadProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      const profileData = res.data;
      setProfile(profileData);
      setForm({ username: profileData.username || '', bio: profileData.bio || '' });
      
      // Check if the current user is following this profile
      // Note: profileData.followers contains the full list of IDs/Objects.
      // We check if the current logged-in user's ID exists in the target profile's followers list.
      if (currentUserId) {
        const followingStatus = profileData.followers.some(
          (follower: FollowerUser) => follower._id === currentUserId
        );
        setIsFollowing(followingStatus);
      }
    } catch(error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  }, [id, currentUserId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  // Follow/Unfollow handler
  const handleFollowToggle = async () => {
    if (!currentUserId || !id || isOwn || isFollowProcessing) return;
    
    setIsFollowProcessing(true);
    try {
      // The backend route handles both follow and unfollow based on current state
      const res = await api.post(`/users/${id}/follow`); 
      
      // Update the local state
      setIsFollowing(res.data.following);
      
      // Reload profile to get updated follower/following counts and lists
      await loadProfile();
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setIsFollowProcessing(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    if (avatar) formData.append('avatar', avatar);
    if (cover) formData.append('cover', cover);
    formData.append('bio', form.bio);
    formData.append('username', form.username);
    try {
      await api.put('/users/profile/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatar(null);
      setCover(null);
      await loadProfile(); // Use loadProfile instead of window.location.reload()
    } catch (error) {
      console.error('Error uploading profile avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  // Hooks must be declared unconditionally before any return
  const [tab, setTab] = useState<'overview' | 'bookmarks' | 'liked' | 'posts' | 'streak' | 'groups'>('overview');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [likedAnime, setLikedAnime] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadLists = async () => {
      if (isOwn) {
        const b = await api.get('/users/bookmarks/list');
        setBookmarks(b.data || []);
      }
      if (id) {
        const l = await api.get(`/users/${id}/liked`);
        setLikedAnime(l.data || []);
      }
    };
    loadLists();
  }, [id, isOwn]);

  const streak = useMemo(() => {
    const history: Array<{ date: string }> = ((profile?.loginHistory as any[]) || []).map((h: any) => ({ date: new Date(h.date).toDateString() }));
    let run = 0;
    let maxRun = 0;
    let last: Date | null = null;
    history
      .map(h => new Date(h.date))
      .sort((a, b) => a.getTime() - b.getTime())
      .forEach(d => {
        if (!last) run = 1;
        else {
          const diff = (d.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
          run = diff === 1 ? run + 1 : 1;
        }
        last = d;
        if (run > maxRun) maxRun = run;
      });
    return { current: run, best: maxRun };
  }, [profile?.loginHistory]);

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (!profile) return <div className="container mx-auto px-4 py-8">Not found</div>;

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 text-gray-900 dark:text-white">
      {/* Follower List Modal */}
      {modalType && (
        <FollowerListModal
          list={modalType === 'followers' ? profile.followers : profile.following}
          title={modalType === 'followers' ? 'Followers' : 'Following'}
          onClose={() => setModalType(null)}
          onNavigate={(userId) => {
            setModalType(null);
            navigate(`/profile/${userId}`);
          }}
        />
      )}
      
      <div className="relative mb-8">
        {/* Cover Image */}
        {/* ... (Existing Cover Image rendering) ... */}
        <div className="h-40 sm:h-48 md:h-64 w-full rounded-2xl overflow-hidden bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
          {profile.cover ? (
            <img src={profile.cover} alt="Cover" className="object-cover w-full h-full" />
          ) : (
            <span className="text-2xl text-white/70 font-bold">No Cover Image</span>
          )}
        </div>
        {/* Avatar */}
        <div className="flex flex-col items-center" style={{marginTop: '-3rem'}}>
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg bg-gray-200 dark:bg-gray-800">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="object-cover w-full h-full" />
            ) : (
              <span className="flex items-center justify-center h-full text-4xl text-gray-400">?</span>
            )}
          </div>
          {/* Buttons under avatar, mobile responsive */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <button onClick={() => setTab('overview')} className={`px-4 py-2 rounded-full font-medium transition ${tab==='overview' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Overview</button>
            <button onClick={() => setTab('groups')} className={`px-4 py-2 rounded-full font-medium transition ${tab==='groups' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Groups</button>
            <button onClick={() => setTab('bookmarks')} className={`px-4 py-2 rounded-full font-medium transition ${tab==='bookmarks' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Bookmarks</button>
            <button onClick={() => setTab('liked')} className={`px-4 py-2 rounded-full font-medium transition ${tab==='liked' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Liked</button>
            <button onClick={() => setTab('posts')} className={`px-4 py-2 rounded-full font-medium transition ${tab==='posts' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Posts</button>
            <button onClick={() => setTab('streak')} className={`px-4 py-2 rounded-full font-medium transition ${tab==='streak' ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Streak</button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-8 mb-4 gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">{profile.username}</h1>
          <p className="opacity-80 text-lg mt-1">{profile.bio || 'No bio yet.'}</p>
        </div>
        
        {/* Follower/Following Counts */}
        <div className="flex gap-4 justify-center sm:justify-start">
            <button 
                onClick={() => profile.followers.length > 0 && setModalType('followers')} 
                className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                disabled={profile.followers.length === 0}
            >
                <div className="text-xl font-bold">{profile.followers?.length || 0}</div>
                <div className="text-sm opacity-80">Followers</div>
            </button>
            <button 
                onClick={() => profile.following.length > 0 && setModalType('following')} 
                className="text-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                disabled={profile.following.length === 0}
            >
                <div className="text-xl font-bold">{profile.following?.length || 0}</div>
                <div className="text-sm opacity-80">Following</div>
            </button>
        </div>

        <div className="text-right">
          <div className="text-sm opacity-80">Login Streak</div>
          <div className="text-lg font-semibold">Current: {streak.current} • Best: {streak.best}</div>
        </div>
      </div>

      {/* Message and Follow Button */}
      {!isOwn && (
        <div className="mb-4 flex gap-2 justify-center sm:justify-start">
          <button 
            onClick={() => navigate(`/messages?u=${id}`)} 
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white shadow"
          >
            Message
          </button>
          
          <button 
            onClick={handleFollowToggle} 
            disabled={isFollowProcessing}
            className={`px-4 py-2 rounded font-semibold shadow transition duration-200 flex items-center justify-center ${
              isFollowing 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isFollowProcessing ? (
              <span className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : isFollowing ? (
              'Following'
            ) : (
              'Follow'
            )}
          </button>
        </div>
      )}
      
      {/* ... (Rest of the component's tab content) ... */}
      {tab === 'overview' && isOwn && (
        <form onSubmit={save} className="space-y-4 max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-xl shadow p-6">
          <div className="flex flex-col gap-4 sm:flex-row items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-1">Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full px-3 py-2 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800" rows={2} />
            </div>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row items-center">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-1">Avatar</label>
              <input type="file" accept="image/*" onChange={(e)=>setAvatar(e.target.files?.[0]||null)} className="w-full" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium mb-1">Cover</label>
              <input type="file" accept="image/*" onChange={(e)=>setCover(e.target.files?.[0]||null)} className="w-full" />
            </div>
          </div>
          <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow flex items-center justify-center" disabled={saving}>
            {saving ? <span className="animate-spin mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span> : null}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
      {tab === 'overview' && (
        <div className="mt-8">
          {/* Omitted original groups content to save space, assuming it's correctly placed here. */}
        </div>
      )}
      {tab === 'bookmarks' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {bookmarks.map((a) => (<AnimeCard key={a._id} anime={a} />))}
          {bookmarks.length === 0 && <div className="opacity-70">No bookmarks yet.</div>}
        </div>
      )}
      {tab === 'liked' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {likedAnime.map((a) => (<AnimeCard key={a._id} anime={a} />))}
          {likedAnime.length === 0 && <div className="opacity-70">No likes yet.</div>}
        </div>
      )}
      {tab === 'posts' && (
        <div className="space-y-4 mt-6">
          {deleteError && (
            <div className="mb-2 p-2 bg-red-100 text-red-700 rounded text-sm">{deleteError}</div>
          )}
          {(profile.posts || []).filter((p: any) => p.user === user?.id).map((p: any) => (
            <div key={p._id} className="p-6 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 shadow flex flex-col gap-2">
              <div className="font-semibold text-lg mb-1">{p.title || p.type}</div>
              <div className="text-sm opacity-80 mb-2">{new Date(p.createdAt).toLocaleString()}</div>
              <div className="text-gray-700 dark:text-gray-300">{p.content}</div>
              <button
                className="self-end px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-sm mt-2 flex items-center justify-center"
                disabled={deleting === p._id}
                onClick={async () => {
                  if (window.confirm('Delete this post?')) {
                    setDeleting(p._id);
                    setDeleteError(null);
                    try {
                      await api.delete(`/community/posts/${p._id}`);
                      // Remove post from UI without reload
                      setProfile((prev: any) => ({
                        ...prev,
                        posts: (prev.posts || []).filter((post: any) => post._id !== p._id)
                      }));
                    } catch (err: any) {
                      setDeleteError(err?.response?.data?.message || 'Failed to delete post.');
                    } finally {
                      setDeleting(null);
                    }
                  }
                }}
              >
                {deleting === p._id ? <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : null}
                {deleting === p._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
          {(profile.posts || []).filter((p: any) => p.user === user?.id).length === 0 && <div className="opacity-70">No posts yet.</div>}
        </div>
      )}
      {tab === 'streak' && (
        <div className="p-6 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 shadow mt-6">
          <div className="font-semibold mb-2">Login History</div>
          <div className="flex flex-wrap gap-2">
            {(profile.loginHistory || []).map((h: any, idx: number) => (
              <span key={idx} className="px-3 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow">{new Date(h.date).toDateString()}</span>
            ))}
            {(profile.loginHistory || []).length === 0 && <div className="opacity-70">No logins recorded.</div>}
          </div>
        </div>
      )}
      {tab === 'groups' && (
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {(profile.groups || []).length > 0 ? (
            profile.groups.map((g: any) => (
              <button
                key={g._id}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:scale-105 transition"
                onClick={() => navigate(`/groups/${g._id}`)}
              >
                {g.avatar && <img src={g.avatar} alt={g.name} className="inline-block w-8 h-8 rounded-full mr-2 align-middle object-cover" />}
                <span className="align-middle">{g.name}</span>
              </button>
            ))
          ) : (
            <div className="opacity-70">No groups joined yet.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;