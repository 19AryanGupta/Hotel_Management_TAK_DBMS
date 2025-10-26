const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// Get all rooms
router.get("/", async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
