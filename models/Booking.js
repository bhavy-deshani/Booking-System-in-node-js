const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true }
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
