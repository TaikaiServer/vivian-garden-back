const express = require('express');
const routes = express.Router();
const { RequestBooking, ConfirmedBooking } = require('../models/Booking'); // Destructuring import


// Get all request bookings
routes.get('/requestBookings', async (req, res) => {
    try {
        const bookings = await RequestBooking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).send('Error fetching request bookings');
    }
});

// Get all confirmed bookings
routes.get('/confirmedBookings', async (req, res) => {
    try {
        const bookings = await ConfirmedBooking.find();
        res.json(bookings);
    } catch (error) {
        res.status(500).send('Error fetching confirmed bookings');
    }
});


// updating request bookings
routes.put('/requestBookings/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    try {
        const updatedBooking = await RequestBooking.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedBooking) {
            return res.status(404).send('Request booking not found');
        }
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).send('Error updating request booking');
    }
});


// Create a new confirmed booking
routes.post('/confirmedBookings', async (req, res) => {
    const newBooking = new ConfirmedBooking(req.body);
    try {
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(500).send('Error creating confirmed booking');
    }
});

// updating confirmed bookings
routes.put('/confirmedBookings/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    try {
        const updatedBooking = await ConfirmedBooking.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedBooking) {
            return res.status(404).send('Confirmed booking not found');
        }
        res.json(updatedBooking);
    } catch (error) {
        res.status(500).send('Error updating confirmed booking');
    }
});




// Delete a confirmed booking
routes.delete('/confirmedBookings/:id', async (req, res) => {
    try {
        const deletedBooking = await ConfirmedBooking.findByIdAndDelete(req.params.id);
        if (!deletedBooking) {
            return res.status(404).send('Confirmed booking not found');
        }
        res.json(deletedBooking);
    } catch (error) {
        res.status(500).send('Error deleting confirmed booking');
    }
});

module.exports = routes;


