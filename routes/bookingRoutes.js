const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Create a new booking
router.post("/book", async (req, res) => {
    try {
        const { name, email, phone, date, slot, hallName } = req.body;

        // Check if the slot is already booked
        const existingBooking = await Booking.findOne({ date, slot, hallName });
        if (existingBooking) {
            return res.status(400).json({ message: "Slot already booked!" });
        }

        const newBooking = new Booking({ name, email, phone, date, slot, hallName });
        await newBooking.save();
        res.status(201).json({ message: "Booking successful!", booking: newBooking });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Get all bookings
router.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Cancel a booking
router.delete("/cancel/:id", async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Booking canceled successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
