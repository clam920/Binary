const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
require('dotenv').config();
const saltRound = 12;

const mongodb_database = process.env.MONGODB_DATABASE;
const expireTime = 60 * 60 * 1000;// Hour, minutes, seconds miliseconds

var { database } = include('databaseConnection');

//connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');



// links to sign in page
router.get('/', (req, res) => {
    if(req.session.authenticated){
        res.redirect('/');
        return;
    }
    res.render('signup');
});

// links to sign in page
router.get('/:id', (req, res) => {
    if(req.session.authenticated){
        res.redirect('/');
        return;
    }
    const problem = req.params.id;
    res.render('signup2', {problem: problem});
});

// Creates a user and stores them in the database
router.post('/', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let secQ = req.body.sec_question;
    let secA = req.body.sec_Answer;
    let terms = req.body.termsCondition;

    console.log("Security question: "+ secQ);
    console.log("Security answer: " + secA);

    //check if the email already has an account
    const existEmail = await userCollection.find({email: email}).toArray();

    if(existEmail.length > 0){
        res.redirect('/signup/1'); //if it does then it will be redirected to sign up
        return;
    }

    const schema = Joi.object({
        username: Joi.string().max(20).required(),//can be used as a login id
        password: Joi.string().max(20).required()
    });
    
    // validates if the password and username are a string 
    // with max length of 20 characters
    const validationResult = schema.validate({username, password});

    if(validationResult.error != null){
        console.log(validationResult.error);
        res.redirect('/signup/2');
        return;
    }

    //hashes the password
    let hashPassword = await bcrypt.hash(password, saltRound);
    const method = 'Binary';

    // inserts the user to the database
    await userCollection.insertOne({username: username, email: email, password: hashPassword, security_question: secQ, security_answer: secA, registrationMethod: method, termsConditions: terms});

    req.session.authenticated = true;
    req.session.username = username;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;

    res.redirect('/');
});

module.exports = router;