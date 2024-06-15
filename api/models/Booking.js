const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    name: String,
    number: String,
    email: String,
    people: Number,
    indate: String, // yyyy-mm-dd format
    outdate: String, // yyyy-mm-dd format
    option: String,
    note: String,
    singleRooms: { type: Number, default: 0 }, // New field to specify number of single rooms for 'Phòng Lẻ' option
    status: { type: String, default: 'pending' } // 'pending' or 'confirmed'
});

const RequestBooking = mongoose.model('RequestBooking', bookingSchema, 'request');
const ConfirmedBooking = mongoose.model('ConfirmedBooking', bookingSchema, 'confirmed');

module.exports = { RequestBooking, ConfirmedBooking };
