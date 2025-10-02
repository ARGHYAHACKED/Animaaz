import React from "react";
import { useNavigate } from "react-router-dom";

// Reusable MoodCard component
interface MoodCardProps {
  label: string;
  color: string;
}

const MoodCard: React.FC<MoodCardProps & { onClick?: () => void }> = ({ label, color, onClick }) => (
  <div
    className={`bg-gray-900 rounded-lg px-6 py-4 flex items-center font-semibold text-lg cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${color}`}
    style={{ minHeight: 60 }}
    onClick={onClick}
  >
    {label}
  </div>
);

// New component for the recommendation button/card
const RecommendationCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div
        className="col-span-2 md:col-span-4 bg-violet-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 hover:bg-violet-800 hover:shadow-xl shadow-violet-700/50 mt-12 mb-6"
        onClick={onClick}
    >
        <h3 className="text-3xl font-extrabold text-white mb-2">
            🤔 Still Not Sure What to Watch?
        </h3>
        <p className="text-lg text-violet-200 mb-4 font-light">
            Let us recommend some of our favorites based on your unique taste.
        </p>
        <button
            className="px-8 py-3 bg-white text-violet-700 font-bold text-lg rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
            ✨ Get Personalized Anime
        </button>
    </div>
);


// MAPPING (retained for context, though not used in this component logic)
const moodGenreMap: Record<string, number> = {
  happy: 4,      // Comedy
  sad: 8,        // Drama
  romance: 22,   // Romance
  chill: 22,     // Slice of Life
  horror: 14,    // Horror
  adventure: 2,  // Adventure
  energize: 1,   // Action
  focus: 24,     // Psychological
  party: 4,      // Comedy
  sleep: 22,     // Slice of Life
  workout: 1,    // Action
  feelgood: 22,  // Slice of Life
};

const fetchAnimeByMood = async (mood: string) => {
  const genreId = moodGenreMap[mood.toLowerCase()] || 22;
  const url = `https://api.jikan.moe/v4/anime?genres=${genreId}&order_by=score&sort=desc&limit=5`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    (`Anime for mood '${mood}':`, data.data);
  } catch (err) {
    console.error('Error fetching from Jikan:', err);
  }
};

const moods = [
  // 🎭 Emotional Moods
  { label: "Feel-Good Vibes", key: "feel-good-vibes", color: "border-l-4 border-green-400" },
  { label: "Tearjerker Nights", key: "tearjerker-nights", color: "border-l-4 border-blue-400" },
  { label: "Chill & Cozy", key: "chill-cozy", color: "border-l-4 border-green-200" },
  { label: "Adrenaline Rush", key: "adrenaline-rush", color: "border-l-4 border-pink-400" },
  { label: "Mind-Bender", key: "mind-bender", color: "border-l-4 border-gray-400" },
  { label: "Romantic Feels", key: "romantic-feels", color: "border-l-4 border-red-400" },
  // 🌌 Atmosphere Moods
  { label: "Dreamscape", key: "dreamscape", color: "border-l-4 border-purple-400" },
  { label: "Dark & Gritty", key: "dark-gritty", color: "border-l-4 border-gray-900" },
  { label: "Nostalgia Lane", key: "nostalgia-lane", color: "border-l-4 border-yellow-400" },
  { label: "Epic Journeys", key: "epic-journeys", color: "border-l-4 border-orange-400" },
  { label: "Laugh Out Loud", key: "laugh-out-loud", color: "border-l-4 border-pink-300" },
  { label: "Calm Before Sleep", key: "calm-before-sleep", color: "border-l-4 border-blue-200" },
  // 🎶 Energy-Based Moods
  { label: "High Energy", key: "high-energy", color: "border-l-4 border-red-300" },
  { label: "Slow Burn", key: "slow-burn", color: "border-l-4 border-gray-200" },
  { label: "Aesthetic Mood", key: "aesthetic-mood", color: "border-l-4 border-indigo-400" },
  { label: "Cozy Rainy Day", key: "cozy-rainy-day", color: "border-l-4 border-blue-300" },
];

const WatchOnYourMood: React.FC = () => {
 window.scrollTo({ top: 0, behavior: 'instant' })
  const navigate = useNavigate();

    const handlePersonalizeClick = () => {
        // Navigate to the new personalized recommendation page
        navigate('/personalize'); 
    };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-10 mt-6">
                <h1 className="text-5xl font-extrabold text-white mb-2">Watch By Your Mood</h1>
                <p className="text-xl text-gray-400">Find the perfect anime vibe for your current feeling.</p>
            </div>

            {/* Mood Grid Section */}
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Moods & Moments</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {moods.map((mood) => (
            <MoodCard
              key={mood.key}
              label={mood.label}
              color={mood.color}
              onClick={() => navigate(`/mood/${mood.key}`)}
            />
          ))}
        </div>

            {/* New Personalized Recommendation Section */}
            <RecommendationCard onClick={handlePersonalizeClick} />

      </div>
    </div>
  );
};

export default WatchOnYourMood;