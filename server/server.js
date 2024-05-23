const express = require('express');
const app = express();

app.get('/api', (req, res) => {
    res.send('Hello');
});

const port = 5001;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});