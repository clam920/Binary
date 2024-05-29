const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
require('dotenv').config();

const mongodb_database = process.env.MONGODB_DATABASE;
const expireTime = 60 * 60 * 1000;// Hour, minutes, seconds miliseconds

var { database } = include('databaseConnection');

//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');


router.get('/', (req, res) => {
    if(req.session.authenticated){
        res.redirect('/');
        return;
    }
    res.render("login");
});

router.get('/:id', (req, res) => {
    if(req.session.authenticated){
        res.redirect('/');
        return;
    }
    const problem = req.params.id;
    res.render("login2", {problem: problem});
});

router.post('/', async(req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    // validates if the email is a string 20 char max
    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(email);
    if (validationResult.error != null) {
        console.log(validationResult.error);
        res.redirect('/login/1');
        return;
    }

    // in the collection finds the email that matches the req.body.email
    // and will if it exist will get the username and the password of that user.
    const result = await userCollection.find({ email: email}).project({ username: 1, password: 1}).toArray();

    console.log(result);
    // result is an array, if it is empty then user was not found
    if(result.length != 1) {
        console.log('User not found');
        res.redirect('/login/2');
        return;
    }

    var username = result[0].username;
    
    // since we used bcrypt 
    if (await bcrypt.compare(password, result[0].password)) {
        console.log('Correct password');
        req.session.authenticated = true;
        req.session.username = username;
        req.session.email = email;
        req.session.cookie.maxAge = expireTime;
        req.session.termsConditions = true;
        res.redirect('/');
        return;
    } else {
        console.log('Incorrect password');
        res.redirect('/login/3');
        return;
    }

});

module.exports = router;