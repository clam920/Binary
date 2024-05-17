require('./utils.js');

require('dotenv').config();
const express = require('express');
const app = express();

const passport = require('passport');

require('./routes/googleAuth.js');

// Login router
const loginRouter = require('./routes/login.js');
// signup router
const signUpRouter = require('./routes/signup.js');
// Reset password route
const confirmUser = require('./routes/reset_password/confirmUser.js');
const confirmEmail = require('./routes/reset_password/confirmEmail.js');
const resetPassword = require('./routes/reset_password/resetPassword.js');
const changePassword = require('./routes/reset_password/changePassword.js');

// to create a session 
const session = require('express-session');
const MongoStore = require('connect-mongo');

const port = process.env.PORT || 3000;
const expireTime = 60 * 60 * 1000;// Hour, minutes, seconds miliseconds

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); //to parse the body

// Mongo security information
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

var { database } = include('databaseConnection');

// connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));

const navLinks = [
    {name: 'Home', link: '/'},
    {name: 'Recycle Centers', link: '/'},
    {name: 'Scan', link: '/'},
    {name: 'Tutorial', link: '/'},
    {name: 'Profile', link: '/'}
];

// Passport to use google authentication
app.use(passport.initialize()); // initialize the passport
app.use(passport.session());    // initialize the session

// Will do the login with google 
app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] }));

// Callback than handles the response after sign in with google
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirec: '/', // If succesfully login it will
        failureRedirect: '/login' // if something went wrong when login in with google
    }),
    function (req, res) {
        const username = req.user.name.givenName; // to get the name of the user from the google login
        req.session.authenticated = true; // to verify it has a session and allowed to go to the pages where a user is required
        req.session.username = username; // to set the username 
        req.session.cookie.maxAge = expireTime; // to set the expire time of the session which is one hour for the moment
        res.redirect('/'); // Successful authentication, redirect home.
    });

// To do login
app.use('/login', loginRouter);
// verifies the if the user exists
app.use('/verifyUser', loginRouter);

//to do reset password
// app.use('/confirmUser', resetPassword);

// Link to the route sign up
app.use('/signup', signUpRouter);
app.use('/createUser', signUpRouter);

// Link to reset the password and enter the email to identify which account
app.use('/confirmUser', confirmUser); // send a form a where the user will enter his email
app.use('/confirmEmail', confirmEmail); // gets the email to check if it exist in the database and send back the security question
app.use('/resetPassword', resetPassword); // gets the answer and verify if it matches with the one in the database redirect to a form where the user enter the new password
app.use('/changePassword', changePassword); // gets the new password and verify it with joi and resets the new one in the database

// Links to the main page
app.get('/', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }
   
    res.render('home', {navLinks: navLinks, username:req.session.username});
});

app.get('/home', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }
   
    res.render('home', {navLinks: navLinks, username:req.session.username});
});

// Logout 
app.post('/logout', (req, res) => {
    req.session.destroy();

    res.redirect('/login');
});

// Catches all 404
app.get('*', (req, res) => {
    res.status(404);
    res.render('404');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});