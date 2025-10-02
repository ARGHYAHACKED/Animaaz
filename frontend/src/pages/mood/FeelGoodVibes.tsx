import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// --- ANIMATION CONCEPT: FADE-IN KEYFRAMES (You would define this in your main CSS file) ---
// @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
// .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }


// 1. ANIME CIRCLE (Enhanced with subtle 3D hover)
const AnimeCircle: React.FC<{ anime: any; rank: number; onClick: () => void }> = ({ anime, rank, onClick }) => (
  <div 
    className="flex flex-col items-center mx-3 cursor-pointer group transition-transform duration-300 hover:scale-[1.05] hover:z-10" 
    onClick={onClick}
  >
    {/* Circle Container */}
    <div className="w-24 h-24 rounded-full border-[6px] border-amber-300 shadow-xl overflow-hidden relative transition-all duration-300 group-hover:border-amber-500 group-hover:shadow-2xl">
      {anime.coverImage ? (
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-[1.1]" 
        />
      ) : (
        <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700 font-extrabold text-xs">NO COVER</div>
      )}
      
      {/* Rank Badge */}
      <span className="absolute top-[-4px] left-[-4px] bg-amber-500 text-white text-md font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-white transform rotate-[-10deg] transition-all duration-300 group-hover:bg-green-600 group-hover:scale-110">
        #{rank}
      </span>
    </div>
    
    {/* Title */}
    <span className="mt-3 text-gray-800 font-semibold text-sm text-center w-24 truncate transition-colors duration-300 group-hover:text-amber-600">
      {anime.title}
    </span>
  </div>
);

// 2. ANIME CARD (Enhanced with lift, border animation, and improved typography)
const AnimeCard: React.FC<{ anime: any; onClick: () => void }> = ({ anime, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-lg p-3 flex flex-col items-center cursor-pointer transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group border-b-4 border-transparent hover:border-amber-400" 
    onClick={onClick}
  >
    {/* Image */}
    <div className="relative w-full">
        <img 
            src={anime.coverImage} 
            alt={anime.title} 
            className="w-full h-56 object-cover rounded-lg mb-3 shadow-md transition-transform duration-500 group-hover:scale-[1.02]" 
        />
        {/* Subtle overlay for visual interest */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-lg"></div>
    </div>
    
    {/* Title */}
    <h3 className="text-gray-900 font-extrabold text-lg mb-1 text-center line-clamp-2 transition-colors duration-300 group-hover:text-green-600 px-1">
      {anime.title}
    </h3>
    
    {/* Description/Synopsis */}
    <p className="text-gray-500 text-sm text-center line-clamp-3 mb-2 px-1">
      {anime.description}
    </p>
  </div>
);

// 3. FEEL GOOD VIBES PAGE (Staggered Entry Concept)
const FeelGoodVibes: React.FC = () => {
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  // --- GSAP INTEGRATION CONCEPT ---
  // If using GSAP, you would place a useEffect here to run a Staggered Fade-In animation
  // on the anime cards when `anime` state changes, giving the UI a fluid entry.
  // Example: gsap.from(".anime-card", { opacity: 0, y: 50, stagger: 0.1, duration: 0.6 });
  
  const fetchAnime = async (pageNumber: number, isInitialLoad: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mood/feel-good-vibes?page=${pageNumber}`);
      const data = await res.json();
      
      const newAnime = data.anime || [];
      
      setAnime((prevAnime) => isInitialLoad ? newAnime : [...prevAnime, ...newAnime]);

      if (newAnime.length < 20) {
          setHasMore(false);
      }
      setPage(pageNumber);
    } catch (error) {
      console.error("Fetch error:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchAnime(page + 1, false);
    }
  };
    
  useEffect(() => {
    fetchAnime(1, true);
  }, []);

  const topAnime = anime.slice(0, 4);
  const restAnime = anime.slice(4);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      
      {/* HEADER SECTION */}
      <header className="text-center mb-12 animate-fadeIn">
        <h1 className="text-6xl font-extrabold text-green-700 tracking-tighter mb-3 drop-shadow-md">
          ✨ Feel-Good Vibes
        </h1>
        <p className="text-xl text-gray-600 font-light italic max-w-2xl mx-auto">
          Wholesome, heartwarming shows curated to lift your spirits and bring a smile to your face.
        </p>
      </header>
      
      {anime.length === 0 && loading ? (
        <div className="text-green-600 text-lg font-semibold animate-pulse">Loading the Goodness...</div> 
      ) : (
        <>
          {/* TOP RANKED SECTION */}
          <section className="w-full max-w-6xl mb-16">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b-2 border-amber-400 pb-2 text-center">Top Picks This Month</h2>
            <div className="flex justify-center items-start">
              {topAnime.map((item, idx) => (
                <AnimeCircle 
                  key={item._id || `circle-${idx}`} 
                  anime={item} 
                  rank={idx + 1} 
                  onClick={() => navigate(`/anime/${item._id}`)} 
                />
              ))}
            </div>
          </section>
          
          {/* CARD GRID SECTION */}
          <section className="w-full max-w-6xl">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b-2 border-green-400 pb-2 text-center">More Wholesome Shows</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 w-full">
              {restAnime.map((item, idx) => (
                <div className="anime-card" key={item._id || `card-${idx}`}>
                  <AnimeCard 
                    anime={item} 
                    onClick={() => navigate(`/anime/${item._id}`)} 
                  />
                </div>
              ))}
            </div>
          </section>
          
          {/* LOAD MORE / FOOTER */}
          {hasMore && (
              <button 
                  onClick={handleLoadMore} 
                  disabled={loading}
                  className="mt-12 px-10 py-4 bg-green-600 text-white text-lg font-bold rounded-full shadow-2xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {loading ? 'Loading More Goodness...' : 'Load More Vibes'}
              </button>
          )}

          {!hasMore && anime.length > 0 && !loading && (
            <p className="mt-12 text-lg text-gray-500 font-medium">You've reached the end! Time to start watching. 🎉</p>
          )}
        </>
      )}
    </div>
  );
};

export default FeelGoodVibes;