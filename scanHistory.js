const router = require('express').Router();

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { ObjectId } = require('mongodb');
const { database } = require('./databaseConnection');


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const userCollection = database.db(process.env.MONGODB_DATABASE).collection('users');

const storage = multer.memoryStorage();

// Format restriction to only .jpeg, .jpg, and .png below 3MB */
const upload = multer({
    storage: storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB file size limit
    fileFilter: (req, file, callback) => {
        const allowedTypes = /jpeg|jpg|png/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(file.originalname.toLowerCase());

        if (mimetype && extname) {
            return callback(null, true);
        } else {
            callback(new Error('Invalid file type. Only JPEG, PNG, and TIFF are allowed.'));
        }
    }
});

const mongoSanitize = require('express-mongo-sanitize');

router.use(mongoSanitize(
    { replaceWith: '%' }
));

router.post('/picUpload', upload.single('image'), async (req, res) => {
    if (req.body.file) {
        console.log(req.body.file);
    }

    try {
        // get username from the session
        const username = req.session.username;
        if (!username) {
            return res.status(400).send('Username is required.');
        }

        // Upload image to Cloudinary using upload_stream
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });

        console.log('Cloudinary upload result:', result);

        // Prepare scan history entry
        const scanEntry = {
            scanId: new ObjectId(),
            timestamp: new Date(),
            scanData: result.secure_url
        };

        // Update user's scan history in MongoDB
        const updateResult = await userCollection.updateOne(
            { username: username },
            { $push: { scanHistory: scanEntry } }
        );

        if (updateResult.modifiedCount === 1) {
            console.log('Scan history updated successfully.');
            res.send('Scan history updated successfully.');
        } else {
            console.log('User not found or scan history update failed.');
            res.status(404).send('User not found or scan history update failed.');
        }
    } catch (error) {
        console.error('Error uploading image or updating scan history:', error);
        if (error.message.includes('Invalid file type')) {
            res.status(400).send(error.message);
        } else if (error.message.includes('File too large')) {
            res.status(400).send('File size exceeds limit of 3MB.');
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

// Error handling middleware for Multer
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File size exceeds limit of 3MB.');
        }
        return res.status(400).send(err.message);
    } else if (err) {
        return res.status(400).send(err.message);
    }   
    next();
});


module.exports = router;
