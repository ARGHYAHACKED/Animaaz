const cloudinaryLib = require('cloudinary').v2;
cloudinaryLib.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage()
});
module.exports = { cloudinary: cloudinaryLib, upload };