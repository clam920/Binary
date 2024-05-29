require('./public/js/utils.js');
console.log("in index.js");

const fs = require(`fs`);
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const webPush = require('web-push');
const cron = require('node-cron');
const bodyParser = require('body-parser');
const url = require('url');

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

// Web push for notifications
webPush.setVapidDetails(
    'mailto:manasesvillalobos80@gmail.com',
    publicKey, privateKey
);

// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: "50mb" }));

// use scanHistory.js to log user scan history
const scanHistoryRouter = require('./routes/scanHistory.js');
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
const feedbackCollection = database.db(mongodb_database).collection('feedback');

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
                //console.log(notification);
                const today = now.getDay();
                const day = notification.day;

                console.log('The day is: ' + day);
                console.log('Today is: ' + today);

                alert('The day is: ' + day);
                alert('Today is: ' + today);
                // Check if the notification day is today or earlier in the week
                if (day == today) {
                    const hourNow = now.getHours();
                    const minuteNow = now.getMinutes();
                    const [hour, minute] = notification.time.split(':').map(Number);


                    console.log('The hour: ' + hour);
                    console.log('time now is: ' + hourNow);
                    console.log('The minute: ' + minute);
                    console.log('minute now is: ' + minuteNow);

                    alert('The hour: ' + hour);
                    alert('time now is: ' + hourNow);
                    alert('The minute: ' + minute);
                    alert('minute now is: ' + minuteNow);

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

app.get('/tutorial', (req, res) => {
    res.render("tutorial", { tutorialArray: tutorialArray, navLinks: navLinks, username: req.session.username });
});

/** clickable article details. */
app.post('/articles/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    res.render("articles", { tutorialArray: tutorialArray, articleId, navLinks: navLinks });
});

app.use('/', scanHistoryRouter);

app.use("/", (req, res, next) => {
    app.locals.navLinks = navLinks;
    app.locals.currentURL = url.parse(req.url).pathname;
    next();
});

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
        let scanHistory = user.scanHistory || [];

        // Apply filters
        const timeFilter = parseInt(req.query.timeFilter, 10);
        const typeFilter = req.query.typeFilter;

        const now = new Date();
        if (timeFilter) {
            const pastDate = new Date(now - timeFilter * 24 * 60 * 60 * 1000);
            scanHistory = scanHistory.filter(scan => new Date(scan.timestamp) >= pastDate);
        }

        if (typeFilter && typeFilter !== "") {
            scanHistory = scanHistory.filter(scan => scan.scanType === typeFilter);
        }

        // Calculate waste distribution statistics
        const wasteDistribution = {};
        scanHistory.forEach(scan => {
            if (wasteDistribution[scan.scanType]) {
                wasteDistribution[scan.scanType]++;
            } else {
                wasteDistribution[scan.scanType] = 1;
            }
        });

        // Prepare data for the pie chart
        let chartData = {
            labels: Object.keys(wasteDistribution),
            datasets: [{
                label: 'Waste Distribution',
                data: Object.values(wasteDistribution),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1
            }]
        };

        // Render history.ejs with filtered scan history data and filter values
        res.render('history', { scanHistory, navLinks, username: req.session.username, timeFilter, typeFilter, chartData });

    } catch (error) {
        console.error('Error fetching scan history:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Links to the main page
app.get('/', (req, res) => {

    res.render('scan', { navLinks: navLinks, username: req.session.username, terms: req.session.termsConditions });
});

app.get('/home', (req, res) => {

    res.render('scan', { navLinks: navLinks, username: req.session.username, terms: req.session.termsConditions });
});

app.get('/recycleCenters', async (req, res) => {
    const email = req.body.email;
    res.render('recycleCenters', { navLinks, username: req.session.username });
});

app.get('/scan', (req, res) => {
    res.render('scan', { navLinks, username: req.session, terms: req.session.termsConditions });
});

const upload = multer();
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
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

    let url;

    // cloudinary
    await cloudinary.uploader.upload(imageURI, {
        public_id: imageID
    }, async function (error, result) {
        console.log(result);
        url = result.secure_url;

        // Prepare scan history entry
        const scanEntry = {
            scanId: imageID,
            timestamp: imageDate,
            scanData: url,
            scanType: imageType
        };

        // Update user's scan history in MongoDB
        const updateResult = await userCollection.updateOne(
            { username: username },
            { $push: { scanHistory: scanEntry } }
        );
    });

    res.send({ url });
});

// const bodyParser = require('body-parser');

app.post('/feedback', async (req, res) => {
    const url = req.body.url;
    const correct = req.body.correct === 'true' ? true : false;

    console.log(url);
    console.log(correct);

    await feedbackCollection.insertOne({
        url,
        correct,
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
    res.render('404', { navLinks, username: req.session.username });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
