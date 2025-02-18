require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Booking = require("./models/Booking");

// Initialize Express App
const app = express();

// Middleware
app.use(cors()); // Allow CORS
app.use(express.json()); // Allow JSON data

// Custom slot generator
function generateSlots(startTime, endTime) {
  const slots = [];
  let currentTime = new Date(startTime);

  while (currentTime < endTime) {
    let endTimeSlot = new Date(currentTime.getTime() + 30 * 60000); // Add 30 minutes to current slot
    let slot = `${currentTime.getHours()}:${
      currentTime.getMinutes() < 10
        ? "0" + currentTime.getMinutes()
        : currentTime.getMinutes()
    } - ${endTimeSlot.getHours()}:${
      endTimeSlot.getMinutes() < 10
        ? "0" + endTimeSlot.getMinutes()
        : endTimeSlot.getMinutes()
    }`;
    slots.push(slot);

    // Move to the next slot
    currentTime = endTimeSlot;
  }

  return slots;
}

// Generate slots for the day (example: 9 AM to 6 PM)
const slots = generateSlots(
  new Date().setHours(9, 0, 0),
  new Date().setHours(18, 0, 0)
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Hall Booking API!");
});

app.post("/api/book", async (req, res) => {
  const { phone, date, slot } = req.body;

  if (!phone || !date || !slot) {
    return res
      .status(400)
      .json({ message: "All fields (phone, date, and slot) are required." });
  }

  try {
    // Check if the slot is already booked on the selected date
    const existingBooking = await Booking.findOne({ date, slot });
    if (existingBooking) {
      return res.status(400).json({ message: "This slot is already booked." });
    }

    // Create the new booking
    const newBooking = new Booking({ phone, date, slot });
    await newBooking.save();

    res.status(201).json({ message: "Booking successful!" });
  } catch (err) {
    console.error("Error booking slot:", err);
    res.status(500).json({ message: "Error booking slot", error: err });
  }
});

// Fetch bookings by phone number
app.get("/api/bookings/:phone", async (req, res) => {
  const phone = req.params.phone;
  try {
    const bookings = await Booking.find({ phone: phone });
    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this phone number" });
    }
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings by phone:", err);
    res.status(500).json({ message: "Error fetching bookings", error: err });
  }
});
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const bookingId = req.params.id;

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking deleted successfully!" });
  } catch (err) {
    console.error("Error deleting booking:", err);
    res.status(500).json({ message: "Error deleting booking", error: err });
  }
});

app.patch("/api/bookings/reschedule/:id", async (req, res) => {
  try {
    const { date, slot } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Update booking details
    booking.date = date;
    booking.slot = slot;

    await booking.save();
    res.status(200).json({ message: "Booking rescheduled successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found" });
    }
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Error fetching bookings", error: err });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
