const express = require('express')
const app = express();
const MongoDB = require('./db/mongodb')
require('dotenv').config()
const cors = require("cors")
const shopifyRoutes = require('./routes/shopify-routes');
// const client = require('./client');


// Middleware 
app.use(cors())
app.use(express.json());

// Routes
// app.use('/', client);
// app.use('/', shopifyRoutes)
app.get('/', function (req, res) {
    res.send('<h1 style="text-align: center">Hello AWS</h1>')
})

app.listen(3008, () => {
    console.log('Node istening on port 3008')
})

