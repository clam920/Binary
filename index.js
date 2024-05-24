require('./public/js/utils.js');

const fs = require(`fs`);
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const webPush = require('web-push');
const cron = require('node-cron');
const bodyParser = require('body-parser');

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

// Web push for notifications
webPush.setVapidDetails(
    'mailto:manasesvillalobos80@gmail.com',
    publicKey, privateKey
);

app.use(bodyParser.json());

// use scanHistory.js to log user scan history
const scanHistoryRouter = require('./scanHistory');
const axios = require('axios');
const cors = require('cors');

// Authentication with google
const passport = require('passport');
require('./routes/googleAuth.js');

// Mongo db information necessary
// to create a session 
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Handles image uploads
const multer = require('multer')

// Mongo security information
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

// google maps and places security information
const mapsAPIkey = process.env.GOOGLE_MAPS_API_KEY;

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(cors());

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true
}));


// routes
// Login router
const loginRouter = require('./routes/login.js');
// signup router
const signUpRouter = require('./routes/signup.js');
// profile router
const profile = require('./routes/profile.js');
// Reset password route
const confirmUser = require('./routes/reset_password/confirmUser.js');
const confirmEmail = require('./routes/reset_password/confirmEmail.js');
const resetPassword = require('./routes/reset_password/resetPassword.js');
const changePassword = require('./routes/reset_password/changePassword.js');

// Notifications route
const notifications = require('./routes/notifications/notifications.js');
const createNotification = require('./routes/notifications/createNotification.js');
const recordNotification = require('./routes/notifications/recordNotification.js');
const deleteNotification = require('./routes/notifications/deleteNotification.js');
// const saveSubscription = require('./routes/notifications/saveSubscription.js');
// const updateNotification = require('./routes/notifications/modifyNotification.js');


const port = process.env.PORT || 3000;
const expireTime = 60 * 60 * 1000;// Hour, minutes, seconds miliseconds

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false })); //to parse the body

var { database } = include('databaseConnection');

// connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');
const complaintCollection = database.db(mongodb_database).collection('complaints');

// navigation bar links
const navLinks = [
    { name: 'Home', link: '/scan' },
    { name: 'Recycle Centers', link: '/recycleCenters' },
    { name: 'Scan History', link: '/history' },
    { name: 'Tutorial', link: '/tutorial' },
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
        req.session.email = req.user.emails[0].value; //to set the email
        res.redirect('/'); // Successful authentication, redirect home.
    });

// To do login
app.use('/login', loginRouter);
// verifies the if the user exists
app.use('/verifyUser', loginRouter);

// Link to the route sign up
app.use('/signup', signUpRouter);
app.use('/createUser', signUpRouter);

// Link to the profile page
app.use('/profile', profile);

// Link to reset the password and enter the email to identify which account
app.use('/confirmUser', confirmUser); // send a form a where the user will enter his email
app.use('/confirmEmail', confirmEmail); // gets the email to check if it exist in the database and send back the security question
app.use('/resetPassword', resetPassword); // gets the answer and verify if it matches with the one in the database redirect to a form where the user enter the new password
app.use('/changePassword', changePassword); // gets the new password and verify it with joi and resets the new one in the database

//Notifications
app.use('/notifications', notifications);
app.use('/createNotification', createNotification); // form to create notifications
app.use('/recordNotification', recordNotification); // it is post it will store the notification in database
app.use('/deleteNotification', deleteNotification); //it will delete a notification
// app.use('/save-subscription', saveSubscription); // it will save the subscribtion of the user that is necessary to webPush and service worker
// app.use('/updateNotification', updateNotification); // to update a notification

app.post('/save-subscription', async (req, res) => {
    const email = req.session.email;
    const subscription = req.body.subscription;

    await userCollection.updateOne({ email }, { $set: { subscription } });
    res.json({ status: 'Success', message: 'Subscription saved.' });
});

// test to merge
// Schedule notifications check
cron.schedule('* * * * *', async () => {
    console.log('Checking for due notifications...');
    const now = new Date();
    const users = await userCollection.find({}).toArray();

    for (const user of users) {
        
        if (user.notifications && user.subscription) {
            for (const notification of user.notifications) {
                // console.log(notification);
                const today = now.getDay();
                const day = notification.day;

                // console.log('The day is: ' + day);
                // console.log('Today is: ' + today);
                // Check if the notification day is today or earlier in the week
                if (day == today) {
                    const hourNow = now.getHours();
                    const minuteNow = now.getMinutes();
                    const [hour, minute] = notification.time.split(':').map(Number);

                    
                        // console.log('The hour: ' + hour);
                        // console.log('time now is: ' + hourNow);
                        // console.log('The minute: ' + minute);
                        // console.log('minute now is: ' + minuteNow);

                    // Check if the current time matches the notification time
                    if (hourNow === hour && minuteNow === minute) {
                        const payload = JSON.stringify({
                            title: notification.title,
                            body: notification.notes
                        });

                        
                        try {
                            await webPush.sendNotification(user.subscription, payload);
                            console.log('Push notification sent successfully');
                        } catch (error) {
                            console.error('Error sending push notification', error);
                        }

                    }
                }
            }
        }
    }
});

function getMapResult() {
    // const mapResult = await fetch(`https://maps.googleapis.com/maps/api/place/details/json
    //     ?place_id=ChIJw5MD3ZNwhlQRvstXN3AeLXk
    //     &key=AIzaSyAqMWhRWQ2etM9TJFgDK7gXxPZ18IznGCQ`)
    // console.log((mapResult));
    axios.get(`https://maps.googleapis.com/maps/api/place/details/json
    ?place_id=ChIJw5MD3ZNwhlQRvstXN3AeLXk
    &key=${mapsAPIkey}`)
        .then(function (response) {
            // handle success
            console.log(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error.message);
        })
}
getMapResult();

/** Arrays of tutorial articles to be parsed from tutorial.json */
let tutorialArray;

fs.readFile('tutorial.JSON', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        tutorialArray = JSON.parse(data);
        // console.log(tutorialArray[0]);
    } catch (error) {
        console.error('Error parsing JSON', error);
    }
});

app.get('/egg', (req, res) => {
    res.render("easter_egg", { navLinks: navLinks });
})

app.get('/tutorial', (req, res) => {
    res.render("tutorial", { tutorialArray: tutorialArray, navLinks: navLinks, username: req.session.username });
});

/** clickable article details. */
app.post('/articles/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    res.render("articles", { tutorialArray: tutorialArray, articleId, navLinks: navLinks });
});

app.use('/', scanHistoryRouter);

app.get('/history', async (req, res) => {
    try {
        // Get username from session
        const username = req.session.username;
        if (!username) {
            return res.status(400).send('Username is required.');
        }

        // Fetch user document from MongoDB
        const user = await userCollection.findOne({ username: username });

        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Get scan history from user document
        const scanHistory = user.scanHistory || [];

        // Render history.ejs with scan history data
        res.render('history', { scanHistory: scanHistory, navLinks: navLinks, username: req.session.username });
    } catch (error) {
        console.error('Error fetching scan history:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Links to the main page
app.get('/', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    res.render('scan', { navLinks: navLinks, username: req.session.username });
});

app.get('/home', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    res.render('scan', { navLinks: navLinks, username: req.session.username });
});

app.get('/recycleCenters', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }
    const email = req.body.email;
    res.render('recycleCenters', { navLinks, username: req.session.username });
});

app.get('/scan', (req, res) => {
    res.render('scan', { navLinks, username: req.session.username });
});

const upload = multer();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
const cloudinary = require('cloudinary').v2;
const { ObjectId } = require('mongodb');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

app.post('/saveImage', async (req, res) => {
    const username = req.session.username;

    const imageURI = req.body.file;
    const imageType = req.body.type;
    const imageID = new ObjectId();
    const imageDate = new Date();

    // cloudinary
    await cloudinary.uploader.upload(imageURI, { 
        public_id: imageID
    }, async function(error, result) { 
        console.log(result); 

        // Prepare scan history entry
        const scanEntry = {
            scanId: imageID,
            timestamp: imageDate,
            scanData: result.secure_url,
            scanType: imageType
        };

        // Update user's scan history in MongoDB
        const updateResult = await userCollection.updateOne(
            { username: username },
            { $push: { scanHistory: scanEntry } }
        );
    });
});

// const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/complaint', async (req, res) => {
    const type = req.body.type[0] !== 'Other' ? req.body.type[0] : req.body.type[1];
    const allowForTraining = req.body.allowForTraining === '' ? true : false;

    console.log(type);
    console.log(allowForTraining);

    await complaintCollection.insertOne({
        type,
        allowForTraining,
    })

    res.redirect('/scan');
});

// Logout 
app.post('/logout', (req, res) => {
    req.session.destroy();

    res.redirect('/login');
});

app.use(express.static(__dirname + "/public"));

// Catches all 404
app.get('*', (req, res) => {
    res.status(404);
    res.render('404', {navLinks, username : req.session.username});
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
