const express = require('express');
const router = express.Router();
require('dotenv').config();

const mongodb_database = process.env.MONGODB_DATABASE;
var { database } = include('databaseConnection');
//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');

router.post('/', async (req, res) => {
    const email = req.session.email;
    const title = req.body.title;
    const notes = req.body.notes;
    const day = req.body.day;
    const time = req.body.time;

    const user = await userCollection.findOne({ email }, { projection: { notifications: 1 } });

    // Check if a notification with the same title already exists
    if (user && user.notifications) {
        const isDuplicate = user.notifications.some(notification => notification.title === title);
        if (isDuplicate) {
            return res.redirect('/createNotification/1'); // Or send an error message
        }
    }
    const reminder = {
        title: title,
        notes: notes,
        day,
        time
    };


    await userCollection.updateOne({ email }, { $push: { notifications: reminder } });
    console.log("Notification stored succesfully");

    res.redirect('/notifications');
});

module.exports = router;