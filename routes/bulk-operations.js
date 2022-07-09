const express = require('express')
const router = express.Router()
const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');
const Db = require('../db/mongodb');
const { webhookSubscriptionCreate, bulkOperationRunQuery, bulkOperationRunQueryCollection,
    queryUpdateCollections, retrieveBulkOperation, queryAddCollections } = require('./queries')
const { replaceCollectionProps } = require('../helpers');

// setTimeout(()=>{
//     const products = Db.Product.getCollection({ 'bulkOperation.id': 'gid://shopify/BulkOperation/1603039428762' })
// .then(collection => console.log('C',collection)).catch(err => console.log(err))
// },2000)

// const Collection = {
//     collection: {
//       title: 'THE WICK SAMPLE KITS',
//       id: 'gid://shopify/Collection/216064753818',
//       products: [{test: 'testProduct'}]
//     },
//     bulkOperation: {
//       id: 'gid://shopify/BulkOperation/1603039428762',
//       status: 'CREATED'
//     },
//     userErrors: []
//   }
// setTimeout(()=>{
//     const products = Db.Product.updateDocumentByCollectionId(Collection)
// .then(collection => console.log('C',collection)).catch(err => console.log(err))
// },2000)


const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY } = process.env;
/* Admin url graphql */
const GRAPHQL_URL = `https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2022-01/graphql.json`

const GRAPHQL_BODY = (query) => {
    return {
        'async': true,
        'crossDomain': true,
        'method': 'POST',
        'headers': {
            'X-Shopify-Access-Token': SHOPIFY_API_SECRET,
            'Content-Type': 'application/graphql',
        },
        'body': query
    };
}

router.post('/webhook-subscription', async (req, res) => {
    fetch(GRAPHQL_URL, GRAPHQL_BODY(webhookSubscriptionCreate("BULK_OPERATIONS_FINISH")))
        .then(res => res.json())
        .then(data => {
            console.log('data:', data)
            console.log('webhookSubscriptionCreate', data.data)
            res.json(data) // webhookSubscription: { id: 'gid://shopify/WebhookSubscription/1133801144474' }
        })
        .catch(err => console.log(err))
})


class ProductOperation {
    constructor() {
        this.collections = [];
        this._operation = 'update'
    }

    loadOperations(collections, operation) {
        this.collections = collections;
        this._operation = operation
    }

    getOperation() {
        try {
            return this.collections.shift().node
        } catch {
            return false
        }
    }

    runBulkOperation(collection) {
        fetch(GRAPHQL_URL, GRAPHQL_BODY(bulkOperationRunQuery(collection.id)))
            .then(res => res.json())
            .then(query => {
                console.log('query:', query.data.bulkOperationRunQuery)
                console.log('this._operation:', this._operation)

                // Save collections and bulkOperation to database to be checked at /bulk_operations/finish webook next.
                if(this._operation === 'add') Db.Product.addCollection({ ...query.data.bulkOperationRunQuery, collection: collection }) // Not tested
                if(this._operation === 'update') Db.Product.updateDocumentByCollectionId({ ...query.data.bulkOperationRunQuery, collection: collection })
                .then(prod => console.log('PROD', prod))
                .catch(e => console.log(e))
            })
            .catch(err => console.log(err))
    }
};
const productOperation = new ProductOperation();


/* Query large data from shopify, collection with all the ids to loop through for every wick collection
*  which updates any collection 
* id: string of collection gid: id 
*/
router.post('/update-collections', async (req, res) => {

    fetch(GRAPHQL_URL, GRAPHQL_BODY(queryUpdateCollections()))
        .then(res => res.json())
        .then(json => {
            const collections = json.data.collections?.edges
            productOperation.loadOperations(collections, 'update')
            const collection = productOperation.getOperation()
            productOperation.runBulkOperation(collection)
            res.json(collection)
        })
        .catch(err => console.log(err))
})

router.post('/add-collections', async (req, res) => {

    fetch(GRAPHQL_URL, GRAPHQL_BODY(queryAddCollections('Cust Color X Wicks'))) 
        .then(res => res.json())
        .then(json => {
            const collections = json.data.collections?.edges
            productOperation.loadOperations(collections, 'add')
            const collection = productOperation.getOperation()
            productOperation.runBulkOperation(collection)
            res.json(collection)
        })
        .catch(err => console.log(err))
})


/* Webhook for bulk operations */
router.post('/bulk_operations/finish', async (req, res) => {
    console.log('callback/bulk_operations/finish:')
    try {

        const id = req.body.admin_graphql_api_id
        // Gets url to make / download the json lines file
        const retrivalRes = await fetch(GRAPHQL_URL, GRAPHQL_BODY(retrieveBulkOperation(id)))
        const response = await retrivalRes.json()
        console.log('response:', response)

        if (!response.data.node) throw 'Bulk Operation Failed @ bulk_operations/finish'
        const bulkOperation = response.data.node.id

        // Checks that bulk operation id is the same id used from the bulkOperationRunQuery
        const collection = await Db.Product.getCollection({ "bulkOperation.id": bulkOperation }).then(collection => collection).catch(err => console.log(err))

        // Lets shopify know the bulk operation is done
        res.sendStatus(200);

        const url = response.data.node?.url

        // If url doesn't exist, skips adding to db and runs the next operation
        if (!url) {
            // Gets new collection from array, if array is empty then operation is done
            const operation = productOperation.getOperation()
            console.log('operation bulk-operations.js 125:', operation)

            // Runs another operation from the collection array untill operation array is empty
            if(operation) return productOperation.runBulkOperation(operation)
        }

        processLineByLine(url, collection, res)
        // Gets new collection from array, if array empty then operation is done
        const operation = productOperation.getOperation()
        // Runs another operation from the collection array untill operation array is empty
        if(operation) productOperation.runBulkOperation(operation)
    } catch (err) {
        console.log('err:', err)
        res.send({ error: err })
    }
})


const https = require('https');
async function processLineByLine(url, collection, res) {
    try {

        https.get(url, (response) => {
            let writeStream = fs.createWriteStream('db.jsonl');
            response.pipe(writeStream)

            writeStream.on('finish', async function () {
                const file = fs.createReadStream('db.jsonl');

                const jsonl = readline.createInterface({
                    input: file,
                    crlfDelay: Infinity
                });

                const json = []
                for await (const line of jsonl) {
                    json.push(JSON.parse(line))
                }

                const products = []
                let product_count = 0
                const deepIterator = (target) => {
                    if (typeof target === 'object') {
                        for (const key in target) {

                            if (key == 'id') {
                                const product = products[product_count]
                                const { prop, id } = target[key].match(/g.+\/(?<prop>\w.+)\/(?<id>\d+)/i).groups
                                target.id = id

                                if (target.__parentId) {
                                    const property = replaceCollectionProps(prop)
                                    return product[property] ? product[property].push(target) : product[property] = [target]
                                }
                                products.push(target)
                                product_count = products.length - 1
                            }
                            deepIterator(target[key]);
                        }
                    }
                }
                deepIterator(json)
                collection.collection.products = products

                const prod = Db.Product.updateCollection({ ...collection }).then(collection => console.log('C', collection)).catch(err => console.log(err))
                // res.send(collection)
                writeStream.close();
            });
        });
    } catch (e) {
        console.log('error:', e)
    }
}

/* Query large data from shopify, collection with handle
* id: 
*/
router.post('/bulk-operation', async (req, res) => {

    const id = req.body.id
    console.log('id:', id)
    fetch(GRAPHQL_URL, GRAPHQL_BODY(bulkOperationRunQueryCollection(id)))
        .then(res => res.json())
        .then(data => {
            console.log('data:', data)
            console.log('bulkOperationRunQueryCollection', data.data)

            res.json(data)
        })
        .catch(err => console.log(err))
})

router.post('/test', async (req, response) => {
    const id = req.body.id
    console.log('id:', id)

    fetch(GRAPHQL_URL, GRAPHQL_BODY(retrieveBulkOperation(id)))
        .then(res => res.json())
        .then(data => {
            console.log('data:', data)
            console.log('bulkOperationRunQuery', data.data)

        })
        .catch(err => console.log(err))
})

module.exports = router