const express = require('express');
const connectDB = require('./config/db'); // Adjust the path as needed
const authRoutes = require('./routes/authRoutes');
const newsRoutes = require('./routes/newsRoutes');

const app = express();

// Connect to database
connectDB();

// Init middleware
app.use(express.json());

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
