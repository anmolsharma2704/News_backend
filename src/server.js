const express = require('express');
const connectDB = require('./config/db'); // Adjust the path as needed
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/userRoutes');
const adRoutes = require('./routes/adRoutes');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// Define CORS options
const corsOptions = {
    origin: process.env.FRONTEND_URL,  // Replace with your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],  // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allowed headers
};

// Enable CORS with options
app.use(cors(corsOptions));

// Connect to database
connectDB();

// Init middleware to parse JSON payloads
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ads', adRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
