import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import CommentItem from '../components/PostDetails/CommentItem';
import ForYouCard from '../components/PostDetails/ForYouCard';
import AnimeRecCard from '../components/PostDetails/AnimeRecCard';

const PostDetails: React.FC = () => {
  const { id } = useParams();
  // Fullscreen image modal state
  // (removed duplicate fullscreenImage state)
  // Scroll to top on mount or when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const { user } = useAuth();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<any[]>([]);
  const [viewTab, setViewTab] = useState<'all' | 'comments' | 'media'>('all');
  const [forYouPosts, setForYouPosts] = useState<any[]>([]);
  const [animeRecs, setAnimeRecs] = useState<any[]>([]);
  const [loadingForYou, setLoadingForYou] = useState<boolean>(true);
  const [loadingAnime, setLoadingAnime] = useState<boolean>(true);

  // Fetch For You posts (latest 4 discussions)
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

  // Fetch anime recommendations (top 4 by views)
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

  // Like post (love react)
  const likePost = async () => {
    if (!id) return;
    await api.post(`/community/posts/${id}/like`);
    await load();
  };

  // Like a comment
  const likeComment = async (cid: string) => {
    await api.post(`/community/comments/${cid}/like`);
    await load();
  };

  // Reply to a comment
  const replyTo = async (cid: string, text: string) => {
    if (!id || !text.trim()) return;
    await api.post(`/community/posts/${id}/comments`, {
      text: text.trim(),
      parentComment: cid,
    });
    await load();
  };

  // Add a comment
  const addComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    await api.post(`/community/posts/${id}/comments`, { text: comment.trim() });
    setComment('');
    await load();
  };

  const [showPostEmojiPicker, setShowPostEmojiPicker] = useState(false);
  const [showPostCommentInput, setShowPostCommentInput] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const bookmark = async () => {
    if (!id) return;
    await api.post(`/community/posts/${id}/bookmark`);
    await load();
  };

  // Main post loader
  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/community/posts/${id}`);
      setPost(res.data);
      const thread = await api.get(`/community/posts/${id}/comments`);
      setComments(thread.data || []);
    } catch (e) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadForYou();
    loadAnimeRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    );

  if (!post)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <div className="text-xl text-gray-600 dark:text-gray-400">
            Post not found
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Post Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          {/* Back Button */}
          <div className="p-4 pb-0">
            <Link to="/community" className="inline-flex items-center text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>
          </div>
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex items-center gap-3 mb-3">
              {post.user?.avatar ? (
                <img src={post.user.avatar} alt={post.user.username || 'User'} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.user?.username?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <Link
                  to={
                    post.user?._id ? `/profile/${post.user._id}` : '#'
                  }
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  {post.user?.username || 'User'}
                </Link>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            {/* Post Title */}
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {post.title}
            </h1>
            {viewTab !== 'media' && (
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed mb-4">
                {post.content}
              </div>
            )}
            {(viewTab === 'all' || viewTab === 'media') &&
              Array.isArray(post.images) &&
              post.images.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {post.images.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt="post"
                        className="rounded-lg object-cover w-full h-64 cursor-pointer"
                        onClick={() => setFullscreenImage(url)}
                      />
                    ))}
                  </div>
                  {fullscreenImage && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 cursor-zoom-out"
                      onClick={() => setFullscreenImage(null)}
                    >
                      <img
                        src={fullscreenImage}
                        alt="fullscreen post"
                        className="max-w-full max-h-full rounded-lg shadow-2xl border-4 border-white"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </>
                )}
              {/* Facebook-style Action Bar for Main Post */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="relative flex items-center gap-2">
                {(() => {
                  // Show only love react and real like count
                  return (
                    <button
                      onClick={likePost}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-semibold text-base"
                      style={{ minWidth: 44 }}
                      aria-label={Array.isArray(post.likes) && user && post.likes.some((l: any) => l.user === user.id) ? 'Unlike' : 'Like'}
                    >
                      {Array.isArray(post.likes) && user && post.likes.some((l: any) => l.user === user.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#ec4899" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ec4899" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 00-7.6 0l-.835.836-.835-.836a5.373 5.373 0 00-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 000-7.6z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ec4899" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 6.582a5.373 5.373 0 00-7.6 0l-.835.836-.835-.836a5.373 5.373 0 00-7.6 7.6l.836.835 7.6 7.6 7.6-7.6.836-.835a5.373 5.373 0 000-7.6z" />
                        </svg>
                      )}
                      <span className="text-pink-600 dark:text-pink-400">{Array.isArray(post.likes) ? post.likes.length : 0}</span>
                    </button>
                  );
                })()}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={bookmark} className={`text-lg ${post.bookmarks && post.bookmarks.includes(user?.id) ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'}`} title="Bookmark">
                  {post.bookmarks && post.bookmarks.includes(user?.id) ? (
                    // Filled bookmark
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
                  ) : (
                    // Outline bookmark
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" /></svg>
                  )}
                </button>
                <button className="text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-lg" title="Comment" onClick={() => setShowPostCommentInput((v) => !v)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4.28 1.07A1 1 0 013 19.13V17.6c0-.29.13-.56.35-.74A7.96 7.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>
              </div>
            </div>
            {showPostCommentInput && user && (
              <form
                onSubmit={addComment}
                className="mt-4 flex gap-3"
              >
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write a comment..."
                  autoFocus
                />
                <button className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">
                  Post
                </button>
              </form>
            )}
          </div>
          {/* Tabs */}
          <div className="p-6">
            <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewTab('all')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewTab === 'all'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Comments
              </button>
              {/* <button
                onClick={() => setViewTab('comments')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewTab === 'comments'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Comments
              </button>
              <button
                onClick={() => setViewTab('media')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewTab === 'media'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Media
              </button> */}
            </div>
            {(viewTab === 'all' || viewTab === 'comments') && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Comments
                </h2>
                {/* {user && (
                  <form
                    onSubmit={addComment}
                    className="mb-6 flex gap-3"
                  >
                    <input
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Write a comment..."
                    />
                    <button className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">
                      Post
                    </button>
                  </form>
                )} */}
                <div className="space-y-4">
                  {loading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-1/4 bg-gray-300 dark:bg-gray-700 rounded" />
                            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : comments.length > 0 ? (
                    comments.map((c) => (
                      <CommentItem
                        key={c._id}
                        c={{ ...c, likeComment, replyTo }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </>
            )}
            {viewTab === 'media' && (
              <div>
                {Array.isArray(post.images) &&
                post.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {post.images.map((url: string, idx: number) => (
                      <img
                        key={idx}
                        src={url}
                        alt="post media"
                        className="rounded-lg object-cover w-full h-48 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-4">📷</div>
                    <div>No media in this post.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* For You Section (Discussions) */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-center flex-1 text-purple-700 dark:text-purple-300">For You: More Discussions</h2>
            <Link to="/community" className="ml-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors">View All</Link>
          </div>
          {loadingForYou ? (
            <div className="opacity-70 text-center">Loading...</div>
          ) : (
            <div className="flex flex-col gap-4 divide-y divide-gray-200 dark:divide-gray-800">
              {forYouPosts.map((p: any, idx: number) => (
                <div key={p._id} className={idx === 0 ? '' : 'pt-4'}>
                  <ForYouCard post={p} />
                </div>
              ))}
              {forYouPosts.length === 0 && (
                <div className="opacity-70 text-center">
                  No recommendations yet.
                </div>
              )}
            </div>
          )}
        </div>
        {/* Anime Recommendations Section */}
        <div className="w-full max-w-2xl mx-auto mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-center flex-1 text-purple-700 dark:text-purple-300">Anime Recommendations For You</h2>
            <Link to="/anime" className="ml-4 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center gap-2">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          {loadingAnime ? (
            <div className="opacity-70 text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {animeRecs.map((a: any) => (
                <AnimeRecCard key={a._id || a.title} anime={a} />
              ))}
              {animeRecs.length === 0 && (
                <div className="opacity-70 text-center">
                  No recommendations yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
