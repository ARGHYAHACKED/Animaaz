import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. ANIME CIRCLE (High Energy Style with Fixed Badge)
const AnimeCircle: React.FC<{ anime: any; rank: number; onClick: () => void }> = ({ anime, rank, onClick }) => (
  <div 
    className="flex flex-col items-center mx-3 cursor-pointer group transition-transform duration-300 hover:scale-[1.05] hover:z-10 flex-shrink-0" 
    onClick={onClick}
  >
    {/* Circle Container */}
    <div className="flex-shrink-0 w-24 h-24 rounded-full border-[6px] border-red-500 shadow-xl overflow-hidden relative transition-all duration-300 group-hover:border-yellow-400 group-hover:shadow-2xl">
      {anime.coverImage ? (
        <img 
          src={anime.coverImage} 
          alt={anime.title} 
          className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-[1.1]" 
        />
      ) : (
        <div className="w-full h-full bg-red-900 flex items-center justify-center text-yellow-400 font-extrabold text-xs">NO COVER</div>
      )}
      
      {/* Rank Badge - Sits OVER the circle, using neon yellow/black for high contrast */}
      <span className="absolute top-[-4px] left-[-4px] bg-yellow-400 text-red-900 text-md font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-white transform rotate-[-10deg] transition-all duration-300 group-hover:bg-red-600 group-hover:text-white group-hover:scale-110 z-10">
        #{rank}
      </span>
    </div>
    
    {/* Title */}
    <span className="mt-3 text-gray-700 font-semibold text-sm text-center w-24 truncate transition-colors duration-300 group-hover:text-red-600">
      {anime.title}
    </span>
  </div>
);

// 2. ANIME CARD (High Energy Style)
const AnimeCard: React.FC<{ anime: any; onClick: () => void }> = ({ anime, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-lg p-3 flex flex-col items-center cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 group border-b-4 border-transparent hover:border-red-600" 
    onClick={onClick}
  >
    {/* Image */}
    <div className="relative w-full">
        <img 
            src={anime.coverImage} 
            alt={anime.title} 
            className="w-full h-56 object-cover rounded-lg mb-3 shadow-md transition-transform duration-500 group-hover:scale-[1.02] opacity-95" 
        />
        {/* Subtle dynamic overlay for atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-red-100/20 to-transparent rounded-lg"></div>
    </div>
    
    {/* Title */}
    <h3 className="text-gray-900 font-extrabold text-lg mb-1 text-center line-clamp-2 transition-colors duration-300 group-hover:text-red-600 px-1">
      {anime.title}
    </h3>
    
    {/* Description/Synopsis */}
    <p className="text-gray-500 text-sm text-center line-clamp-3 mb-2 px-1">
      {anime.description}
    </p>
  </div>
);

// 3. HIGH ENERGY PAGE (Vertical Grid Layout)
const HighEnergy: React.FC = () => {
    const [anime, setAnime] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showScroll, setShowScroll] = useState(false);
    const navigate = useNavigate();

    // --- SCROLL TO TOP & BUTTON LOGIC ---
    useEffect(() => { window.scrollTo(0, 0); }, []);

    useEffect(() => {
        const checkScrollTop = () => {
            if (!showScroll && window.scrollY > 400) {
                setShowScroll(true);
            } else if (showScroll && window.scrollY <= 400) {
                setShowScroll(false);
            }
        };
        window.addEventListener('scroll', checkScrollTop);
        return () => window.removeEventListener('scroll', checkScrollTop);
    }, [showScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- FETCH LOGIC (Pagination) ---
    const fetchAnime = async (pageNumber: number, isInitialLoad: boolean) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/mood/high-energy?page=${pageNumber}`);
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

    const topAnime = anime.slice(0, 10);
    const restAnime = anime.slice(10); 

    return (
        // Main container uses LIGHT RED background
        <div className="bg-red-100 w-full min-h-screen pt-16 pb-10 flex flex-col items-center relative">
            
            {/* HEADER SECTION */}
            <header className="text-center mb-12 w-full max-w-6xl px-4 animate-fadeIn">
                <h1 className="text-6xl font-extrabold text-red-700 tracking-tighter mb-3 drop-shadow-md">
                    💥 High Energy
                </h1>
                <p className="text-xl text-gray-700 font-light italic max-w-2xl mx-auto">
                    Explosive action, non-stop battles, tournament arcs, and pure shounen hype.
                </p>
            </header>
          
            {anime.length === 0 && loading ? (
                <div className="text-red-700 text-lg font-semibold animate-pulse">Charging up the battle aura...</div> 
            ) : (
                <>
                    {/* -------------------------------------------------------- */}
                    {/* SECTION 1: TOP 10 CIRCLES (Centered and Horizontally Scrollable) */}
                    {/* -------------------------------------------------------- */}
                    <section className="w-full mb-16 max-w-6xl px-4">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b-2 border-red-500 pb-2 text-center">Top 10 Action-Packed Adrenaline Hits</h2>
                        
                        {/* Scroll Container (Using fixed spacing solution) */}
                        <div className="overflow-x-auto scrollbar-hide py-4 w-full"> 
                            {/* Inner container with padding to ensure full visibility of first/last circle */}
                            <div className="flex items-start justify-center flex-shrink-0 w-max mx-auto px-8"> 
                                {topAnime.map((item, idx) => (
                                    <AnimeCircle 
                                        key={item._id || `circle-${idx}`} 
                                        anime={item} 
                                        rank={idx + 1} 
                                        onClick={() => navigate(`/anime/${item._id}`)} 
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
                  
                    {/* -------------------------------------------------------- */}
                    {/* SECTION 2: CARD GRID (Vertical Layout) */}
                    {/* -------------------------------------------------------- */}
                    <section className="w-full max-w-6xl px-4">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6 border-b-2 border-yellow-400 pb-2 text-center">More Power-Ups and Epic Fights</h2>

                        {/* Card Grid Container (4x4 Responsive Grid) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                            {restAnime.map((item, idx) => (
                                <AnimeCard 
                                    key={item._id || `card-${idx}`} 
                                    anime={item} 
                                    onClick={() => navigate(`/anime/${item._id}`)} 
                                />
                            ))}
                        </div>
                    </section>
                  
                    {/* LOAD MORE / FOOTER */}
                    <div className="mt-12 text-center">
                        {hasMore && (
                            <button 
                                onClick={handleLoadMore} 
                                disabled={loading}
                                className="px-10 py-4 bg-red-700 text-white text-lg font-bold rounded-full shadow-2xl hover:bg-red-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Unleashing the Next Level...' : 'Load More Energy'}
                            </button>
                        )}
                        {!hasMore && anime.length > 0 && !loading && (
                            <p className="mt-6 text-lg text-gray-500 font-medium">Power levels are maxed out! Nothing left to fight. 🛑</p>
                        )}
                    </div>
                </>
            )}

            {/* BACK TO TOP BUTTON */}
            {showScroll && (
                <button 
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-red-700 text-white p-4 rounded-full shadow-lg hover:bg-red-800 transition-opacity duration-300 z-50 transform hover:scale-110"
                    aria-label="Back to Top"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default HighEnergy;