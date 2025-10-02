
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Message {
  _id: string;
  user: User;
  text: string;
  createdAt: string;
}

interface GroupChatProps {
  groupId: string;
  initialMessages: Message[];
  isMember: boolean;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, initialMessages, isMember }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const messagesTopRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();
  const { user } = useAuth();


  // Removed auto-scroll on new message

  // Join/leave group room and listen for new messages
  useEffect(() => {
    if (!socket || !groupId) return;
    socket.emit('join-group', groupId);
    const handleNewMessage = (data: { groupId: string; message: Message }) => {
      if (data.groupId === groupId) {
        setMessages((prev) => [...prev, data.message]);
      }
    };
    socket.on('new-message', handleNewMessage);
    return () => {
      socket.emit('leave-group', groupId);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, groupId]);

  // If groupId or initialMessages change, reset messages
  useEffect(() => {
    setMessages(initialMessages);
  }, [groupId, initialMessages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isMember) return;
    const messageText = message.trim();
    try {
      await api.post(`/groups/${groupId}/messages`, { text: messageText });
      setMessage('');
    } catch (error) {
      setMessage(messageText);
    }
  };

  // Helper to generate a pastel color from a string (user id)
  function pastelColorFromString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // H: 0-360, S: 60-80%, L: 80-90%
    const h = Math.abs(hash) % 360;
    const s = 70;
    const l = 85;
    return `hsl(${h},${s}%,${l}%)`;
  }

  return (
    <div className="w-full flex flex-col h-[28rem] bg-gray-900 border border-gray-800 rounded-xl">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a78bfa #18181b' }}>
        {messages.length === 0 && (
          <div className="text-center text-gray-400">No messages yet.</div>
        )}
        {messages.map((m) => {
          const isSelf = user && (m.user._id === user.id);
          const userColor = pastelColorFromString(m.user._id);
          return (
            <div
              key={m._id}
              className={isSelf ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={
                  isSelf
                    ? 'max-w-xs md:max-w-md flex flex-col items-end'
                    : 'max-w-xs md:max-w-md flex flex-col items-start'
                }
              >
                <div className="flex items-center gap-2">
                  {/* Avatar (left for others, right for self) */}
                  {!isSelf && (
                    <img
                      src={m.user.avatar || '/logo.png'}
                      alt={m.user.username}
                      className="w-8 h-8 rounded-full object-cover bg-gray-700"
                    />
                  )}
                  <div
                    className={
                      isSelf
                        ? 'rounded-2xl px-4 py-2 mb-1 text-white bg-green-500 shadow-md'
                        : 'rounded-2xl px-4 py-2 mb-1 text-gray-900 shadow-md'
                    }
                    style={
                      isSelf
                        ? { backgroundColor: '#22c55e', color: 'white', borderTopRightRadius: 0 }
                        : { backgroundColor: userColor, color: '#222', borderTopLeftRadius: 0 }
                    }
                  >
                    {m.text}
                  </div>
                  {isSelf && (
                    <img
                      src={m.user.avatar || '/logo.png'}
                      alt={m.user.username}
                      className="w-8 h-8 rounded-full object-cover bg-gray-700"
                    />
                  )}
                </div>
                <div
                  className={
                    isSelf
                      ? 'text-xs text-green-300 mt-1 pr-2 text-right'
                      : 'text-xs text-gray-400 mt-1 pl-2 text-left'
                  }
                >
                  {isSelf ? 'You' : m.user.username} · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Message input */}
      <div className="p-3 border-t border-gray-800 bg-gray-900">
        {isMember ? (
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              maxLength={1000}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              disabled={!message.trim()}
            >
              Send
            </button>
          </form>
        ) : (
          <div className="text-center text-gray-400">Join the group to send messages.</div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
