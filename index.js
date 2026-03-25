const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const plantRoutes = require('./routes/plantRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static assets if needed
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Routes
app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Akshar Baag API' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
