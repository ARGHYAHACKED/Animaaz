import Featured from './pages/Featured';
import WatchOnYourMood from './pages/WatchOnYourMood';
import Landing from './pages/Landing';
import Trending from './pages/Trending';
import ForYou from './pages/ForYou';
import TopWeek from './pages/TopWeek';
import TopAiring from './pages/TopAiring';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AnimeDetails from './pages/AnimeDetails';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Community from './pages/Community';
import PostDetails from './pages/PostDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminContentManagement from './pages/AdminContentManagement';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminUserAccounts from './pages/AdminUserAccounts';
import AdminUserStats from './pages/AdminUserStats';
import AdminCurationParent from './pages/AdminCurationParent';
import AdminCurationTrending from './pages/AdminCurationTrending';
import AdminCurationFeatured from './pages/AdminCurationFeatured';
import AdminCurationBanner from './pages/AdminCurationBanner';
import AdminCurationTopAiring from './pages/AdminCurationTopAiring';
import AdminCurationTopWeek from './pages/AdminCurationTopWeek';
import AdminCurationForYou from './pages/AdminCurationForYou';
import AdminCurationIndex from './pages/AdminCurationIndex';
import AdminPosts from './pages/AdminPosts';
import AdminGroups from './pages/AdminGroups';
import AdminMilestones from './pages/AdminMilestones';
import Search from './pages/Search';
import MostPopular from './pages/MostPopular';
import Personalize from './pages/Personalize';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Genre from './pages/Genre';
// Mood pages
import FeelGoodVibes from './pages/mood/FeelGoodVibes';
import TearjerkerNights from './pages/mood/TearjerkerNights';
import ChillCozy from './pages/mood/ChillCozy';
import AdrenalineRush from './pages/mood/AdrenalineRush';
import MindBender from './pages/mood/MindBender';
import RomanticFeels from './pages/mood/RomanticFeels';
import Dreamscape from './pages/mood/Dreamscape';
import DarkGritty from './pages/mood/DarkGritty';
import NostalgiaLane from './pages/mood/NostalgiaLane';
import EpicJourneys from './pages/mood/EpicJourneys';
import LaughOutLoud from './pages/mood/LaughOutLoud';
import CalmBeforeSleep from './pages/mood/CalmBeforeSleep';
import HighEnergy from './pages/mood/HighEnergy';
import SlowBurn from './pages/mood/SlowBurn';
import AestheticMood from './pages/mood/AestheticMood';
import CozyRainyDay from './pages/mood/CozyRainyDay';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navbar />
          <main className="">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:id" element={<GroupDetails />} />
              <Route path="/community" element={<Community />} />
              <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
              <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
              <Route path="/posts/:id" element={<PostDetails />} />
              <Route path="/genre/:name" element={<Genre />} />
              <Route path="/search" element={<Search />} />
              <Route path="/featured" element={<Featured />} />
              <Route path="/most-popular" element={<MostPopular />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/for-you" element={<ForYou />} />
              <Route path="/top-week" element={<TopWeek />} />
              <Route path="/top-airing" element={<TopAiring />} />
              <Route
                path="/profile/:id"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminUserStats />} />
                <Route path="content_management" element={<AdminContentManagement />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route path="users" element={<AdminUserAccounts />} />
                <Route path="curation" element={<AdminCurationParent />}>
                  <Route index element={<AdminCurationIndex />} />
                  <Route path="trending" element={<AdminCurationTrending />} />
                  <Route path="featured" element={<AdminCurationFeatured />} />
                  <Route path="banner" element={<AdminCurationBanner />} />
                  <Route path="top-airing" element={<AdminCurationTopAiring />} />
                  <Route path="top-week" element={<AdminCurationTopWeek />} />
                  <Route path="for-you" element={<AdminCurationForYou />} />
                </Route>
                <Route path="milestones" element={<AdminMilestones />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="groups" element={<AdminGroups />} />
              </Route>
              {/* <Route path="/landing" element={<Landing />} /> */}
              <Route path="/watch-on-your-mood" element={<WatchOnYourMood />} />
              <Route path="/personalize" element={<Personalize />} />
              {/* Mood routes */}
              <Route path="/mood/feel-good-vibes" element={<FeelGoodVibes />} />
              <Route path="/mood/tearjerker-nights" element={<TearjerkerNights />} />
              <Route path="/mood/chill-cozy" element={<ChillCozy />} />
              <Route path="/mood/adrenaline-rush" element={<AdrenalineRush />} />
              <Route path="/mood/mind-bender" element={<MindBender />} />
              <Route path="/mood/romantic-feels" element={<RomanticFeels />} />
              <Route path="/mood/dreamscape" element={<Dreamscape />} />
              <Route path="/mood/dark-gritty" element={<DarkGritty />} />
              <Route path="/mood/nostalgia-lane" element={<NostalgiaLane />} />
              <Route path="/mood/epic-journeys" element={<EpicJourneys />} />
              <Route path="/mood/laugh-out-loud" element={<LaughOutLoud />} />
              <Route path="/mood/calm-before-sleep" element={<CalmBeforeSleep />} />
              <Route path="/mood/high-energy" element={<HighEnergy />} />
              <Route path="/mood/slow-burn" element={<SlowBurn />} />
              <Route path="/mood/aesthetic-mood" element={<AestheticMood />} />
              <Route path="/mood/cozy-rainy-day" element={<CozyRainyDay />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white',
            }}
          />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;