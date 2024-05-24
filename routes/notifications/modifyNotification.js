const express = require('express');
const router = express.Router();
require('dotenv').config();

const mongodb_database = process.env.MONGODB_DATABASE;
var { database } = include('databaseConnection');
//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');

// navigation bar links
const navLinks = [
    { name: 'Home', link: '/' },
    { name: 'Recycle Centers', link: '/recycleCenters' },
    { name: 'Scan', link: '/' },
    { name: 'Tutorial', link: '/tutorial' }
];

router.post('/:id', async (req, res) =>{
    const title = req.body.title;
    const email = req.session.email;

    const notifications = await userCollection.find({ email: email,  }).project({ notifications: 1 }).toArray();
    
   
    res.render('updateNotification', {navLinks, username: req.session.username });
});

module.exports = router;