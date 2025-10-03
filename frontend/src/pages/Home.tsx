import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Users, MessageCircle } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import axios from 'axios';
import { Anime, Group, Post } from '../types';
import AnimeCard from '../components/AnimeCard';
import GroupCard from '../components/GroupCard';
import PostCard from '../components/PostCard';

const Home: React.FC = () => {
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  // Removed adminTrending, use curated trendingAnime instead
  const [topWeek, setTopWeek] = useState<Anime[]>([]);
  const [topAiring, setTopAiring] = useState<Anime[]>([]);
  const [forYou, setForYou] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<Array<{ 
    _id?: string;
    title: string; 
    description: string;
    bannerImage?: string;
    coverImage: string;
    year?: number;
    status?: string;
    genres?: string[];
  }>>([]);

  // Debug banners
  useEffect(() => {
  // console.log('Banners state updated:', banners);
  }, [banners]);

  useEffect(() => {
     window.scrollTo({ top: 0, behavior: 'instant' })
    const withRetry = async <T,>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> => {
      try { return await fn(); }
      catch (e: any) {
        if (retries > 0 && (e?.response?.status === 429 || e?.code === 'ECONNABORTED')) {
          await new Promise(r => setTimeout(r, delay));
          return withRetry(fn, retries - 1, delay * 2);
        }
        throw e;
      }
    };


    const fetchHomeData = async () => {
      try {
        ('[Home] Fetching featured anime from /api/curation/featured');
        const curatedFeaturedReq = () => axios.get('https://animaaz.onrender.com/api/curation/featured');
        ('[Home] Fetching popular anime from /api/anime/popular');
        const popularReq = () => axios.get('https://animaaz.onrender.com/api/anime/popular');
        ('[Home] Fetching genres from /api/anime/genres');
        const genresReq = () => axios.get('https://animaaz.onrender.com/api/anime/genres');
        ('[Home] Fetching trending anime from /api/curation/trending');
        const trendingReq = () => axios.get('https://animaaz.onrender.com/api/curation/trending');
        ('[Home] Fetching top week anime from /api/curation/topWeek');
        const topWeekReq = () => axios.get('https://animaaz.onrender.com/api/curation/topWeek');
        ('[Home] Fetching top airing anime from /api/curation/topAiring');
        const topAiringReq = () => axios.get('https://animaaz.onrender.com/api/curation/topAiring');
        ('[Home] Fetching for you anime from /api/curation/forYou');
        const forYouReq = () => axios.get('https://animaaz.onrender.com/api/curation/forYou');
        ('[Home] Fetching popular groups from /api/groups?limit=8');
        const groupsReq = () => axios.get('https://animaaz.onrender.com/api/groups?limit=8');
        ('[Home] Fetching recent posts from /api/community/posts?limit=6');
        const postsReq = () => axios.get('https://animaaz.onrender.com/api/community/posts?limit=6');
  ('[Home] Fetching banner anime from /api/curation/banner');
  const bannersReq = () => axios.get('https://animaaz.onrender.com/api/curation/banner');

        const [curatedFeaturedRes, popularRes, genresRes, trendingRes, topWeekRes, groupsRes, postsRes, bannersRes, topAiringRes, forYouRes] = await Promise.all([
          withRetry(curatedFeaturedReq),
          withRetry(popularReq),
          withRetry(genresReq),
          withRetry(trendingReq),
          withRetry(topWeekReq),
          withRetry(groupsReq),
          withRetry(postsReq),
          withRetry(bannersReq),
          withRetry(topAiringReq),
          withRetry(forYouReq)
        ]);

  // console.log('[Home] Featured anime response:', curatedFeaturedRes.data);
        setFeaturedAnime(curatedFeaturedRes.data.animeIds || []);
  // console.log('[Home] Trending anime response:', trendingRes.data);
        setTrendingAnime(trendingRes.data.animeIds || []);
  // console.log('[Home] Popular anime response:', popularRes.data);
        setPopularAnime(popularRes.data || []);
  // console.log('[Home] Genres response:', genresRes.data);
        setGenres(genresRes.data);
  // console.log('[Home] Top week anime response:', topWeekRes.data);
        setTopWeek(topWeekRes.data.animeIds || []);
  // console.log('[Home] Popular groups response:', groupsRes.data);
        setPopularGroups(groupsRes.data.groups);
  // console.log('[Home] Recent posts response:', postsRes.data);
        setRecentPosts(postsRes.data.posts);
  // console.log('[Home] Top airing anime response:', topAiringRes.data);
        setTopAiring(topAiringRes.data.animeIds || []);
  // console.log('[Home] For you anime response:', forYouRes.data);
        setForYou(forYouRes.data.animeIds || []);
  // console.log('[Home] Banners response:', bannersRes.data);
        const bannerData = (bannersRes.data || []).map((b:any)=>({ 
          _id: b._id,
          title: b.title,
          description: b.description,
          bannerImage: b.bannerImage,
          coverImage: b.coverImage,
          year: b.year,
          status: b.status,
          genres: b.genres
        }));
  // console.log('[Home] Mapped banner data:', bannerData);
        setBanners(bannerData);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with anime banners */}
      {banners.length > 0 ? (
        <HeroBanner items={banners} />
      ) : (
        <section className="relative bg-gradient-to-r from-purple-900 via-purple-800 to-pink-800 text-white overflow-hidden h-[70vh] min-h-[500px] flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-yellow-300 text-sm mb-4">
              Debug: No banners loaded ({banners.length} items)
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                AnimeHub
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-3xl mx-auto">
              Discover amazing anime, join vibrant communities, and connect with fellow otaku from around the world
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/groups"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Explore Groups
              </Link>
              <Link
                to="/community"
                className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 border border-white/30 flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Join Community
              </Link>
              <Link
                to="/search"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 border border-white/30 flex items-center justify-center"
              >
                All Anime
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Anime Section */}
      {featuredAnime.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Star className="w-8 h-8 mr-3 text-yellow-500" />
                Featured Anime
              </h2>
              <Link
                to="/featured"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:grid">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]" style={{scrollbarWidth:'none'}}>
                {featuredAnime.map((anime) => (
                  <div key={anime._id} className="min-w-[70%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section (Curated) */}
      {trendingAnime.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-pink-500" />
                Trending
              </h2>
              <Link to="/trending" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">View All →</Link>
            </div>
            <div className="md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]">
                {trendingAnime.slice(0, 10).map((anime) => (
                  <div key={anime._id} className="min-w-[70%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Section */}
      {popularAnime.length > 0 && (
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-red-500" />
                Most Popular
              </h2>
              <Link
                to="/most-popular"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]">
                {popularAnime.slice(0, 10).map((anime) => (
                  <div key={anime._id} className="min-w-[70%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top This Week */}
      {topWeek.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-green-500" />
                Top This Week
              </h2>
              <Link
                to="/top-week"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]">
                {topWeek.slice(0, 10).map((anime) => (
                  <div key={anime._id} className="min-w-[70%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top Airing (Curated) */}
      {topAiring.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-red-500" />
                Top Airing
              </h2>
              <Link
                to="/top-airing"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]">
                {topAiring.slice(0, 10).map((anime) => (
                  <div key={anime._id} className="min-w-[70%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* For You */}
      {forYou.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-pink-500" />
                For You
              </h2>
              <Link
                to="/for-you"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]">
                {forYou.slice(0, 10).map((anime) => (
                  <div key={anime._id} className="min-w-[70%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <AnimeCard anime={anime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Removed duplicate For You rail */}

      {/* Popular Groups Section */}
      {popularGroups.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-500" />
                Popular Groups
              </h2>
              <Link
                to="/groups"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="md:contents flex md:block overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 [-ms-overflow-style:none] [scrollbar-width:none]">
                {popularGroups.map((group) => (
                  <div key={group._id} className="min-w-[80%] sm:min-w-[50%] md:min-w-0 snap-start">
                    <GroupCard group={group} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Community Posts */}
      {recentPosts.length > 0 && (
        <section className="py-16 bg-gray-100 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <MessageCircle className="w-8 h-8 mr-3 text-green-500" />
                Latest Discussions
              </h2>
              <Link
                to="/community"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section
      <section className="py-16 bg-gradient-to-r from-purple-900 to-pink-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Join Our Growing Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-purple-200">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-purple-200">Anime Database</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-purple-200">Community Groups</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-purple-200">Discussions</div>
            </div>
          </div>
        </div>
      </section> */}
      {/* Genres Sidebar mimic */}
      {genres.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2"></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Link key={g} to={`/genre/${encodeURIComponent(g)}`} className="px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                      {g}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;