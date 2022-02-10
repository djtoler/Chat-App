const express = require("express");
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const PORT  = 2423 || process.env.PORT;

app.listen(PORT, () => 
    console.log(`server is running on port ${PORT}`)
    );


