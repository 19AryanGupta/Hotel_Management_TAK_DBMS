const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel" },
    roomType: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true }
});

module.exports = mongoose.model("Room", roomSchema);
