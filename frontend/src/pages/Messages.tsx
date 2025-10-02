import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../utils/socket';
import GlassCard from '../components/GlassCard';

interface Message {
  _id: string;
  from: string;
  to: string;
  content: string;
  createdAt: string;
  readAt?: string;
  fromUser?: { _id: string; username: string; avatar?: string };
  toUser?: { _id: string; username: string; avatar?: string };
}

const Messages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [thread, setThread] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread] = useState<{ [key: string]: boolean }>({});
  const [search, setSearch] = useState('');
  const userId = searchParams.get('u');
  const { user } = useAuth();
  const socket = getSocket();
  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const res = await api.get('/messages/conversations');
    setConversations(res.data);
    // Mark all as unread initially (simulate, real logic should come from backend)
    const unreadObj: { [key: string]: boolean } = {};
    res.data.forEach((c: any) => {
      if (c.lastMessage && c.lastMessage.to === user?.id && !c.lastMessage.readAt) {
        unreadObj[c._id] = true;
      }
    });
    setUnread(unreadObj);
  };

  const loadThread = async (uid: string) => {
    const res = await api.get(`/messages/${uid}`);
    setThread(res.data);
  };


  // Join/leave personal chat room for real-time updates
  useEffect(() => {
    if (!socket || !userId) return;
    socket.emit('join-personal', userId);
    const handlePersonalMessage = (msg: Message) => {
      // Only add if message is for this thread
      if (
  (msg.from === user?.id && msg.to === userId) ||
  (msg.from === userId && msg.to === user?.id)
      ) {
  setThread((prev) => [...prev, msg]);
      }
    };
    socket.on('personal-message', handlePersonalMessage);
    return () => {
      socket.emit('leave-personal', userId);
      socket.off('personal-message', handlePersonalMessage);
    };
  }, [socket, userId, user?.id]);

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { if (userId) loadThread(userId); }, [userId]);

  // Mark messages as read when opening a thread
  useEffect(() => {
    if (userId && unread[userId]) {
      setUnread((prev) => ({ ...prev, [userId]: false }));
      // Optionally, call API to mark as read
      api.post(`/messages/${userId}/read`).catch(() => {});
    }
  }, [userId]);

  // Scroll to bottom on new message

  // Remove auto-scroll on new message


  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !text.trim()) return;
    if (socket && socket.connected) {
      socket.emit('personal-message', { to: userId, content: text.trim() });
      setText('');
    } else {
      // fallback to REST if socket not connected
      const res = await api.post(`/messages/${userId}`, { content: text.trim() });
      setThread(prev => [...prev, res.data]);
      setText('');
    }
  };

  // Get current conversation user
  const currentConv = conversations.find(c => String(c._id) === String(userId));
  const currentUser = currentConv?.user;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-[#FAFBFC] via-[#ede9fe] to-[#f3e8ff] dark:from-[#1a1333] dark:via-[#2d1e4f] dark:to-[#3a295c] text-[#111827] dark:text-white">
      <div className="w-full h-20 bg-gradient-to-r from-[#ede9fe] via-[#f3e8ff] to-[#fff] dark:from-[#2d1e4f] dark:via-[#3a295c] dark:to-[#1a1333]" />
      {/* Mobile drawer button */}
      <div className="md:hidden flex items-center mb-2 px-4 relative">
        <span className="font-bold text-lg">Messages</span>
        {/* FAB for new message/drawer */}
        <button
          className="fixed z-50 bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl flex items-center justify-center text-2xl md:hidden"
          style={{ boxShadow: '0 8px 32px 0 rgba(168,85,247,0.25)' }}
          onClick={() => setDrawerOpen(true)}
          aria-label="Open conversations"
        >
          {/* Pen/compose icon */}
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 20h9" strokeLinecap="round"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5Z"/></svg>
        </button>
      </div>
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
        {/* Sidebar - left on desktop */}
        <GlassCard className={`w-full md:w-88 max-w-xs md:max-w-xs p-0 border-0 shadow-xl mb-6 md:mb-0 ${drawerOpen ? 'block fixed z-50 top-0 left-0 h-full' : 'hidden md:block'}` + ' transition-all duration-300'}>
          <div className="px-5 py-4 font-semibold border-b border-[#ede9fe] dark:border-purple-900 flex items-center justify-between bg-white/70 dark:bg-[#2d1e4f]/70 rounded-t-2xl">
            <span className="text-lg">💬 Messages</span>
            <button className="md:hidden p-1" onClick={() => setDrawerOpen(false)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {/* Search bar */}
          <div className="px-5 py-3 border-b border-[#ede9fe] dark:border-purple-900 bg-white/60 dark:bg-[#2d1e4f]/60">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-4 py-2 rounded-lg border border-[#ede9fe] dark:border-purple-900 bg-white/80 dark:bg-[#2d1e4f]/80 text-[#111827] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <ul className="overflow-y-auto max-h-[calc(100vh-180px)] py-2">
            {conversations.filter(c => !search || (c.user?.username || '').toLowerCase().includes(search.toLowerCase())).map((c) => (
              <li key={c._id}>
                <button
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors rounded-xl my-1 ${userId === String(c._id) ? 'bg-[#ede9fe] dark:bg-green-500/80 text-purple-700 dark:text-white font-bold' : ''} hover:bg-purple-100 dark:hover:bg-green-500/80 hover:text-purple-700 dark:hover:text-white relative`}
                  onClick={() => { setSearchParams({ u: c._id }); setDrawerOpen(false); }}
                >
                  <div className="relative">
                    {c.user?.avatar ? (
                      <img src={c.user.avatar} alt={c.user.username} className="w-10 h-10 rounded-full object-cover border-2 border-purple-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center text-lg">
                        {(c.user?.username || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Online status dot (simulate online for demo) */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-[#2d1e4f] rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`truncate font-medium ${unread[c._id] ? 'font-bold' : ''}`}>{c.user?.username || `User ${c._id}`}</div>
                    <div className="truncate text-xs opacity-80">{c.lastMessage?.content}</div>
                  </div>
                  {/* Unread badge */}
                  {unread[c._id] && (
                    <span className="ml-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-[#2d1e4f]" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </GlassCard>
        {/* Chat area - right on desktop */}
        <main className="flex-1 border rounded-lg border-purple-900 flex flex-col min-h-[32rem] bg-gradient-to-br from-[#2d1e4f] via-[#3a295c] to-[#1a1333] shadow-xl mt-6 md:mt-10">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-purple-900 bg-gradient-to-r from-purple-700/60 to-pink-600/40 rounded-t-lg">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.username} className="w-10 h-10 rounded-full object-cover border-2 border-purple-400" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center text-xl">
                {(currentUser?.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              {currentUser?.username ? (
                <a href={`/profile/${currentUser._id}`} className="font-semibold text-lg text-pink-300 hover:underline cursor-pointer">{currentUser.username}</a>
              ) : (
                <span className="font-semibold text-lg">Select a conversation</span>
              )}
            </div>
          </div>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#2d1e4f]/80 via-[#3a295c]/80 to-[#1a1333]/80 rounded-b-lg custom-scrollbar">
            {userId && thread.map(m => {
              const isSelf = m.from === (user?.id || '');
              const sender = m.fromUser || (isSelf ? { _id: user?.id, username: user?.username, avatar: user?.avatar } : undefined);
              return (
                <div key={m._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 ${isSelf ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <img
                      src={sender?.avatar || '/logo.png'}
                      alt={sender?.username || ''}
                      className="w-10 h-10 rounded-full object-cover bg-gray-700 border-2 border-pink-400 shadow-lg"
                    />
                    <div>
                      <div className={`px-5 py-2 rounded-2xl shadow-lg mb-1 text-base ${isSelf ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white/10 text-white border border-purple-700'}`}>{m.content}</div>
                      <div className="text-xs text-purple-200 mt-1">
                        {sender?.username || (isSelf ? 'You' : 'User')}
                        {' · '}
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={threadEndRef} />
          </div>
          {/* Chat input - only show if a conversation is selected */}
          {userId && (
            <form onSubmit={send} className="p-3 border-t border-purple-900 flex gap-2 bg-gradient-to-r from-[#2d1e4f] to-[#1a1333] rounded-b-lg">
              <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-purple-700 bg-[#2d1e4f] text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Type a message..." />
              <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-transform">Send</button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;


