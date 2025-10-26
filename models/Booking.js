const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    dateFrom: { type: Date, required: true },
    dateTo: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
