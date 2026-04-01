const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const plantRoutes = require('./routes/plantRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const noteRoutes = require('./routes/noteRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8095;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets if needed
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notes', noteRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Akshar Baag API' });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Increased timeout to 20 minutes to allow for large video file uploads
server.timeout = 1200000;
server.keepAliveTimeout = 1250000; 
server.headersTimeout = 1260000;
