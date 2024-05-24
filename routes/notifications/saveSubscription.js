const express = require('express');
const router = express.Router();
require('dotenv').config();

const mongodb_database = process.env.MONGODB_DATABASE;
var { database } = include('databaseConnection');
//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');

router.post('/', async (req, res) => {
    const email = req.session.email;
    const subscription = req.body.subscription;

    await userCollection.updateOne({ email }, { $set: { subscription } });
    res.json({ status: 'Success', message: 'Subscription saved.' });
});

module.exports = router
