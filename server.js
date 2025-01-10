const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./backend/config');  
require('dotenv').config();
 // Load environment variables
// Import config.js to access MongoDB URI and JWT Secret

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB using the URI from config.js
mongoose.connect(config.mongodbUri,{
    serverSelectionTimeoutMS: 300000,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./backend/routes.js/auth');
const questionRoutes = require('./backend/routes.js/questions');
const quizRoutes = require('./backend/routes.js/quizzes');
const responseRoutes = require('./backend/routes.js/responses');

app.use('/auth', authRoutes);
app.use('/questions', questionRoutes);
app.use('/quizzes', quizRoutes);
app.use('/responses', responseRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
