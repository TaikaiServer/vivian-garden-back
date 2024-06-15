const express = require('express');
const routes = express.Router();
const RoomAvailability = require('../models/RoomAvailability')



routes.get('/availability', async (req, res) => {
    try {
        const availabilities = await RoomAvailability.find();
        res.json(availabilities);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching availability data' });
    }
});

routes.post('/availability/:date', async (req, res) => {
    const { date } = req.params;
    const { singleRooms, groupRooms } = req.body;

    try {
        const updatedAvailability = await RoomAvailability.findOneAndUpdate(
            { date },
            { singleRooms, groupRooms },
            { new: true }
        );

        res.json(updatedAvailability);
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ error: 'Error updating availability data' });
    }
});

// Update the availability for a specific date
routes.put('/availability/:date', async (req, res) => {
    const { date } = req.params;
    const { singleRooms, groupRooms } = req.body;

    try {
        const updatedAvailability = await RoomAvailability.findOneAndUpdate(
            { date },
            { singleRooms, groupRooms },
            { new: true }
        );

        if (updatedAvailability) {
            res.json(updatedAvailability);
        } else {
            res.status(404).json({ message: 'No availability data found for this date' });
        }
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ error: 'Error updating availability data' });
    }
});

// Fetch availability for a specific date
routes.get('/availability/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const availability = await RoomAvailability.findOne({ date });
        if (availability) {
            res.json(availability);
        } else {
            res.status(404).json({ message: 'No availability data for this date' });
        }
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Error fetching availability data' });
    }
});

module.exports = routes
