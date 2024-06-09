const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import the cors package
const app = express();
require('dotenv').config();

// Connect Database
connectDB();

// Enable CORS
app.use(cors());  // Use the cors middleware

// Init Middleware
app.use(bodyParser.json());

// Define Routes
app.use('/api/auth', require('./routes/auth'));

// Define a test route
app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
