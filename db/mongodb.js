require('dotenv').config()
const { MongoClient } = require('mongodb');
const Users = require('./users');
const Products = require('./product');
const { MONGO_DB_URI, MAKESY_DB_URI } = process.env;

class MongoDB {
    constructor() {
        const url = `${MAKESY_DB_URI}`;
        try {
            this.client = new MongoClient(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        } catch (err) {
            console.log(err)
        }
    }
    async init() {
        try {
            await this.client.connect();
            console.log('connected to database');
            // this.db = process.env.NODE_ENV === 'development' ? this.client.db('makesy-dev') : this.client.db('makesy');
            this.db = this.client.db('makesy');
            this.User = new Users(this.db);
            this.Product = new Products(this.db)
        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = new MongoDB();

