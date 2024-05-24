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

// route to create notifications
router.get('/', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    res.render('createNotification', { navLinks, username: req.session.username })
});

// in case something goes wrong
// for now is just if the title is not unique
router.get('/:id', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    const problem = req.params.id;

    res.render('createNotification2', { navLinks, username: req.session.username, problem})
});

module.exports = router;