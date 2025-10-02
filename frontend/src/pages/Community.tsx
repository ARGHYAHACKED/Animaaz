import React, { useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import FollowingSidebar from '../components/FollowingSidebar';
import ComingSoonSidebar from '../components/ComingSoonSidebar';
import ForYouCard from '../components/Community/ForYouCard';
import AnimeRecCard from '../components/Community/AnimeRecCard';
import PostCard from '../components/Community/PostCard';
import MangaCard from '../components/Community/MangaCard';
import CommunitySkeleton from '../components/Community/CommunitySkeleton';


const Community: React.FC = () => {
  // Dropdown state and ref for tag dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showDropdown) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'media' | 'comments' | 'spoiler' | 'manga' | 'tag'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [isManga, setIsManga] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<{ tag: string, count: number }[]>([]);
  // For You and Anime Recommendations
  const [forYouPosts, setForYouPosts] = useState<any[]>([]);
  const [animeRecs, setAnimeRecs] = useState<any[]>([]);
  const [loadingForYou, setLoadingForYou] = useState(true);
  const [loadingAnime, setLoadingAnime] = useState(true);
  // Fetch For You posts (simple: latest 4 discussions, could be improved)
  const loadForYou = async () => {
    setLoadingForYou(true);
    try {
      const res = await api.get('/community/posts?type=discussion&limit=4');
      setForYouPosts(res.data.posts || []);
    } catch (e) {
      setForYouPosts([]);
    }
    setLoadingForYou(false);
  };

  // Fetch anime recommendations (simple: top 4 by views, could be improved)
  const loadAnimeRecs = async () => {
    setLoadingAnime(true);
    try {
      const res = await api.get('/anime?sort=views&limit=4');
      setAnimeRecs(res.data.anime || res.data || []);
    } catch (e) {
      setAnimeRecs([]);
    }
    setLoadingAnime(false);
  };

  // Fetch posts from backend, optionally by tag
  const load = async (tag?: string) => {
    setLoading(true);
    try {
      const url = tag ? `/community/posts?tag=${encodeURIComponent(tag)}` : '/community/posts';
      const res = await api.get(url);
      setPosts(res.data.posts || []);
    } catch (e) {
      setPosts([]);
    }
    setLoading(false);
  };

  // Fetch tags from backend
  const loadTags = async () => {
    try {
      const res = await api.get('/community/tags');
      ('Frontend fetched tags:', res.data.tags);
      setTags(res.data.tags || []);
    } catch (e) {
      setTags([]);
    }
  };

  useEffect(() => {
    load();
    loadTags();
    loadForYou();
    loadAnimeRecs();
    // eslint-disable-next-line
  }, []);

  // Refetch tags and posts every time the Tags tab is selected
  useEffect(() => {
    if (tab === 'tag') {
      loadTags();
      if (selectedTag) {
        load(selectedTag);
      } else {
        load();
      }
    }
  }, [tab, selectedTag]);

  // Add tag from input

  // Post creation handler (stub)
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('spoiler', isSpoiler ? 'true' : '');
      formData.append('type', isManga ? 'manga' : 'discussion');
      if (tagList.length > 0) formData.append('tags', tagList.join(','));
      images.forEach((img) => formData.append('images', img));

      await api.post('/community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setContent('');
      setTagList([]);
      setImages([]);
      setIsSpoiler(false);
      setIsManga(false);
      setShowPostModal(false);
      await load();
    } catch (err) {
      alert('Failed to create post.');
    }
    setPosting(false);
  };

  // Add tag from input
  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (tag && !tagList.includes(tag)) {
      setTagList([...tagList, tag]);
    }
    setTagInput('');
  };
  // Remove tag
  const removeTag = (tag: string) => {
    setTagList(tagList.filter(t => t !== tag));
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-white">
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-2 sm:px-4 pt-4 pb-10 gap-6">
        {/* Left Sidebar (Following) - hidden on mobile */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <FollowingSidebar />
        </aside>

        {/* Feed Centered */}
        <main className="mx-auto w-full max-w-md flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center mb-2">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-center">
              <span className="inline-block text-green-500">🌱</span> Community
            </h1>
            {/* <div className="text-xs opacity-80 mt-1">Live updates every 5s</div> */}
            {/* Community Description */}
            <div className="mt-4 max-w-xl mx-auto text-center bg-white/80 dark:bg-gray-800/80 rounded-xl shadow p-4 border border-green-100 dark:border-gray-800">
              <div className="text-base text-gray-700 dark:text-gray-200">
                Welcome to the Anime Community! Share your thoughts, join discussions, and connect with fellow anime fans. Post about your favorite shows, manga, or anything related to anime culture. <br className="hidden sm:block" />
                <span className="font-semibold text-green-600 dark:text-green-300">Be kind, have fun, and enjoy the community!</span>
              </div>
            </div>
          </div>
          <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max px-1">
              <button onClick={()=>{setTab('all'); setSelectedTag(null);}} className={`flex-shrink-0 px-4 py-2 text-sm rounded-lg border dark:border-gray-700 ${tab==='all'?'bg-green-500 text-white':'bg-white dark:bg-gray-800'}`}>All</button>
              {/* <button onClick={()=>{setTab('spoiler'); setSelectedTag(null);}} className={`flex-shrink-0 px-4 py-2 text-sm rounded-lg border dark:border-gray-700 ${tab==='spoiler'?'bg-green-500 text-white':'bg-white dark:bg-gray-800'}`}>Spoiler</button> */}
              <button onClick={()=>{setTab('manga'); setSelectedTag(null);}} className={`flex-shrink-0 px-4 py-2 text-sm rounded-lg border dark:border-gray-700 ${tab==='manga'?'bg-purple-500 text-white':'bg-white dark:bg-gray-800'}`}>Manga</button>
              <button onClick={()=>{setTab('tag');}} className={`flex-shrink-0 px-4 py-2 text-sm rounded-lg border dark:border-gray-700 ${tab==='tag'?'bg-green-500 text-white':'bg-white dark:bg-gray-800'}`}>Tags</button>
            </div>
          </div>
          {/* Tag dropdown for tag tab */}
          {tab === 'tag' && (
            <div className="my-2">
              <div className="relative inline-block w-64" ref={dropdownRef}>
                <button
                  className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow focus:outline-none"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  type="button"
                >
                  {selectedTag ? `#${selectedTag}` : 'Select a tag...'}
                  <span className="float-right">▼</span>
                </button>
                {showDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto">
                    {tags.length === 0 && <div className="px-4 py-2 text-xs opacity-60">No tags yet.</div>}
                    {tags.map((t, idx) => (
                      <div
                        key={t.tag + '-' + idx}
                        className="px-4 py-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900 text-sm text-green-700 dark:text-green-300 flex items-center justify-between"
                        onClick={() => { setSelectedTag(t.tag); setShowDropdown(false); load(t.tag); }}
                      >
                        <span>#{t.tag}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedTag && (
                <div className="mt-4">
                  <button
                    className="mb-3 px-3 py-1 rounded-full border text-xs bg-green-500 text-white border-green-600 hover:bg-green-600"
                    onClick={() => { setSelectedTag(null); setShowDropdown(false); load(); }}
                  >
                    ← All Tags
                  </button>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full border text-xs bg-green-500 text-white border-green-600">#{selectedTag}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {posts.length === 0 && (
                      <div className="opacity-70">No posts for this tag.</div>
                    )}
                    {posts
                      .filter(p => Array.isArray(p.likes) && p.likes.length > 0)
                      .map((p) => (
                        <PostCard
                          key={p._id}
                          p={p}
                          user={user}
                          onLike={async () => { await api.post(`/community/posts/${p._id}/like`); await load(selectedTag); }}
                          onTagClick={(tag: string) => { setTab('tag'); setSelectedTag(tag); load(tag); }}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Desktop: Add Post button and modal */}
          {user && (
            <div className="hidden sm:flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowPostModal(true)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white font-semibold shadow hover:scale-105 transition-transform"
              >
                Add Post
              </button>
            </div>
          )}

          {/* Mobile: Floating add post button */}
          {user && (
            <button
              type="button"
              onClick={() => setShowPostModal(true)}
              className="fixed bottom-16 right-6 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-xl hover:scale-110 transition-transform z-50 sm:hidden border-4 border-white dark:border-gray-900"
              aria-label="Add Post"
            >
              <span className="text-3xl font-bold">+</span>
            </button>
          )}

          {/* Mobile: Fullscreen post modal */}
          {showPostModal && user && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 flex flex-col">
                <button
                  onClick={() => setShowPostModal(false)}
                  className="self-end text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl mb-2"
                  aria-label="Close"
                >
                  ✕
                </button>
                <form onSubmit={create} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={user.avatar || '/default-avatar.png'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                    <span className="font-semibold">{user.username || 'User'}</span>
                  </div>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (required)" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 font-semibold" maxLength={200} />
                  <div className="flex gap-2 items-center">
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Add tag (e.g. Naruto)"
                      className="px-2 py-1 rounded border dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                      maxLength={30}
                    />
                    <button type="button" onClick={addTag} className="px-2 py-1 rounded bg-green-500 text-white text-xs">Add</button>
                    <div className="flex flex-wrap gap-1">
                      {tagList.map(tag => (
                        <span key={tag} className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
                          #{tag}
                          <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-xs">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} />
                      <span>Spoiler</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input type="checkbox" checked={isManga} onChange={e => setIsManga(e.target.checked)} />
                      <span>Manga</span>
                    </label>
                    <span className="text-xs opacity-60">Check if this post contains spoilers or is manga</span>
                  </div>
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Description (you can use [spoiler] tags)" className="w-full px-3 py-2 rounded border dark:border-gray-700 bg-white dark:bg-gray-800" rows={4} maxLength={2000} />
                  <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
                  {images.length > 0 && (
                    <div className="mt-2 text-sm opacity-80">{images.length} image(s) selected</div>
                  )}
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform" disabled={posting}>
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </form>
              </div>
            </div>
          )}
          {loading ? (
            <CommunitySkeleton />
          ) : (
            <div className="flex flex-col gap-4">
              {posts
                .filter(p => {
                  if (tab === 'media') return Array.isArray(p.images) && p.images.length > 0;
                  if (tab === 'comments') return (!Array.isArray(p.images) || p.images.length === 0);
                  if (tab === 'spoiler') return /\[spoiler\]([\s\S]*?)\[\/spoiler\]/i.test(p.content);
                  if (tab === 'manga') return p.type === 'manga';
                  if (tab === 'tag' && selectedTag) return (p.tags || []).includes(selectedTag);
                  return true;
                })
                .map((p) => {
                  if (tab === 'manga') {
                    return <MangaCard key={p._id} manga={p} />;
                  }
                  if (tab === 'spoiler') {
                    return <PostCard
                      key={p._id}
                      p={p}
                      user={user}
                      onLike={async () => { await api.post(`/community/posts/${p._id}/like`); await load(); }}
                      onTagClick={(tag: string) => { setTab('tag'); setSelectedTag(tag); }}
                    />;
                  }
                  return <PostCard
                    key={p._id}
                    p={p}
                    user={user}
                    onLike={async () => { await api.post(`/community/posts/${p._id}/like`); await load(); }}
                    onTagClick={(tag: string) => { setTab('tag'); setSelectedTag(tag); }}
                  />;
                })}
              {posts.length === 0 && <div className="opacity-70">No posts yet.</div>}
            </div>
          )}

          {/* For You Section (Discussions) */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3 text-center">For You: More Discussions</h2>
            {loadingForYou ? (
              <CommunitySkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {forYouPosts.map((p: any) => <ForYouCard key={p._id} post={p} />)}
                {forYouPosts.length === 0 && <div className="opacity-70 text-center">No recommendations yet.</div>}
              </div>
            )}
          </div>

          {/* Anime Recommendations Section */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3 text-center">Anime Recommendations For You</h2>
            {loadingAnime ? (
              <CommunitySkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {animeRecs.map((a: any) => (
                  <Link
                    key={a._id || a.title}
                    to={a._id ? `/anime/${a._id}` : '#'}
                    className="block hover:scale-[1.03] transition-transform"
                    tabIndex={a._id ? 0 : -1}
                  >
                    <AnimeRecCard anime={a} />
                  </Link>
                ))}
                {animeRecs.length === 0 && <div className="opacity-70 text-center">No recommendations yet.</div>}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar (Coming Soon) - hidden on mobile */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <ComingSoonSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Community;


