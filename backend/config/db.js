const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    (`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default admin user
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    
    const adminExists = await User.findOne({ email: 'admin@email.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt);
      
      const admin = new User({
        username: 'admin',
        email: 'admin@email.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      ('Default admin user created');
    }
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;