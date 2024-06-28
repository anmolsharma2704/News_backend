const express = require('express');
const connectDB = require('./config/db'); // Adjust the path as needed
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors'); 
const app = express();
const dotenv = require('dotenv');

// Serve static files from the 'uploads' directory

dotenv.config()
// // Use CORS middleware
// app.use(cors());

const corsOptions = {
    // origin: 'https://www.newsdayrajasthan.in',  // Replace with your frontend URL in production
    origin: process.env.FRONTEND_URL,  // Replace with your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
  };
  
  // Enable CORS with options

  app.use(cors(corsOptions));

// Connect to database
connectDB();

// Init middleware
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
