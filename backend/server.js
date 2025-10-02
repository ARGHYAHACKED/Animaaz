const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
require('./config/cloudinary');

// Routes
const authRoutes = require('./routes/auth');
const animeRoutes = require('./routes/anime');
// const moodRoutes = require('./routes/mood');
const groupRoutes = require('./routes/groups');
const communityRoutes = require('./routes/community');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');
const notificationRoutes = require('./routes/notifications');
const messageRoutes = require('./routes/messages');
const curationRoutes = require('./routes/curation');
const moodRoutes = require('./routes/mood');

const app = express();
// Wrap Express app with HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const userId = socket.handshake.auth.userId;
  if (!token) return next(new Error('Authentication error'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = userId || decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.userId);

  socket.on('join-group', (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`👥 User ${socket.userId} joined group ${groupId}`);
  });

  socket.on('leave-group', (groupId) => {
    socket.leave(`group-${groupId}`);
    console.log(`👋 User ${socket.userId} left group ${groupId}`);
  });

  // Personal messaging: join/leave personal room
  socket.on('join-personal', (otherUserId) => {
    // Each user has a personal room for direct messages
    socket.join(`personal-${socket.userId}`);
    if (otherUserId) {
      socket.join(`dm-${[socket.userId, otherUserId].sort().join('-')}`);
    }
    console.log(`💬 User ${socket.userId} joined personal chat with ${otherUserId}`);
  });

  socket.on('leave-personal', (otherUserId) => {
    socket.leave(`personal-${socket.userId}`);
    if (otherUserId) {
      socket.leave(`dm-${[socket.userId, otherUserId].sort().join('-')}`);
    }
    console.log(`👋 User ${socket.userId} left personal chat with ${otherUserId}`);
  });

  // Real-time personal message event
  socket.on('personal-message', async (data) => {
    // data: { to, content }
    const { to, content } = data;
    if (!to || !content || !socket.userId) return;
    try {
      // Save to DB
      const Message = require('./models/Message');
      const User = require('./models/User');
      const msg = new Message({ from: socket.userId, to, content });
      await msg.save();
      // Fetch sender and receiver user info for avatar/name
      const [fromUser, toUser] = await Promise.all([
        User.findById(socket.userId).select('username avatar'),
        User.findById(to).select('username avatar')
      ]);
      // Emit to both users in the DM room with user info
      const room = `dm-${[socket.userId, to].sort().join('-')}`;
      const enrichedMsg = {
        _id: msg._id,
        from: socket.userId,
        to,
        content,
        createdAt: msg.createdAt,
        fromUser: fromUser ? { _id: fromUser._id, username: fromUser.username, avatar: fromUser.avatar } : null,
        toUser: toUser ? { _id: toUser._id, username: toUser.username, avatar: toUser.avatar } : null,
      };
      io.to(room).emit('personal-message', enrichedMsg);
    } catch (err) {
      console.error('Error sending personal message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.userId);
  });
});

// Make Socket.IO accessible in routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://your-domain.com' : 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
// In development, relax the limiter to avoid 429 during local testing
const isProd = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: isProd ? 15 * 60 * 1000 : 60 * 1000,
  max: isProd ? 100 : 10000
});
if (isProd) {
  app.use(limiter);
}

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
// app.use('/api/anime', moodRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/curation', curationRoutes);
app.use('/api/mood', moodRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});