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
app.use('/', shopifyRoutes)


app.listen(3008, () => {
    console.log('Node istening on port 3008')
})

