const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// importing schemas
const RoomAvailability = require('./models/RoomAvailability');

// importing routing
const availabilityRoute = require("./routes/AvailableRoutes")
const bookingRoute = require("./routes/BookingRoutes")
const crudRoute = require("./routes/CRUDRoutes")


// port number
const PORT = 3000;

// db connection
const DB_CONNECTION_STRING = "mongodb+srv://vudangdaiduong:Taikai1201@assignment1.ij06984.mongodb.net/booking?retryWrites=true&w=majority";

mongoose.connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const initializeDefaultRoomAvailability = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await RoomAvailability.deleteMany({});

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];

        const existingAvailability = await RoomAvailability.findOne({ date: formattedDate });
        if (!existingAvailability) {
            await new RoomAvailability({
                date: formattedDate,
                singleRooms: 5,
                groupRooms: 2
            }).save();
        }
    }
};

app.use("/api", availabilityRoute)
app.use("/api", bookingRoute)
app.use("/api", crudRoute)

app.route("/").get((req, res) => {
    res.send("<h1>hello</h1>")
})


mongoose.connection.once('open', async () => {
    console.log('Connected to MongoDB');
    await initializeDefaultRoomAvailability();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
