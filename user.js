
require('dotenv').config();
const express = require('express');

const app = express();


/** mongdb secret in .env */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

var {database} = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');

/** session collection in mongodb */
var mongoStore = MongoStore.create({
	mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
	crypto: {
		secret: mongodb_session_secret
	}
});

/** create session and store in mongodb */
app.use(session({ 
    secret: node_session_secret,
	store: mongoStore,  
	saveUninitialized: false, 
	resave: true
}
));

/** Authenication check to see if user session is valid */
function isValidSession(req) {
    if (req.session.authenticated) {
        return true;
    }
    return false;
}

module.export = {isValidSession};
