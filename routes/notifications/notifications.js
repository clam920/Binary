const express = require('express');
const router = express.Router();
require('dotenv').config();


// navigation bar links
const navLinks = [
    { name: 'Home', link: '/' },
    { name: 'Recycle Centers', link: '/recycleCenters' },
    { name: 'Scan', link: '/' },
    { name: 'Tutorial', link: '/tutorial' }
];

const mongodb_database = process.env.MONGODB_DATABASE;
var { database } = include('databaseConnection');
//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');


// goes to the notification link
router.get('/', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    const email = req.session.email;

    const notifications = await userCollection.find({ email: email }).project({ notifications: 1 }).toArray();

    res.render('notifications', { navLinks, username: req.session.username, notifications: notifications[0].notifications })
});

module.exports = router