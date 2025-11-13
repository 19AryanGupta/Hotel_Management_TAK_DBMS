// server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // added to read and inject into HTML

// Replace mongoose with Sequelize init
const { sequelize } = require('./models');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Sequelize authentication & sync
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // creates tables if not exist
    console.log("Connected to MySQL via Sequelize");
  } catch (err) {
    console.error("Error connecting to MySQL:", err);
    process.exit(1);
  }
})();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/invoices', require('./routes/invoices'));

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);


// Root Route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, data) => {
      if (err) return res.status(500).send('Error loading page');
      const inject = '<link rel="stylesheet" href="/css/contrast.css">';
      const modified = data.includes('</head>') ? data.replace('</head>', `${inject}\n</head>`) : (inject + data);
      res.send(modified);
    });
});

// Add this before the "app.listen" part in server.js
app.get('/logout', (req, res) => {
  const logoutPath = path.join(__dirname, 'public', 'logout.html');
  fs.readFile(logoutPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading page');
    const inject = '<link rel="stylesheet" href="/css/contrast.css">';
    const modified = data.includes('</head>') ? data.replace('</head>', `${inject}\n</head>`) : (inject + data);
    res.send(modified);
  });
});

// Listen on port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
