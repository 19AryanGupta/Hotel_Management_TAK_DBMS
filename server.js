// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(cors()); // allow cross-origin requests if needed
app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true })); // parse form submissions

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html')); // open register page by default
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Import routes
const authRoutes = require("./routes/auth");
const roomsRoutes = require("./routes/rooms");
const bookingRoutes = require("./routes/bookings");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/bookings", bookingRoutes);
