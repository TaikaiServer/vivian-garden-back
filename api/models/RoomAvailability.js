// backend/models/RoomAvailability.js
const mongoose = require('mongoose');

const roomAvailabilitySchema = new mongoose.Schema({
  date: { type: String, required: true},
  singleRooms: { type: Number, default: 5 },
  groupRooms: { type: Number, default: 2 }
});

const RoomAvailability = mongoose.model('RoomAvailability', roomAvailabilitySchema, 'room-availability');

module.exports = RoomAvailability;
