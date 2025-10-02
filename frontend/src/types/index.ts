export interface User {
  id: string;
  username: string;
  email?: string;
  avatar: string;
  bio?: string;
  role: 'user' | 'admin';
  followers: User[];
  following: User[];
  bookmarks: Anime[];
  favoriteGenres: string[];
  isOnline: boolean;
  lastSeen: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: {
      email: boolean;
      push: boolean;
      newAnime: boolean;
      groupUpdates: boolean;
    };
  };
}

export interface Anime {
  _id: string;
  title: string;
  alternativeTitles: string[];
  description: string;
  tags: string[];
  genres: string[];
  coverImage: string;
  bannerImage?: string;
  episodes: Episode[];
  totalEpisodes: number;
  status: 'ongoing' | 'completed' | 'upcoming';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  year: number;
  studio?: string;
  director?: string;
  rating: number;
  watchLinks: WatchLink[];
  likes: Like[];
  views: number;
  dummyLikes: number;
  dummyViews: number;
  comments: Comment[];
  averageRating: number;
  ratingsCount: number;
  isActive: boolean;
  featured: boolean;
  trending: boolean;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
}

export interface Episode {
  number: number;
  title: string;
  description?: string;
  duration: number;
  watchLink?: string;
  thumbnail?: string;
  airDate?: Date;
}

export interface WatchLink {
  platform: string;
  url: string;
  quality: string;
}

export interface Like {
  user: string;
  createdAt: Date;
}

export interface Comment {
  _id: string;
  text: string;
  user: User;
  post?: string;
  anime?: string;
  parentComment?: string;
  replies: Comment[];
  likes: Like[];
  isActive: boolean;
  edited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  members: GroupMember[];
  dummyMembers: number;
  moderators: User[];
  relatedAnime: Anime[];
  events: GroupEvent[];
  polls: Poll[];
  tags: string[];
  isPrivate: boolean;
  category: 'general' | 'anime-specific' | 'genre' | 'seasonal' | 'discussion';
  rules: string[];
  isActive: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  user: User;
  joinedAt: Date;
  role: 'member' | 'moderator' | 'admin';
}

export interface GroupEvent {
  _id: string;
  title: string;
  description?: string;
  date: Date;
  type: 'watch-party' | 'discussion' | 'contest';
  isActive: boolean;
}

export interface Poll {
  _id: string;
  question: string;
  options: string[];
  votes: PollVote[];
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PollVote {
  option: number;
  user: string;
}

export interface Post {
  _id: string;
  content: string;
  title?: string;
  images: string[];
  user: User;
  group?: Group;
  relatedAnime?: Anime;
  likes: Like[];
  reactions: Reaction[];
  comments: Comment[];
  bookmarks: string[];
  tags: string[];
  type: 'discussion' | 'news' | 'review' | 'recommendation' | 'meme';
  isPinned: boolean;
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  type: 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  user: string;
  createdAt: Date;
}

export interface Report {
  _id: string;
  targetId: string;
  targetType: 'user' | 'post' | 'comment' | 'anime' | 'group';
  reason: 'spam' | 'harassment' | 'inappropriate-content' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdBy: User;
  reviewedBy?: User;
  reviewedAt?: Date;
  adminNote?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'maintenance';
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  showUntil?: Date;
  targetAudience: 'all' | 'users' | 'admins';
  createdBy: User;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}