const express = require('express');
const router = express.Router();
require('dotenv').config();

const mongodb_database = process.env.MONGODB_DATABASE;
var { database } = include('databaseConnection');
//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');

router.post('/:id', async (req, res) =>{
    const email = req.session.email;
    const notification = req.params.id;

    // It will delete the notification
    await userCollection.updateOne({ email: email }, { $pull: { notifications: { title: notification }} } );

    console.log('Notification deleted');

    res.redirect('/notifications');
});

module.exports = router;
