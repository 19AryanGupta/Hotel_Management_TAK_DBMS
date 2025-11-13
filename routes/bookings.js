// routes/bookings.js

const express = require('express');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const router = express.Router();

// Create a booking
router.post('/', async (req, res) => {
    const { customerId, roomId, checkIn, checkOut } = req.body;

    try {
        if (!customerId || !roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "Missing booking data" });
        }

        // Validate customer exists
        const customer = await Customer.findByPk(customerId);
        if (!customer) {
            return res.status(400).json({ message: "Invalid customer. Please log in." });
        }

        // Validate room
        const room = await Room.findByPk(roomId);
        if (!room || !room.isAvailable) {
            return res.status(400).json({ message: "Room not available" });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkOutDate <= checkInDate) {
            return res.status(400).json({ message: "Invalid dates" });
        }

        // compute nights
        const msPerDay = 1000 * 60 * 60 * 24;
        const nights = Math.ceil((checkOutDate - checkInDate) / msPerDay);

        const totalAmount = nights * room.pricePerNight;

        const booking = await Booking.create({
            customerId,
            roomId,
            checkInDate,
            checkOutDate,
            totalAmount
        });

        // Update room availability
        await room.update({ isAvailable: false });

        res.status(201).json({ message: "Booking successful", booking: { ...booking.get(), _id: booking.id } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get bookings for a customer
router.get('/:customerId', async (req, res) => {
    const { customerId } = req.params;

    try {
        const bookings = await Booking.findAll({
            where: { customerId },
            include: [{ model: Room, as: 'room' }],
            order: [['createdAt', 'DESC']]
        });
        // Map to objects (Sequelize returns instances)
        const mapped = bookings.map(b => {
            const obj = b.get();
            obj._id = b.id;
            return obj;
        });
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
