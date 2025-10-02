import React from 'react';
import { Settings, Megaphone, Users as UsersIcon, LayoutGrid, Sparkles, BarChart3 } from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mainNavItems = [
        { id: 'stats', label: 'User Stats', Icon: BarChart3, route: '/admin' },
        { id: 'content_management', label: 'Content Management', Icon: LayoutGrid, route: '/admin/content_management' },
        { id: 'curation', label: 'Curation Engine', Icon: Sparkles, route: '/admin/curation' },
        { id: 'milestones', label: 'Milestones', Icon: Sparkles, route: '/admin/milestones' },
        { id: 'announcements', label: 'Announcements', Icon: Megaphone, route: '/admin/announcements' },
        { id: 'users', label: 'User Accounts', Icon: UsersIcon, route: '/admin/users' },
        { id: 'posts', label: 'Posts', Icon: Megaphone, route: '/admin/posts' },
        { id: 'groups', label: 'Groups', Icon: LayoutGrid, route: '/admin/groups' },
    ];

    const curationSections = [
        { id: 'trending', label: 'Trending', route: '/admin/curation/trending' },
        { id: 'featured', label: 'Featured', route: '/admin/curation/featured' },
        { id: 'banner', label: 'Home Page', route: '/admin/curation/banner' },
        { id: 'top-airing', label: 'Top Airing', route: '/admin/curation/top-airing' },
        { id: 'top-week', label: 'Top This Week', route: '/admin/curation/top-week' },
        { id: 'for-you', label: 'For You', route: '/admin/curation/for-you' },
    ];

    const SidebarItem: React.FC<{
        id: string; label: string; Icon: React.ElementType; isActive: boolean; onClick: () => void; children?: React.ReactNode;
    }> = ({ id, label, Icon, isActive, onClick, children }) => (
        <div className="w-full">
            <button
                onClick={onClick}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                    isActive
                        ? 'bg-purple-600 text-white font-semibold shadow-md'
                        : 'text-gray-700 hover:bg-gray-200/70'
                }`}
            >
                <div className='flex items-center gap-3'>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-purple-600 group-hover:text-purple-700'}`} />
                    <span className="text-sm">{label}</span>
                </div>
                {/* Dropdown arrow for curation */}
                {id === 'curation' && (
                    <svg className={`w-4 h-4 ml-2 transition-transform ${isActive ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                )}
            </button>
            {/* Dropdown for curation */}
            {id === 'curation' && isActive && (
                <div className="ml-8 mt-2 flex flex-col gap-1">
                    {curationSections.map(section => {
                        const isSubActive = location.pathname === section.route;
                        return (
                            <button
                                key={section.id}
                                onClick={() => navigate(section.route)}
                                className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                    isSubActive
                                        ? 'bg-purple-100 text-purple-700 font-semibold'
                                        : 'text-gray-700 hover:bg-purple-50'
                                }`}
                            >
                                {section.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden md:flex md:w-64 flex-col gap-4 p-4 border-r border-gray-200 bg-white sticky top-0 h-screen shadow-xl">
                    <div className="px-2 py-3 border-b border-gray-100 mb-2">
                        <h2 className="text-xl font-extrabold text-purple-600 flex items-center gap-2">
                            <Settings className="w-5 h-5" /> Control Panel
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Full administrative control</p>
                    </div>
                    <nav className="space-y-1">
                        {mainNavItems.map(({ id, label, Icon, route }) => {
                            let isActive = false;
                            if (id === 'curation') {
                                isActive = location.pathname === route || location.pathname.startsWith(route + '/');
                            } else {
                                isActive = location.pathname === route;
                            }
                            return (
                                <SidebarItem
                                    key={id}
                                    id={id}
                                    label={label}
                                    Icon={Icon}
                                    isActive={isActive}
                                    onClick={() => navigate(route)}
                                />
                            );
                        })}
                    </nav>
                </aside>
                {/* Main Content Area: Nested routes render here */}
                <main className="flex-1 px-8 py-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;