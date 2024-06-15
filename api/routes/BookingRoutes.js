const express = require('express');
const routes = express.Router();
const { RequestBooking, ConfirmedBooking } = require('../models/Booking'); // Destructuring import
const RoomAvailability = require('../models/RoomAvailability'); // Import RoomAvailability model
const nodemailer = require('nodemailer');

// Helper function to adjust room availability
const adjustRoomAvailability = async (booking) => {
    const { indate, outdate, option, singleRooms } = booking;
    const dates = [];

    let currentDate = new Date(indate);
    const endDate = new Date(outdate);
    endDate.setDate(endDate.getDate() - 1); // Exclude the checkout date

    while (currentDate <= endDate) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    for (let date of dates) {
        const availability = await RoomAvailability.findOne({ date });
        if (availability) {
            if (option === 'Nguyen Căn') {
                availability.singleRooms -= 5;
                availability.groupRooms -= 2;
            } else if (option === '6 Phòng') {
                availability.singleRooms -= 5;
                availability.groupRooms -= 1;
            } else if (option === 'Phòng Lẻ') {
                availability.singleRooms -= singleRooms;
            }
            await availability.save();
        } else {
            const newAvailability = new RoomAvailability({
                date,
                singleRooms: option === 'Phòng Lẻ' ? 5 - singleRooms : 0,
                groupRooms: option === 'Nguyen Căn' || option === '6 Phòng' ? 1 : 2,
            });
            await newAvailability.save();
        }
    }
};

routes.post('/', (req, res) => {
    res.send("<h1>hello</h1>")
})


// Endpoint to book a room
routes.post('/book', async (req, res) => {
    const { name, number, email, people, indate, outdate, option, note, singleRooms } = req.body;
    const newBooking = new RequestBooking({ name, number, email, people, indate, outdate, option, note, singleRooms });

    try {
        await newBooking.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vudangdaiduong@gmail.com',
                pass: 'smix dowo bteq jvej'
            }
        });

        const mailOptions = {
            from: 'vudangdaiduong@gmail.com',
            to: 'viviangardenhomestay@gmail.com',
            subject: 'Yêu Cầu Đặt Phòng Mới',
            text: `Họ và Tên: ${name}\nSố Điện Thoại: ${number}\nEmail: ${email}\nSố lượng người dự kiến: ${people}\nNgày mong muốn Check In: ${indate}\nNgày mong muốn Check Out: ${outdate}\nLựa Chọn Book Phòng: ${option}\nSố Lượng Phòng Lẻ: ${option === 'Phòng Lẻ' ? singleRooms : 'N/A'}\nGhi Chú: ${note}\n`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).send('Booking request submitted');
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error saving booking');
    }
});

// Endpoint to get all bookings
routes.get('/booking', async (req, res) => {
    try {
        const bookings = await RequestBooking.find();
        const confirmedBookings = await ConfirmedBooking.find();
        res.json({ bookings, confirmed: confirmedBookings });
    } catch (error) {
        res.status(500).send('Error fetching bookings');
    }
});

// Endpoint to confirm a booking
routes.post('/booking/confirm', async (req, res) => {
    try {
        const bookingId = req.body._id;
        const booking = await RequestBooking.findById(bookingId);

        if (!booking) {
            return res.status(404).send('Booking not found');
        }

        const { indate, outdate, option, singleRooms } = booking;
        let currentDate = new Date(indate);
        const endDate = new Date(outdate);
        endDate.setDate(endDate.getDate() - 1); // Exclude the checkout date

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const availability = await RoomAvailability.findOne({ date: dateStr });

            if (availability) {
                if ((option === 'Nguyen Căn' && (availability.singleRooms < 5 || availability.groupRooms < 2)) ||
                    (option === '6 Phòng' && (availability.singleRooms < 5 || availability.groupRooms < 1)) ||
                    (option === 'Phòng Lẻ' && availability.singleRooms < singleRooms)) {
                    return res.status(400).json({ message: `Not enough rooms available on ${dateStr}` });
                }
            } else {
                if ((option === 'Nguyen Căn' && (5 > 5 || 2 > 2)) ||
                    (option === '6 Phòng' && (5 > 5 || 1 > 1)) ||
                    (option === 'Phòng Lẻ' && 5 < singleRooms)) {
                    return res.status(400).json({ message: `Not enough rooms available on ${dateStr}` });
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        const confirmedBooking = new ConfirmedBooking(booking.toObject());
        await confirmedBooking.save();
        await RequestBooking.findByIdAndDelete(bookingId);

        // Adjust room availability
        await adjustRoomAvailability(booking);

        res.status(200).send('Booking confirmed');
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).send('Error confirming booking');
    }
});

// Endpoint to decline a booking
routes.post('/booking/decline', async (req, res) => {
    try {
        const bookingId = req.body._id;
        await RequestBooking.findByIdAndDelete(bookingId);
        res.status(200).send('Booking declined');
    } catch (error) {
        res.status(500).send('Error declining booking');
    }
});

module.exports = routes;
