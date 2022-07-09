const express = require('express')
const router = express.Router()
const fetch = require('node-fetch');
const Db = require('../db/mongodb');
const { productQuery, collectionQuery, metafieldVisibility, retrieveBulkOperation } = require('./queries')
const { getHeaderLink, ipValidator, removeProductKeys } = require('../helpers');

const { SHOPIFY_API_SECRET, SHOPIFY_API_KEY } = process.env;

/* Admin url graphql */
const GRAPHQL_URL = `https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2022-01/graphql.json`


/* id needs to be collection id */
router.post('/collections-all', async (req, res) => {
    const id = req.body.id
    console.log('collections-all id:', id)
    let catchErrorProducts = {}
    try {
        const response = await fetch(`https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2019-07/products.json?collection_id=${id}&limit=250`)
        const firstProducts = await response.json()
        /* Incase second request fails at least sends off first round of products */
        catchErrorProducts = firstProducts

        const link = getHeaderLink(response)
        const nextResultURL = `https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2019-07/products.json?${link}`

        const secondResponse = await fetch(nextResultURL)
        const secondProducts = await secondResponse.json()

        res.send([...firstProducts.products, ...secondProducts.products])

    } catch (err) {
        console.log('err:', err)
        res.send([...catchErrorProducts.products])
    }
})

router.get('/', function (req, res) {
    res.send('<h1 style="text-align: center">We Love Makesy</h1>')
})

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


/* Single Product */
router.post('/product', (req, res) => {
    const id = req.body.id
    console.log('graphQL Product id:', id)
    fetch(GRAPHQL_URL, GRAPHQL_BODY(productQuery(id)))
        .then(res => res.json())
        .then(data => {
            removeProductKeys(data)
            res.json(data)
        })
        .catch(err => console.log(err))
})

router.post('/product-test', (req, res) => {
    const id = req.body.id
    console.log('graphQL Product id:', id)
    fetch(GRAPHQL_URL, GRAPHQL_BODY(productQuery(id)))
        .then(res => res.json())
        .then(data => {
            removeProductKeys(data)
            res.json(data)
        })
        .catch(err => console.log(err))
})


/* Products part of a collection */
router.post('/collection-products', (req, res) => {
    // Collection id
    const id = req.body.id
    console.log('graphQL Collection id:', id)
    fetch(GRAPHQL_URL, GRAPHQL_BODY(collectionQuery(id)))
        .then(res => res.json())
        .then(data => {
            res.json(data)
        })
        .catch(err => console.log(err))
})

router.post('/db-collections', async (req, res) => {
    try {
        // Collection id
        const id = req.body.id
        console.log('graphQL Collection db:', id)
        const products = await Db.Product.getCollectionProducts(id)
        res.json(products)
    } catch(err) {
        console.log('err:', err)
    }
})

/* Get all products max 250 (test) */
router.post('/products', (req, res) => {
    const collectionId = req.body.collectionId
    console.log('collectionId:', collectionId)
    fetch(`https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2022-01/products.json?collection_id=${collectionId}&limit=250`)
        .then(res => res.json())
        .then(json => {
            res.json(json)
        })
        .catch(err => console.log(err))
})

/* Store Metafields */
router.get('/metafields', (req, res) => {
    fetch(`https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2022-04/metafields.json?
        metafield[owner_id]=${7213351239834}&metafield[owner_resource]=${'products'}`)
        .then(res => res.json())
        .then(json => {
            res.json(json)
        })
        .catch(err => console.log(err))
})

/* Get collection by ID */
router.post('/collections', async (req, res) => {
    const id = req.body.collectionId
    console.log('collectionId:', id)
        .catch(err => console.log(err))
    fetch(`https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2022-04/collections/${id}/products.json?limit=250`)
        .then(res => res.json())
        .then(json => {
            res.json(json)
        })
        .catch(err => console.log(err))
});




router.post('/checkout', (req, res) => {
    const token = req.body.token
    console.log('token:', token)
    fetch(`https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET}@thewoodenwickco.myshopify.com/admin/api/2021-10/checkouts/${token}.json`)
        .then(res => res.json())
        .then(json => {
            res.json(json)
        })
        .catch(err => console.log(err))
})

/*
* retrieve id: "gid://shopify/BulkOperation/1535156256922"
*
*/
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