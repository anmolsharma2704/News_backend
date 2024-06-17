const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/newsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
const newsRoutes = require('./routes/newsRoutes');
const userRoutes = require('./routes/users');

app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
