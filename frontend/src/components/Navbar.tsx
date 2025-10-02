"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { X, Search, User, Settings, LogOut, Home, Users, MessageCircle } from "lucide-react"
import api from "../utils/api"
import GroupsDrawer from './GroupsDrawer';
import { useAuth } from "../contexts/AuthContext"
// ...existing code...

const Navbar: React.FC = () => {
  const [, setIsOpen] = useState(false)
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const searchTimeout = useRef<number | null>(null)
  const { user, logout } = useAuth()
  const [showGroupsDrawer, setShowGroupsDrawer] = useState(false);
  // ...existing code...
  const navigate = useNavigate()
  const location = useLocation()


  // Live search suggestions
  const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    if (!value.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    setSearchLoading(true)
    searchTimeout.current = setTimeout(async () => {
      try {
        // Only fetch from your DB, limit 10
       const res = await api.get('/anime/search', { params: { q: value.trim() , limit:5} })
        // const res = await api.get('/anime', { params: { search: value.trim(), limit:5 } })
        // setSearchResults(res.data.anime || [])
        setSearchResults(res.data || [])
        setShowDropdown(true)
      } catch {
        setSearchResults([])
        setShowDropdown(false)
      }
      setSearchLoading(false)
    }, 250)
  }

  // On submit, go to search page
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
      setShowMobileSearch(false)
      setIsOpen(false)
    }
  }

  // When clicking a suggestion
  const handleSuggestionClick = (animeId: string) => {
    navigate(`/anime/${animeId}`)
    setShowDropdown(false)
  }

  const handleLogout = () => {
    logout()
    setShowProfileDrawer(false)
    navigate("/")
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <>
  {/* Desktop Navigation (GLASSY EFFECT APPLIED) */}
  <nav className="hidden md:block fixed top-0 w-full bg-gradient-to-r from-[#18122B] via-[#231942] to-[#18122B] dark:from-[#0f0c1a] dark:via-[#18122B] dark:to-[#0f0c1a] backdrop-blur-xl border-b border-white/20 dark:border-white/10 z-50 transition-colors duration-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Left Section: Logo and App Name (UPDATED TO USE IMAGE LOGO) */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center space-x-2 py-4">
                {/* Image Logo is used here */}
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Animaaz
                </span>
              </Link>
            </div>

            {/* Center Section: Navigation Links and Search Bar */}
            <div className="flex-1 flex justify-center px-4">
        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                    <Link
                        to="/groups"
                        className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                            isActive("/groups") ? "text-purple-400" : "text-gray-200 dark:text-gray-300"
                        }`}
                    >Groups</Link>
                    <Link
                        to="/community"
                        className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                            isActive("/community") ? "text-purple-400" : "text-gray-200 dark:text-gray-300"
                        }`}
                    >Community</Link>
                    <Link
                        to="/messages"
                        className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                            isActive("/messages") ? "text-purple-400" : "text-gray-200 dark:text-gray-300"
                        }`}
                    >Messages</Link>
                    {user?.role === "admin" && (
                        <Link
                            to="/admin"
                            className={`text-sm font-medium transition-colors hover:text-purple-400 ${
                                isActive("/admin") ? "text-purple-400" : "text-gray-200 dark:text-gray-300"
                            }`}
                        >Admin</Link>
                    )}
                </div>
                
                {/* Search Bar (desktop) */}
                <div className="hidden md:flex items-center flex-1 max-w-sm ml-4 relative">
                  <form onSubmit={handleSearch} className="w-full relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInput}
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-white/20 dark:border-gray-600 rounded-lg bg-black/30 dark:bg-gray-800/60 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm"
                      onFocus={() => { if (searchResults.length > 0) setShowDropdown(true) }}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                      autoComplete="off"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                  </form>
                  {/* Dropdown for live search results */}
                  {showDropdown && (
                    <div
                      className="absolute left-0 w-full bg-[#231942] dark:bg-[#18122B] rounded-xl shadow-2xl z-[100] border border-purple-400/30 overflow-hidden animate-fadeIn"
                      style={{ top: '110%' }}
                    >
                      {searchLoading ? (
                        <div className="p-4 text-center text-gray-300">Searching...</div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-gray-400">No results</div>
                      ) : (
                        <>
                          {searchResults.map((anime: any) => (
                            <div key={anime._id} className="flex flex-col w-full">
                              <button
                                className="flex w-full items-center gap-4 px-4 py-3 hover:bg-purple-900/40 transition-colors text-left"
                                onMouseDown={() => handleSuggestionClick(anime._id)}
                              >
                                <div className="flex-shrink-0 w-14 h-20 rounded-lg overflow-hidden border-2 border-purple-400/40 bg-gray-900 flex items-center justify-center">
                                  <img
                                    src={anime.coverImage || anime.image || '/logo.png'}
                                    alt={anime.title}
                                    className="w-full h-full object-cover"
                                    style={{ minWidth: 56, minHeight: 80, background: '#222' }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-white truncate text-base">{anime.title}</div>
                                </div>
                              </button>
                              <button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 text-center text-sm transition-colors rounded-b-none"
                                style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                                onMouseDown={() => {
                                  window.open(`https://hianime.nz/search?keyword=${encodeURIComponent(anime.title)}`, '_blank');
                                  setShowDropdown(false);
                                }}
                              >
                                Watch Now &rarr;
                              </button>
                            </div>
                          ))}
                          <button
                            className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 text-center text-sm transition-colors"
                            onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setShowDropdown(false); }}
                          >
                            View all results &rarr;
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
            </div>


            {/* Right Section: Profile/Auth Buttons + Groups Drawer Button */}
            <div className="flex items-center flex-shrink-0 gap-2">
              {user ? (
                <button
                  onClick={() => setShowProfileDrawer(true)}
                  className="flex items-center space-x-2 text-gray-200 dark:text-gray-300 hover:text-white transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-200 dark:text-gray-300 hover:text-purple-400 transition-colors hidden sm:block"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
      {/* Groups Drawer */}
      {user && (
        <GroupsDrawer open={showGroupsDrawer} onClose={() => setShowGroupsDrawer(false)} userId={user.id} />
      )}
          </div>
        </div>
      </nav>

  {/* Mobile Top Bar (GLASSY EFFECT APPLIED) - Left (Logo) and Right (Search/Profile) */}
  <nav className="md:hidden fixed top-0 w-full bg-gradient-to-r from-[#18122B] via-[#231942] to-[#18122B] dark:from-[#0f0c1a] dark:via-[#18122B] dark:to-[#0f0c1a] backdrop-blur-xl border-b border-white/20 dark:border-white/10 z-50 shadow-lg">
        <div className="px-4"> {/* px-4 provides the necessary space on the sides */}
          <div className="flex justify-between items-center h-14">
            {/* Left Section: Logo and App Name (UPDATED TO USE IMAGE LOGO) */}
            <Link to="/" className="flex items-center space-x-2 py-3"> {/* py-3 helps align and potentially adds top/bottom space */}
              {/* Image Logo is used here */}
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Animaaz
              </span>
            </Link>

            {/* Right Section: Search and Profile/Auth */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-300 hover:text-white transition-colors" onClick={() => setShowMobileSearch(true)}>
                <Search className="w-5 h-5" />
              </button>
      {/* Mobile Search Drawer/Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60">
          <div className="w-full max-w-md mx-auto mt-0 sm:mt-16 bg-[#231942] dark:bg-[#18122B] rounded-b-2xl sm:rounded-2xl shadow-2xl p-0 sm:p-4 relative animate-fadeIn">
            {/* Mobile search header with close button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-purple-400/20 bg-[#231942] dark:bg-[#18122B] rounded-t-2xl sm:rounded-t-2xl">
              <span className="font-semibold text-lg text-white">Search</span>
              <button
                aria-label="Close search"
                className="rounded-full p-2 bg-black/20 hover:bg-pink-500 transition-colors text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                onClick={() => setShowMobileSearch(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="w-full relative px-4 pt-4 pb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search anime..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-400/30 bg-black/30 dark:bg-gray-800/60 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-base"
                autoFocus
              />
              <Search className="absolute left-7 top-[2.65rem] sm:top-1/2 sm:transform sm:-translate-y-1/2 text-gray-300 w-5 h-5 pointer-events-none" />
            </form>
            {searchLoading ? (
              <div className="p-4 text-center text-gray-300">Searching...</div>
            ) : searchResults.length === 0 && searchQuery.trim() ? (
              <div className="p-4 text-center text-gray-400">No results</div>
            ) : (
              <div className="divide-y divide-purple-900/30">
                {searchResults.map((anime: any) => (
                  <button
                    key={anime._id}
                    className="flex w-full items-center gap-4 px-2 py-3 hover:bg-purple-900/40 transition-colors text-left"
                    onMouseDown={() => handleSuggestionClick(anime._id)}
                  >
                    <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden border-2 border-purple-400/40 bg-gray-900 flex items-center justify-center">
                      <img
                        src={anime.coverImage || anime.image || '/logo.png'}
                        alt={anime.title}
                        className="w-full h-full object-cover"
                        style={{ minWidth: 48, minHeight: 64, background: '#222' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate text-base">{anime.title}</div>
                    </div>
                  </button>
                ))}
                {searchResults.length > 0 && (
                  <button
                    className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-2 text-center text-sm transition-colors rounded-b-xl"
                    onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); setShowMobileSearch(false); }}
                  >
                    View all results &rarr;
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
              {user ? (
                <button onClick={() => setShowProfileDrawer(true)} className="p-1">
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt={user.username} className="w-7 h-7 rounded-full" />
                  ) : (
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </button>
              ) : (
                <Link 
                  to="/login"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar (GLASSY EFFECT APPLIED) - This remains centered/spread */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border-t border-white/20 dark:border-white/10 z-50">
        <div className="flex justify-around items-center py-2">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              isActive("/") ? "text-purple-400" : "text-gray-300 hover:text-purple-400"
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/groups"
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              isActive("/groups") ? "text-purple-400" : "text-gray-300 hover:text-purple-400"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Groups</span>
          </Link>

          <Link
            to="/community"
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              isActive("/community") ? "text-purple-400" : "text-gray-300 hover:text-purple-400"
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Community</span>
          </Link>

          <Link
            to="/messages"
            className={`flex flex-col items-center py-2 px-3 transition-colors ${
              isActive("/messages") ? "text-purple-400" : "text-gray-300 hover:text-purple-400"
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs mt-1">Messages</span>
          </Link>
        </div>
      </div>

      {showProfileDrawer && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowProfileDrawer(false)} />

          {/* Drawer - Also making it slightly glassy */}
          <div className="fixed right-0 top-0 h-full w-80 bg-gray-900/90 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <button
                  onClick={() => setShowProfileDrawer(false)}
                  className="p-2 text-gray-400 hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.username}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-medium">{user.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-white">{user.username}</h3>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="space-y-2">
                <Link
                  to="/watch-on-your-mood"
                  onClick={() => setShowProfileDrawer(false)}
                  className="flex items-center px-4 py-3 text-pink-400 hover:bg-gray-800/50 rounded-lg transition-colors font-semibold"
                >
                  <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full mr-3">Special</span>
                  For You
                </Link>
                <Link
                  to={`/profile/${user?.id}`}
                  onClick={() => setShowProfileDrawer(false)}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 mr-3" />
                  View Profile
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileDrawer(false)}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* SPACERS (Corrected to fix the extra space issue) */}
      <div className="h-16 hidden md:block" />
      <div className="h-14 md:hidden block" />
    </>
  )
}

export default Navbar