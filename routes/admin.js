// routes/admin.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

// GET /api/admin/rooms  -> list rooms for admin
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await Room.findAll({ order: [['roomNumber','ASC']] });
    const mapped = rooms.map(r => ({ ...r.get(), _id: r.id }));
    res.json(mapped);
  } catch (err) {
    console.error('Admin list rooms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/rooms -> create room (expects payload matching model)
router.post('/rooms', async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, isAvailable } = req.body;
    // Basic validation
    if (!roomNumber || !roomType || pricePerNight === undefined) {
      return res.status(400).json({ message: 'roomNumber, roomType and pricePerNight are required' });
    }

    // Optionally check unique roomNumber
    const exists = await Room.findOne({ where: { roomNumber } });
    if (exists) return res.status(400).json({ message: 'roomNumber already exists' });

    const room = await Room.create({
      roomNumber: String(roomNumber),
      roomType,
      pricePerNight: Number(pricePerNight),
      isAvailable: !!isAvailable
    });

    res.json({ message: 'Room added successfully', room: { ...room.get(), _id: room.id } });
  } catch (err) {
    console.error('Room addition error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/rooms/:id -> delete room
router.delete('/rooms/:id', async (req, res) => {
  try {
    await Room.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Room deleted' });
  } catch (err) {
    console.error('Room delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/bookings -> all bookings (mapped to frontend-friendly fields)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Room, as: 'room' }, { model: Customer, as: 'customer' }],
      order: [['createdAt', 'DESC']]
    });

    const mapped = bookings.map(b => ({
      _id: b.id,
      customerName: b.customer?.name || b.customer?.fullName || '',
      room: {
        _id: b.room?._id || b.room?.id,
        type: b.room?.roomType || b.room?.type || '',
        roomNumber: b.room?.roomNumber || ''
      },
      dateFrom: b.checkInDate,
      dateTo: b.checkOutDate,
      totalAmount: b.totalAmount,
      status: b.status
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Admin list bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/bookings/:id -> cancel booking
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // mark booking cancelled
    booking.status = 'Cancelled';
    await booking.save();

    // mark room available again
    await Room.update({ isAvailable: true }, { where: { id: booking.roomId } });

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error('Booking cancel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/bookings/:id/remove -> permanently delete booking and related invoices
router.delete('/bookings/:id/remove', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Make room available again (defensive)
    try {
      await Room.update({ isAvailable: true }, { where: { id: booking.roomId } });
    } catch (e) {
      // ignore room update errors but log
      console.error('Error marking room available during remove:', e);
    }

    // Remove invoice documents associated with this booking (if any)
    await Invoice.destroy({ where: { bookingId: booking.id } });

    // Remove the booking itself
    await Booking.destroy({ where: { id: booking.id } });

    res.json({ message: 'Booking removed permanently' });
  } catch (err) {
    console.error('Booking remove error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/invoices -> list invoices (populate booking.customer and booking.room, return flattened data)
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [{ model: Booking, as: 'booking', include: [{ model: Customer, as: 'customer' }, { model: Room, as: 'room' }] }],
      order: [['createdAt', 'DESC']]
    });

    const mapped = invoices.map(inv => ({
      _id: inv.id,
      bookingId: inv.booking?.id,
      customer: {
        _id: inv.booking?.customer?.id,
        name: inv.booking?.customer?.name || inv.booking?.customer?.fullName || '',
        email: inv.booking?.customer?.email || ''
      },
      room: {
        _id: inv.booking?.room?.id,
        type: inv.booking?.room?.roomType || inv.booking?.room?.type || '',
        roomNumber: inv.booking?.room?.roomNumber || ''
      },
      totalAmount: inv.amountPaid,
      createdAt: inv.createdAt
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Admin invoices error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/invoices/:id -> detailed invoice for admin
router.get('/invoices/:id', async (req, res) => {
  try {
    const inv = await Invoice.findByPk(req.params.id, {
      include: [{ model: Booking, as: 'booking', include: [{ model: Customer, as: 'customer' }, { model: Room, as: 'room' }] }]
    });

    if (!inv) return res.status(404).json({ message: 'Invoice not found' });

    const detailed = {
      invoiceId: inv.id,
      invoiceDate: inv.invoiceDate || inv.createdAt,
      amountPaid: inv.amountPaid,
      booking: {
        id: inv.booking?.id,
        checkInDate: inv.booking?.checkInDate,
        checkOutDate: inv.booking?.checkOutDate,
        totalAmount: inv.booking?.totalAmount,
        status: inv.booking?.status
      },
      customer: {
        id: inv.booking?.customer?.id,
        name: inv.booking?.customer?.name || inv.booking?.customer?.fullName || '',
        email: inv.booking?.customer?.email || '',
        phone: inv.booking?.customer?.phone || ''
      },
      room: {
        id: inv.booking?.room?.id,
        type: inv.booking?.room?.roomType || inv.booking?.room?.type || '',
        roomNumber: inv.booking?.room?.roomNumber || '',
        pricePerNight: inv.booking?.room?.pricePerNight
      }
    };

    res.json(detailed);
  } catch (err) {
    console.error('Admin invoice detail error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add: GET /api/admin/stats -> aggregated admin statistics from DB
router.get('/stats', async (req, res) => {
  try {
    // total rooms
    const totalRooms = await Room.count();

    // total bookings (all records) and active bookings (status = 'Booked')
    const totalBookings = await Booking.count();
    const activeBookings = await Booking.count({ where: { status: 'Booked' } });

    // total customers/guests
    const totalCustomers = await Customer.count();

    // revenue: prefer invoices (amountPaid). If no invoices, fallback to sum of booking.totalAmount
    const revenueFromInvoices = await Invoice.sum('amountPaid');
    let revenue = 0;
    if (Number.isFinite(revenueFromInvoices) && revenueFromInvoices !== null) {
      revenue = revenueFromInvoices;
    } else {
      const revenueFromBookings = await Booking.sum('totalAmount');
      revenue = (Number.isFinite(revenueFromBookings) && revenueFromBookings !== null) ? revenueFromBookings : 0;
    }

    // occupancy rate: percent of rooms currently occupied (isAvailable = false)
    const availableRooms = await Room.count({ where: { isAvailable: true } });
    const occupied = totalRooms - availableRooms;
    const occupancyRate = totalRooms > 0 ? Math.round((occupied / totalRooms) * 100) : 0;

    res.json({
      rooms: totalRooms,
      bookings: totalBookings,
      revenue,
      guests: totalCustomers,
      occupancyRate,
      activeBookings
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
