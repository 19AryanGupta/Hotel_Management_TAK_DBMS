const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Create a booking
router.post("/", async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.status(201).json({ message: "Booking created successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get bookings for a customer
router.get("/:customerId", async (req, res) => {
    try {
        const bookings = await Booking.find({ customerId: req.params.customerId }).populate("roomId");
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
