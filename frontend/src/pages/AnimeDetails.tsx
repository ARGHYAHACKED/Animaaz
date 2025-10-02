// Recursive comment with replies renderer
import React from "react";
function CommentWithReplies({ comment }: { comment: Comment }) {
  const username = comment.user?.username || "Unknown";
  const avatar = comment.user?.avatar;
  const [showReplyForm, setShowReplyForm] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const { id: animeId } = useParams<{ id: string }>();
  const [_, setAnime] = React.useState<Anime | null>(null);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !animeId) return;
    setSubmitting(true);
    try {
      await api.post(`/anime/${animeId}/comment`, {
        text: replyText,
        parentComment: comment._id
      });
      setReplyText("");
      setShowReplyForm(false);
      // Reload anime/comments
      const updatedAnime = await api.get(`/anime/${animeId}`);
      setAnime(updatedAnime.data);
    } catch (err) {
      console.error("Error posting reply:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar || "/placeholder.svg"}
              alt={username}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-slate-900 dark:text-white">{username}</span>
            <span className="text-slate-500 dark:text-slate-400 text-sm">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.text}</p>
          <button
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => setShowReplyForm((v) => !v)}
          >
            Reply
          </button>
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-2 flex flex-col gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder={`Reply to ${username}`}
                disabled={submitting}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={submitting || !replyText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm">
                  {submitting ? "Posting..." : "Post Reply"}
                </button>
                <button type="button" onClick={() => setShowReplyForm(false)} className="text-xs text-gray-500">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
      {/* Render replies recursively */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-2 space-y-2">
          {comment.replies.map((reply: Comment, idx: number) => (
            <CommentWithReplies key={reply._id || idx} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );
}
// removed duplicate import
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"
import { Heart, Eye, Star, Bookmark, Share2, Play, MessageCircle, X, ChevronLeft, ChevronRight } from "lucide-react"
import api from "../utils/api"
import toast from "react-hot-toast"
import type { Anime, Comment } from "../types"
import { formatNumber } from "../utils/formatNumber"
import { useAuth } from "../contexts/AuthContext"

const AnimeDetails: React.FC = () => {
  const [similarAnime, setSimilarAnime] = useState<Anime[]>([])
  const [forYouAnime, setForYouAnime] = useState<Anime[]>([])
  const [topWeekAnime, setTopWeekAnime] = useState<Anime[]>([])
  const [allGenres, setAllGenres] = useState<string[]>([])
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [showScreenshotModal, setShowScreenshotModal] = useState(false)
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0)
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [anime, setAnime] = useState<Anime | null>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  // Removed unused ratingValue and showFullDescription state

  const genreColors = [
    "bg-red-500 text-white",
    "bg-blue-500 text-white",
    "bg-green-500 text-white",
    "bg-purple-500 text-white",
    "bg-pink-500 text-white",
    "bg-yellow-500 text-black",
    "bg-indigo-500 text-white",
    "bg-orange-500 text-white",
    "bg-teal-500 text-white",
    "bg-cyan-500 text-white",
    "bg-lime-500 text-black",
    "bg-emerald-500 text-white",
    "bg-violet-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-rose-500 text-white",
    "bg-amber-500 text-black",
    "bg-sky-500 text-white",
    "bg-slate-500 text-white",
  ]

  const getGenreColor = (index: number) => {
    return genreColors[index % genreColors.length]
  }

  const openScreenshotModal = (index: number) => {
    setCurrentScreenshotIndex(index)
    setShowScreenshotModal(true)
  }

  const nextScreenshot = () => {
    if (anime?.images && Array.isArray(anime.images) && anime.images.length > 0) {
      setCurrentScreenshotIndex((prev) => (prev + 1) % anime.images.length)
    }
  }

  const prevScreenshot = () => {
    if (anime?.images && Array.isArray(anime.images) && anime.images.length > 0) {
      setCurrentScreenshotIndex((prev) => (prev - 1 + anime.images.length) % anime.images.length)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const fetchAllGenres = async () => {
      try {
        const res = await api.get("/anime/genres")
        setAllGenres(res.data)
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }

    const fetchTopWeek = async () => {
      try {
        const res = await api.get("/anime/top-week")
        setTopWeekAnime(res.data.slice(0, 10))
      } catch {}
    }

    fetchAllGenres()
    fetchTopWeek()

    const fetchAnime = async () => {
      try {
        const response = await api.get(`/anime/${id}`)
        setAnime(response.data)
        // Removed setRatingValue since ratingValue state was deleted

        if (user && response.data.likes) {
          setLiked(response.data.likes.some((like: any) => like.user === user.id))
        }

        // Check if bookmarked
        if (user && response.data._id) {
          try {
            const bookmarksRes = await api.get("/users/bookmarks/list")
            const isBookmarked = bookmarksRes.data.some((a: Anime) => a._id === response.data._id)
            setBookmarked(isBookmarked)
          } catch {
            setBookmarked(false)
          }
        } else {
          setBookmarked(false)
        }
      } catch (error) {
        console.error("Error fetching anime:", error)
        toast.error("Failed to load anime details")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAnime()
    }
  }, [id, user])

  useEffect(() => {
    if (!anime) return

    const fetchSimilar = async () => {
      try {
        if (anime.genres.length > 0) {
          const genre = encodeURIComponent(anime.genres[0])
          const res = await api.get(`/anime?genre=${genre}&limit=8`)
          setSimilarAnime(res.data.anime.filter((a: Anime) => a._id !== anime._id))
        }
      } catch {}
    }

    const fetchForYou = async () => {
      try {
        const res = await api.get("/anime/for-you")
        setForYouAnime(res.data.filter((a: Anime) => a._id !== anime._id))
      } catch {}
    }

    fetchSimilar()
    fetchForYou()
  }, [anime])

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like anime")
      return
    }

    try {
      const response = await api.post(`/anime/${id}/like`)
      setLiked(response.data.liked)
      const updatedAnime = await api.get(`/anime/${id}`)
      setAnime(updatedAnime.data)
      toast.success(response.data.liked ? "Added to likes!" : "Removed from likes")
    } catch (error) {
      toast.error("Failed to update like status")
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark anime")
      return
    }

    try {
      const response = await api.post(`/users/bookmark/${id}`)
      setBookmarked(response.data.bookmarked)
      toast.success(response.data.message)
    } catch (error) {
      toast.error("Failed to update bookmark status")
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: anime?.title,
        text: anime?.description,
        url: window.location.href,
      })
    } catch (error) {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to comment")
      return
    }

    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await api.post(`/anime/${id}/comment`, {
        text: newComment.trim(),
      })

      if (anime) {
        setAnime((prev) =>
          prev
            ? {
                ...prev,
                comments: [...prev.comments, response.data],
              }
            : null,
        )
      }

      setNewComment("")
      toast.success("Comment added successfully!")
    } catch (error) {
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Anime not found</h2>
          <p className="text-slate-600 dark:text-slate-400">The anime you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const totalLikes = (anime.likes?.length || 0) + (anime.dummyLikes || 0)
  const totalViews = (anime.views || 0) + (anime.dummyViews || 0)
  const avgOutOf5 = (anime.averageRating || 0).toFixed(1)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        {anime.coverImage && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${anime.coverImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cover Image */}
            <div className="lg:col-span-3 flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src={anime.coverImage || "/placeholder.svg"}
                  alt={anime.title}
                  className="w-64 h-96 object-cover rounded-xl shadow-2xl border-4 border-white/20"
                />
                <div className="absolute -bottom-4 -right-4 bg-white dark:bg-slate-800 rounded-full p-3 shadow-lg">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {avgOutOf5}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Info */}
            <div className="lg:col-span-6 text-white">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">{anime.title}</h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {anime.status}
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  {anime.year}
                </span>
                {anime.genres.slice(0, 3).map((genre, i) => (
                  <span
                    key={i}
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <p className={`text-white/90 leading-relaxed ${!showDescriptionModal ? "line-clamp-3" : ""}`}>
                  {anime.description}
                </p>
                {!showDescriptionModal && anime.description.length > 200 && (
                  <button
                    onClick={() => setShowDescriptionModal(true)}
                    className="text-white/80 hover:text-white mt-2 text-sm font-medium underline"
                  >
                    Read more
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold">{avgOutOf5}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span className="font-semibold">{formatNumber(totalViews)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">{formatNumber(totalLikes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{anime.comments.length}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    liked
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    bookmarked
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {/* All Genres Section */}
             

              {/* Top This Week Section */}
            
              {/* Watch Links */}
              {anime.watchLinks.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Watch On</h3>
                  <div className="space-y-3">
                    {anime.watchLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
                      >
                        <span className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {link.platform}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">{link.quality}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Information Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {anime.alternativeTitles.length > 0 && (
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Alternative Titles:</span>
                      <p className="text-slate-900 dark:text-white mt-1">{anime.alternativeTitles.join(", ")}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
                    <p className="text-slate-900 dark:text-white mt-1 capitalize">{anime.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Year:</span>
                    <p className="text-slate-900 dark:text-white mt-1">{anime.year}</p>
                  </div>
                  {anime.season && (
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Season:</span>
                      <p className="text-slate-900 dark:text-white mt-1 capitalize">{anime.season}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Episodes:</span>
                    <p className="text-slate-900 dark:text-white mt-1">
                      {anime.totalEpisodes > 0 ? anime.totalEpisodes : "TBA"}
                    </p>
                  </div>
                  {anime.studio && (
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Studio:</span>
                      <p className="text-slate-900 dark:text-white mt-1">{anime.studio}</p>
                    </div>
                  )}
                  {anime.director && (
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Director:</span>
                      <p className="text-slate-900 dark:text-white mt-1">{anime.director}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">MAL Score:</span>
                    <p className="text-slate-900 dark:text-white mt-1">{anime.rating || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="mt-6">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Genres:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {anime.genres.map((genre, i) => (
                    <Link
                      key={i}
                      to={`/genre/${encodeURIComponent(genre)}`}
                      className={`px-3 py-1 rounded-full text-sm font-medium hover:scale-105 transition-all ${getGenreColor(i)}`}
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {anime.tags.length > 0 && (
                <div className="mt-6">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {anime.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Screenshots */}
            {anime.images && anime.images.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Screenshots</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {anime.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => openScreenshotModal(i)}
                      className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Screenshot ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Episodes */}
            {anime.episodes.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Episodes</h2>
                <div className="space-y-4">
                  {anime.episodes.map((episode) => (
                    <div
                      key={episode.number}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Episode {episode.number}: {episode.title}
                        </h3>
                        {episode.description && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">
                            {episode.description}
                          </p>
                        )}
                        {episode.duration && (
                          <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                            Duration: {episode.duration} minutes
                          </p>
                        )}
                      </div>
                      {episode.watchLink && (
                        <a
                          href={episode.watchLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ml-4"
                        >
                          <Play className="w-4 h-4" />
                          <span>Watch</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Comments ({anime.comments.length})
              </h2>

              {/* Add Comment Form */}
              {user ? (
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this anime..."
                    className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {submittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      Login
                    </a>{" "}
                    to post a comment
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {anime.comments.map((comment: Comment) => (
                  <CommentWithReplies key={comment._id} comment={comment} />
                ))}

                {anime.comments.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* All Genres Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All Genres</h3>
              <div className="flex flex-wrap gap-2">
                {allGenres.length > 0 ? (
                  allGenres.map((genre, index) => (
                    <Link
                      key={index}
                      to={`/genre/${encodeURIComponent(genre)}`}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${getGenreColor(index)}`}
                      style={{ minWidth: "100px", textAlign: "center" }}
                    >
                      {genre}
                    </Link>
                  ))
                ) : (
                  <p className="text-white/70 text-sm">Loading genres...</p>
                )}
              </div>
            </div>

            {/* Top This Week Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top This Week</h3>
              <div className="space-y-3">
                {topWeekAnime.slice(0, 6).map((topAnime) => (
                  <Link
                    key={topAnime._id}
                    to={`/anime/${topAnime._id}`}
                    className="flex items-center gap-3 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <img
                      src={topAnime.coverImage || "/placeholder.svg"}
                      alt={topAnime.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{topAnime.title}</h4>
                      <p className="text-white/70 text-xs">{topAnime.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Watch Links */}
            {anime.watchLinks.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Watch On</h3>
                <div className="space-y-3">
                  {anime.watchLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
                    >
                      <span className="text-slate-900 dark:text-white font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {link.platform}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm">{link.quality}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {similarAnime.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Similar Anime</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {similarAnime.slice(0, 6).map((similarAnimeItem) => (
                  <Link key={similarAnimeItem._id} to={`/anime/${similarAnimeItem._id}`} className="group block">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <img
                        src={similarAnimeItem.coverImage || "/placeholder.svg"}
                        alt={similarAnimeItem.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {similarAnimeItem.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>{similarAnimeItem.year}</span>
                          <span>•</span>
                          <span className="capitalize">{similarAnimeItem.status}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {forYouAnime.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recommended For You</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {forYouAnime.slice(0, 6).map((forYouAnimeItem) => (
                  <Link key={forYouAnimeItem._id} to={`/anime/${forYouAnimeItem._id}`} className="group block">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                      <img
                        src={forYouAnimeItem.coverImage || "/placeholder.svg"}
                        alt={forYouAnimeItem.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {forYouAnimeItem.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>{forYouAnimeItem.year}</span>
                          <span>•</span>
                          <span className="capitalize">{forYouAnimeItem.status}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Overview</h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {anime.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {showScreenshotModal && anime.images && anime.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-6xl w-full max-h-[90vh] mx-4">
            {/* Close Button */}
            <button
              onClick={() => setShowScreenshotModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {anime.images.length > 1 && (
              <>
                <button
                  onClick={prevScreenshot}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextScreenshot}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Main Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={anime.images[currentScreenshotIndex] || "/placeholder.svg"}
                alt={`Screenshot ${currentScreenshotIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Image Counter */}
            {anime.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {currentScreenshotIndex + 1} / {anime.images.length}
              </div>
            )}

            {/* Thumbnail Navigation */}
            {anime.images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4">
                {anime.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentScreenshotIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded border-2 transition-all ${
                      index === currentScreenshotIndex
                        ? "border-white shadow-lg"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimeDetails
