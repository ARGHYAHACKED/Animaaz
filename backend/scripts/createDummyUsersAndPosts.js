// scripts/createDummyUsersAndPosts.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/anime';

const usersData = [
  { name: 'alice', post: { title: 'Alice Post', content: 'This is Alice\'s post.' }, comment: 'Nice post from Alice!' },
  { name: 'bob', post: { title: 'Bob Post', content: 'This is Bob\'s post.' }, comment: 'Nice post from Bob!' },
  { name: 'charlie', post: { title: 'Charlie Post', content: 'This is Charlie\'s post.' }, comment: 'Nice post from Charlie!' },
  { name: 'diana', post: { title: 'Diana Post', content: 'This is Diana\'s post.' }, comment: 'Nice post from Diana!' },
  { name: 'eve', post: { title: 'Eve Post', content: 'This is Eve\'s post.' }, comment: 'Nice post from Eve!' },
];

async function main() {
  await mongoose.connect(MONGO_URI);
  ('Connected to MongoDB');

  // Clean up old dummy users/posts/comments
  const usernames = usersData.map(u => u.name);
  await User.deleteMany({ username: { $in: usernames } });
  await Post.deleteMany({ title: { $in: usersData.map(u => u.post.title) } });
  await Comment.deleteMany({ text: { $in: usersData.map(u => u.comment) } });

  // Create users
  const createdUsers = [];
  for (const u of usersData) {
    const hashed = await bcrypt.hash('123456', 10);
    const user = await User.create({
      username: u.name,
      email: `${u.name}@email.com`,
      password: hashed
    });
    createdUsers.push(user);
    (`Created user: ${user.username}`);
  }

  // Create posts
  const createdPosts = [];
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const postData = usersData[i].post;
    const post = await Post.create({
      ...postData,
      user: user._id
    });
    createdPosts.push(post);
    (`Created post for user: ${user.username}`);
  }

  // Create comments
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const post = createdPosts[i];
    const commentText = usersData[i].comment;
    await Comment.create({
      text: commentText,
      user: user._id,
      post: post._id
    });
    (`Created comment for user: ${user.username}`);
  }

  await mongoose.disconnect();
  ('Done!');
}

main().catch(e => {
  console.error(e);
  mongoose.disconnect();
});
