const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path'); // Add this line to import the path module
const cloudinary = require('../config/cloudinaryConfig'); // Adjust path as per your project structure

// Multer configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'news_images', // Optional: folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png/;
  // Check file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images only!');
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
