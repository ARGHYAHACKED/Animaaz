import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://animaaz.onrender.com';
let socket: Socket | null = null;

export const initializeSocket = (token: string, userId?: string) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token, userId },
    autoConnect: true
  });
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });
  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });
  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error:', error);
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
