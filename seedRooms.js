require('dotenv').config();
const mongoose = require("mongoose");
const Room = require("./models/Room");

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(async () => {
    console.log("MongoDB connected");

    const rooms = [
        { roomType: "Single", rate: 2000, quantity: 3 },
        { roomType: "Double", rate: 3500, quantity: 5 },
        { roomType: "Suite", rate: 6000, quantity: 2 }
    ];

    await Room.deleteMany({});
    await Room.insertMany(rooms);

    console.log("Rooms seeded!");
    mongoose.connection.close();
})
.catch(err => console.error(err));
