import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerItem {
  _id?: string;
  title: string;
  description: string;
  bannerImage?: string;
  coverImage: string;
  year?: number;
  status?: string;
  genres?: string[];
}

const HeroBanner: React.FC<{ items: BannerItem[] }> = ({ items }) => {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  const max = Math.min(items.length, 5);
  const visible = items.slice(0, max);

  // --- FUNCTIONALITY (KEPT INTACT) ---
  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (visible.length <= 1) return;
    
    // @ts-ignore
    timer.current = window.setInterval(() => {
      setIndex(i => (i + 1) % visible.length);
    }, 5000);
    
    return () => { 
      if (timer.current) window.clearInterval(timer.current); 
    };
  }, [visible.length]);

  if (visible.length === 0) return null;

  const currentItem = visible[index];

  // Touch swipe support for mobile (KEPT INTACT)
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) setIndex((index - 1 + visible.length) % visible.length);
      else setIndex((index + 1) % visible.length);
    }
    touchStartX.current = null;
  };
  
  const goToPrev = () => setIndex((index - 1 + visible.length) % visible.length);
  const goToNext = () => setIndex((index + 1) % visible.length);
  // ------------------------------------

  return (
    // Mobile height is shorter (e.g., h-[50vh]), desktop falls back to h-[70vh]
    <div 
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[400px] overflow-hidden" 
      onTouchStart={onTouchStart} 
      onTouchEnd={onTouchEnd}
    >
      
      {/* Carousel Container with Slide Animation (Mobile-First Background) */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {visible.map((item, i) => (
          <div 
            key={i} 
            className="w-full h-full flex-shrink-0 relative"
            style={{ 
              backgroundImage: `url(${item.bannerImage || item.coverImage})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
            }}
          >
            {/* Gradient Overlay: Dark from bottom and left/right for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/60"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20"></div>
          </div>
        ))}
      </div>

      {/* Content (Anchored to the Bottom-Left on mobile, center/left on desktop) */}
      <div className="absolute inset-0 flex items-end md:items-center pb-8 px-4 sm:px-6 md:pb-16 md:px-16 text-white z-10">
        <div className="max-w-[75%] md:max-w-3xl space-y-2 md:space-y-4"> 
          
          {/* Spotlight Badge (REMOVED FOR DESKTOP/LAPTOP VIEW - but keeping logic for mobile only) */}
          {/* <div className="md:hidden flex items-center space-x-2">
            <span className="text-xs font-semibold bg-red-600 px-2 py-0.5 rounded tracking-wider uppercase">
              #6 Spotlight
            </span>
          </div> */}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            {currentItem.title}
          </h1>

          {/* Description (Visible on Desktop/Laptop) */}
          <p className="hidden md:block text-base text-gray-300 line-clamp-3 max-w-2xl">
            {currentItem.description.length > 250 
              ? `${currentItem.description.substring(0, 250)}...` 
              : currentItem.description
            }
          </p>
        
          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2 md:pt-4">
            <button
              type="button"
              onClick={() => {
                window.open(`https://hianime.nz/search?keyword=${encodeURIComponent(currentItem.title)}`, '_blank');
              }}
              className="flex items-center px-4 py-2 md:px-6 md:py-3 bg-pink-500 text-black text-sm md:text-base font-bold rounded-full md:rounded-lg hover:bg-pink-400 transition-all shadow-lg"
            >
              <Play className="w-4 h-4 mr-1 fill-current" />
              Watch Now
            </button>
            <Link 
              to={currentItem._id ? `/anime/${currentItem._id}` : '#'} 
              className="flex items-center px-4 py-2 md:px-6 md:py-3 bg-white/20 text-white text-sm md:text-base font-bold rounded-full md:rounded-lg hover:bg-white/30 transition-all border border-white/30"
            >
              Detail <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Dots (VERTICAL and Right-Aligned - For both mobile/desktop) */}
      {visible.length > 1 && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-2 z-20">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === index ? 'bg-orange-400 w-2.5 h-2.5' : 'bg-white/50 w-2 h-2'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Navigation Arrows (BOTTOM-RIGHT CORNER - Desktop/Laptop Only) */}
      {visible.length > 1 && (
        <div className="hidden md:flex flex-col space-y-2 absolute bottom-6 right-6 z-20">
          {/* Next Arrow (Top Button) */}
          <button 
            onClick={goToNext}
            className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-colors"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Previous Arrow (Bottom Button) */}
          <button 
            onClick={goToPrev}
            className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-colors"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
