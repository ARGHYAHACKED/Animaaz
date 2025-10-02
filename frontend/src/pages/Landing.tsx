import React, { useState } from 'react';

// --- Configuration and Data ---
const FEATURE_DATA = [
  {
    icon: '✨',
    title: 'Personalized Roadmap',
    description: 'Track your watch progress and get a tailored "Plan-to-Watch" list based on your history and interests. Never miss a masterpiece.',
    color: 'bg-green-100/70 text-green-700',
  },
  {
    icon: '💡',
    title: 'Smart Recommendations',
    description: 'AI-driven suggestions that understand your taste beyond genres. Discover hidden gems and trending shows instantly.',
    color: 'bg-yellow-100/70 text-yellow-700',
  },
  {
    icon: '💰',
    title: 'Aniz Coin Farming',
    description: 'Engage with the community, review episodes, and complete challenges to earn Aniz Coins, redeemable for exclusive swag.',
    color: 'bg-white/70 text-gray-800',
  },
  {
    icon: '🤝',
    title: 'Themed Groups & Guilds',
    description: 'Join private or public groups dedicated to specific shows or genres. Organize watch parties and debate the latest chapters.',
    color: 'bg-green-100/70 text-green-700',
  },
];

// --- Helper Components ---

// Simple Modal for simulated Login/SignUp
const AuthModal = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl p-8 shadow-2xl w-full max-w-md transform transition-all scale-100 animate-slide-in">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
          {type === 'login' ? 'Welcome Back!' : 'Join Anime2 Today!'}
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="user@anime2.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-[1.01] animate-pulse-once"
            onClick={(e) => { e.preventDefault(); alert(`Simulated ${type} successful!`); onClose(); }}
          >
            {type === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-6 w-full text-sm text-gray-500 hover:text-gray-700 transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }) => (
  <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${color} flex flex-col items-center text-center backdrop-blur-sm border border-opacity-20 border-gray-200`}>
    <div className
="text-5xl mb-4 transform hover:rotate-3 transition duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-gray-900">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// --- Main Component ---

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authType, setAuthType] = useState('login');

  const openModal = (type) => {
    setAuthType(type);
    setIsModalOpen(true);
  };

  // Simulated Auth Check: Always returns unauthenticated for this landing page simulation
  const user = null;
  const loading = false;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-gray-700">Loading...</div>;
  if (user) return <div className="min-h-screen flex items-center justify-center bg-green-500 text-white text-2xl">Redirecting to Dashboard...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Bangers&display=swap');
          .font-display { font-family: 'Bangers', cursive; }
          .font-sans { font-family: 'Inter', sans-serif; }

          /* Subtle pulse on important buttons */
          @keyframes pulse-once {
            0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.5); }
            50% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
            100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
          }
          .animate-pulse-once {
            animation: pulse-once 1.5s ease-out 1;
          }

          /* Subtle fade-in for features */
          .feature-item {
            opacity: 0;
            transform: translateY(20px);
            animation: slide-up 0.5s ease-out forwards;
          }
          @keyframes slide-up {
            to { opacity: 1; transform: translateY(0); }
          }

          /* Modal slide in */
          @keyframes slide-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-slide-in {
            animation: slide-in 0.3s ease-out forwards;
          }

          /* Hero element shimmer */
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .shimmer-text {
            background: linear-gradient(90deg, #f0f0f0 0%, #fff0d6 50%, #f0f0f0 100%);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            background-size: 200% 100%;
            animation: shimmer 8s infinite linear;
          }

        `}
      </style>

      {/* --- Auth Modal --- */}
      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={authType} />

      {/* --- Navigation Bar --- */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-display text-green-500 tracking-wider">Anime2</span>
            <span className="text-xl">🍥</span>
          </div>

          {/* Navigation Links (Mobile Hidden) */}
          <nav className="hidden md:flex space-x-8 text-gray-600 font-medium">
            <a href="#features" className="hover:text-green-500 transition duration-200">Features</a>
            <a href="#community" className="hover:text-green-500 transition duration-200">Community</a>
            <a href="#coin" className="hover:text-green-500 transition duration-200">Aniz Coin</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => openModal('login')}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-transparent rounded-full hover:bg-yellow-50 transition duration-300"
            >
              Log In
            </button>
            <button
              onClick={() => openModal('signup')}
              className="px-6 py-2 text-sm font-bold bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition duration-300 transform hover:scale-[1.05]"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-36 bg-gradient-to-br from-white via-green-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl md:text-8xl font-extrabold leading-tight mb-4">
              Your Ultimate
              <br className="hidden sm:block" />
              <span className="shimmer-text font-display text-yellow-500 text-shadow-lg"> Anime Universe</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Anime2 is where discovery meets community. Get personalized roadmaps, join active groups, and earn rewards for your passion.
            </p>
            <button
              onClick={() => openModal('signup')}
              className="text-xl font-bold py-3 px-10 bg-green-500 text-white rounded-xl shadow-2xl shadow-green-400/50 hover:bg-green-600 transition duration-500 transform hover:scale-105 animate-pulse-once"
            >
              Start Your Journey — It's Free!
            </button>
          </div>

          {/* Decorative floating elements (simulated anime sprites/coins) */}
          <div className="absolute top-10 left-5 animate-spin-slow hidden md:block">
            <span className="text-4xl text-yellow-400">⭐</span>
          </div>
          <div className="absolute bottom-20 right-10 animate-pulse hidden md:block" style={{ animationDelay: '1s' }}>
            <span className="text-5xl text-green-500">🍃</span>
          </div>
        </section>

        {/* --- Features Grid Section --- */}
        <section id="features" className="py-20 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800">
              The Community Features You Deserve
            </h2>
            <p className="text-lg text-center text-gray-500 max-w-2xl mx-auto mb-16">
              A modern platform built by fans, for fans. Experience anime networking on a whole new level.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURE_DATA.map((feature, index) => (
                <div
                  key={index}
                  className="feature-item"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Call to Action Footer --- */}
        <section id="community" className="py-16 md:py-24 bg-green-500">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Connect and Conquer?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Thousands of fans are already charting their path and sharing the hype. Don't watch alone.
            </p>
            <button
              onClick={() => openModal('signup')}
              className="text-lg font-bold py-4 px-12 bg-yellow-400 text-gray-900 rounded-full shadow-xl hover:bg-yellow-300 transition duration-300 transform hover:scale-105"
            >
              Join the Hype Train
            </button>
          </div>
        </section>
      </main>

      <footer className="py-6 bg-gray-900 text-gray-400 text-center text-sm">
        &copy; 2024 Anime2. Built with passion for the global Anime Community.
      </footer>
    </div>
  );
};

export default App;
