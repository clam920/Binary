require('./utils.js');

const fs = require(`fs`);
require('dotenv').config();
const express = require('express');
const app = express();
const webPush = require('web-push');
const cron = require('node-cron');
const bodyParser = require('body-parser');

// use scanHistory.js to log user scan history
const scanHistoryRouter = require('./scanHistory');

// Authentication with google
const passport = require('passport');
require('./routes/googleAuth.js');

const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

// Web push for notifications
webPush.setVapidDetails(
    'mailto:manasesvillalobos80@gmail.com',
    publicKey, privateKey
);

// Mongo db information necessary
// to create a session 
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Mongo security information
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;


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

// import data from "./assets/type.json" assert { type: 'json' };
var facilities = [];
const data = [
    {
        "type": "glass",
        "facility": [
            {
                "place": "NORTH SHORE RECYCLING AND WASTE CENTRE",
                "coordinates": [-123.01809661781101, 49.30128946964686]
            },
            {
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
                "coordinates": [-123.06668623130273, 49.28432306230311]
            }
        ]
    },
    {
        "type": "plastic",
        "facility": [
            {
                "coordinates": [-122.46152803131277, 9.090931848515034],
                "place": "BLUE PLANET RECYCLING",
            },
            {
                "coordinates": [-122.81127270247502, 49.118203173139264],
                "place": "EMTERRA ENVIRONMENTAL - SURREY",
            },
            {
                "coordinates": [-123.10084884294041, 49.25716962771798],
                "place": "URBAN SOURCE",
            },
            {
                "coordinates": [-122.62682891358655, 49.20014503465938],
                "place": "WESTCOAST PLASTIC RECYCLING",
            }
        ]
    },
    {
        "type": "cardboard",
        "facility": [
            {
                "coordinates": [-123.06668623130273, 49.28432306230311],
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.09190007177935, 49.20640098139237],
                "place": "BEGG CARTON EXCHANGE",
            }
        ]
    },
    {
        "type": "paper",
        "facility": [
            {
                "coordinates": [-123.06668623130273, 49.28432306230311],
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.10642038874201, 49.20894031159841],
                "place": "SOUTH VAN BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.1149743134225, 49.20867115835692],
                "place": "VANCOUVER ZERO WASTE CENTER",
            },
        ]
    },
    {
        "type": "paper",
        "facility": [
            {
                "coordinates": [-123.06668623130273, 49.28432306230311],
                "place": "POWELL STREET RETURN-IT BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.10642038874201, 49.20894031159841],
                "place": "SOUTH VAN BOTTLE DEPOT",
            },
            {
                "coordinates": [-123.1149743134225, 49.20867115835692],
                "place": "VANCOUVER ZERO WASTE CENTER",
            },
        ]
    },
    {
        "type": "metal",
        "facility": [
            {
                "coordinates": [-123.08198097141488, 49.27338112280383],
                "place": "REGIONAL RECYCLING - VANCOUVER",
            },
            {
                "coordinates": [-122.57650130520572, 49.20857510585476],
                "place": "WESTERN DRUM RECYCLERS",
            },
        ]
    }
]

const getSelected = () => {
    var selection = document.getElementById("mySelection").value;
    if (facilities.length > 0) {
        facilities.splice(0, facilities.length);
    }
    data.forEach(el => {
        if (el.type === selection) {
            facilities = el.facility;
        }
    });

    removeMarkers();

    // add markers to map
    for (const feature of facilities) {
        // console.log(feature)
        // create a HTML element for each feature
        const el = document.createElement('div');
        el.className = 'marker';
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(feature.place);


        // make a marker for each feature and add to the map
        new mapboxgl.Marker(el).setLngLat(feature.coordinates).addTo(map).setPopup(popup);
    }
}

function removeMarkers() {
    const markers = document.getElementsByClassName('marker');
    while (markers.length > 0) {
        markers[0].parentNode.removeChild(markers[0]);
    }
}

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
const saveSubscription = require('./routes/notifications/saveSubscription.js');
const updateNotification = require('./routes/notifications/modifyNotification.js');


const port = process.env.PORT || 3000;
const expireTime = 60 * 60 * 1000;// Hour, minutes, seconds miliseconds

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); //to parse the body
app.use(bodyParser.json());

var { database } = include('databaseConnection');

// connect the collection of users in the database
const userCollection = database.db(mongodb_database).collection('users');

// navigation bar links
const navLinks = [
    { name: 'Home', link: '/' },
    { name: 'Recycle Centers', link: '/recycleCenters' },
    { name: 'Scan', link: '/' },
    { name: 'Tutorial', link: '/tutorial' }
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
app.use('/save-subscription', saveSubscription); // it will save the subscribtion of the user that is necessary to webPush and service worker
app.use('/updateNotification', updateNotification); // to update a notification

// Schedule notifications check
cron.schedule('* * * * *', async () => {
    console.log('Checking for due notifications...');
    const now = new Date();
    const users = await userCollection.find({}).toArray();

    for (const user of users) {
        if (user.notifications && user.subscription) {
            for (const notification of user.notifications) {
                const today = now.getDay();
                const day = notification.day;

                // Check if the notification day is today or earlier in the week
                if (day == today) {
                    const hourNow = now.getHours();
                    const minuteNow = now.getMinutes();
                    const [hour, minute] = notification.time.split(':').map(Number);

                    // Check if the current time matches the notification time
                    if (hourNow === hour && minuteNow === minute) {
                        const payload = JSON.stringify({
                            title: notification.title,
                            body: notification.notes
                        });

                        // console.log('The day is: ' + day);
                        // console.log('Today is: ' + today);
                        // console.log('The hour: ' + hour);
                        // console.log('time now is: ' + hourNow);
                        // console.log('The minute: ' + minute);
                        // console.log('minute now is: ' + minuteNow);
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

// Links to the main page
app.get('/', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    res.render('home', { navLinks: navLinks, username: req.session.username });
});

app.get('/home', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }

    res.render('home', { navLinks: navLinks, username: req.session.username });
});


app.get('/recycleCenters', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
        return;
    }
    const email = req.body.email;
    res.render('recycleCenters', { navLinks, username: req.session.username });
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
    res.render('404');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
