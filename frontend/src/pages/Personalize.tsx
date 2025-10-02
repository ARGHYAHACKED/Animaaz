  import React, { useEffect, useState, useRef } from "react";
  import { gsap } from "gsap";
  import api from "../utils/api";
  import { useAuth } from "../contexts/AuthContext";
  import AnimeCard from "../components/AnimeCard";
  import GlassCard from "../components/GlassCard";

  interface Milestone {
    anime: any;
    completed: boolean;
  }

  const Personalize: React.FC = () => {
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
      if (!user) return;
      setLoading(true);
      api.get('/users/milestones').then(res => {
        setMilestones(res.data.milestoneAnime || []);
        setLoading(false);
      });
    }, [user]);

    useEffect(() => {
      // Load GSAP
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.gsap !== 'undefined' && !loading) {
          window.gsap.from('.milestone-card-animate', {
            opacity: 0,
            y: 50,
            duration: 0.6,
            stagger: 0.15,
            ease: 'power3.out'
          });
        }
      };
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }, [loading]);

    // Scroll to next milestone card
    const scrollToCard = (idx: number) => {
      const el = document.getElementById(`milestone-card-${idx}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-purple-400');
        setTimeout(() => el.classList.remove('ring-4', 'ring-purple-400'), 1200);
      }
    };

    const handleToggle = async (animeId: string, completed: boolean, idx: number) => {
      setSaving(true);

      // GSAP animation for checkbox click
      if (typeof window.gsap !== 'undefined' && cardRefs.current[idx]) {
        const card = cardRefs.current[idx];
        window.gsap.to(card, {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        });

        // Animate connecting line if completing
        if (!completed && idx < milestones.length - 1) {
          const line = card?.querySelector('.connecting-line-svg');
          if (line) {
            window.gsap.fromTo(line, 
              { attr: { 'stroke-dashoffset': 1000 } },
              { attr: { 'stroke-dashoffset': 0 }, duration: 0.8, ease: 'power2.inOut' }
            );
          }
        }
      }

      await api.post(`/users/milestones/${animeId}`, { completed: !completed });
      // Refresh milestones
      const res = await api.get('/users/milestones');
      setMilestones(res.data.milestoneAnime || []);
      setSaving(false);
      // If marking as complete, scroll to next
      if (!completed && milestones.length > idx + 1) {
        setTimeout(() => scrollToCard(idx + 1), 300);
      }
    };

    const getCardClasses = (idx: number, completed: boolean) => {
      if (completed) {
        return 'opacity-60 grayscale';
      }
      if (idx > 0 && !milestones[idx - 1]?.completed) {
        return 'opacity-40';
      }
      return 'shadow-xl shadow-violet-500/20';
    };

    const getBadgeClasses = (idx: number, completed: boolean) => {
      if (completed) {
        return 'bg-green-500 text-white shadow-lg shadow-green-500/50';
      }
      if (idx > 0 && !milestones[idx - 1]?.completed) {
        return 'bg-gray-600 text-gray-300';
      }
      return 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/50 animate-pulse';
    };

    const completedCount = milestones.filter(m => m.completed).length;
    const progressPercent = (completedCount / (milestones.length || 1)) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-950 to-black text-white px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Your Anime Roadmap
          </h1>
          <p className="text-base sm:text-lg text-violet-300 max-w-2xl mx-auto mb-8">
            Complete these 5 milestone anime, handpicked for you by the admins! Mark each as complete as you finish them. 🎌
          </p>
          
          {/* Progress Shape Indicator */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-violet-400 font-semibold">Journey Progress</span>
              <span className="text-sm font-bold text-violet-300">
                {completedCount} / {milestones.length}
              </span>
            </div>
            <div className="relative h-4 bg-violet-950/50 rounded-full overflow-hidden border border-violet-800/30">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 transition-all duration-700 ease-out rounded-full"
                style={{ 
                  width: `${progressPercent}%`,
                  boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)'
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-violet-300 text-lg">Loading your anime journey...</p>
            </div>
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center text-violet-200 py-20">No milestones set for your account yet.</div>
        ) : (
          <div className="max-w-5xl mx-auto relative">
            {/* Timeline Container */}
            <div className="relative">
              {/* Desktop Timeline */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 -ml-0.5">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-800/50 via-purple-700/50 to-pink-700/50"></div>
              </div>

              {/* Mobile Timeline */}
              <div className="lg:hidden absolute left-10 top-0 bottom-0 w-0.5">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-800/50 via-purple-700/50 to-pink-700/50"></div>
              </div>

              <div className="space-y-0">
                {milestones.map((m, idx) => m.anime && (
                  <div 
                    key={m.anime._id} 
                    id={`milestone-card-${idx}`}
                    ref={el => cardRefs.current[idx] = el}
                    className={`milestone-card-animate relative flex flex-col lg:flex-row items-start lg:items-center gap-6 py-6 ${
                      idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center lg:justify-center lg:flex-1 relative z-10">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${getBadgeClasses(idx, m.completed)}`}>
                        {m.completed ? (
                          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : idx > 0 && !milestones[idx - 1]?.completed ? (
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className={`flex-1 lg:max-w-md ml-24 lg:ml-0 transition-all duration-500 ${getCardClasses(idx, m.completed)}`}>
                      <GlassCard className="relative overflow-hidden border-2 border-violet-600/30 hover:border-violet-500/50 transition-all duration-300">
                        {/* Badge Number on Card */}
                        <div className={`absolute top-4 left-4 z-20 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getBadgeClasses(idx, m.completed)}`}>
                          {idx + 1}
                        </div>

                        {/* Checkbox */}
                        <div className="absolute top-4 right-4 z-20">
                          <label className="flex items-center cursor-pointer select-none group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={!!m.completed}
                                disabled={saving || (idx > 0 && !milestones[idx - 1]?.completed)}
                                onChange={() => handleToggle(m.anime._id, m.completed, idx)}
                                className="sr-only"
                              />
                              <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                m.completed 
                                  ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/50' 
                                  : idx > 0 && !milestones[idx - 1]?.completed
                                  ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
                                  : 'bg-violet-900/50 border-violet-500 group-hover:bg-violet-800/50 group-hover:border-violet-400 cursor-pointer'
                              }`}>
                                {m.completed && (
                                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className="ml-2 text-xs text-violet-300 font-semibold hidden sm:block">
                              {m.completed ? '✓ Done' : idx > 0 && !milestones[idx - 1]?.completed ? 'Locked' : 'Click'}
                            </span>
                          </label>
                        </div>

                        <div className="p-6 pt-16">
                          <AnimeCard anime={m.anime} />
                          <div className="mt-4 text-center">
                            <span className="text-violet-300 font-semibold text-sm">
                              Milestone {idx + 1} of {milestones.length}
                            </span>
                          </div>
                        </div>

                        {/* Completion Overlay */}
                        {m.completed && (
                          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20 pointer-events-none"></div>
                        )}
                      </GlassCard>
                    </div>

                    {/* Connecting Line SVG */}
                    {idx < milestones.length - 1 && (
                      <svg 
                        className="connecting-line-svg absolute left-10 lg:left-1/2 w-0.5 lg:w-1 h-16 top-full -mt-8 z-0"
                        style={{ overflow: 'visible' }}
                      >
                        <line
                          x1="50%"
                          y1="0"
                          x2="50%"
                          y2="100%"
                          className={`transition-all duration-500 ${
                            m.completed ? 'stroke-green-500' : 'stroke-violet-800/30'
                          }`}
                          strokeWidth="4"
                          strokeDasharray="1000"
                          strokeDashoffset="0"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Completion Celebration */}
        {milestones.length > 0 && milestones.every(m => m.completed) && (
          <div className="max-w-2xl mx-auto mt-16 p-8 bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-2 border-green-500 rounded-2xl text-center backdrop-blur-xl animate-pulse">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4 text-green-300">Congratulations!</h2>
            <p className="text-green-200 text-lg">
              You've completed all your milestone anime! Your personalized journey is now complete.
            </p>
          </div>
        )}
      </div>
    );
  };

  export default Personalize;