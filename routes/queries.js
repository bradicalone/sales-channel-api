
// Variant id
exports.productQuery = (id) => `
query {
    product(id: "gid://shopify/Product/${id}") {
        title
        descriptionHtml
        totalInventory
        totalVariants
        hasOutOfStockVariants
        handle
        tags
        priceRangeV2 {
            minVariantPrice {
                amount
            }
        }
        discount_quantity: metafield(namespace: "bulk_discount", key: "quantity") {
            value
        }
        discount_percent: metafield(namespace: "bulk_discount", key: "percent") {
            value
        }
        has_bulk_discounts: metafield(namespace: "bulk_discount", key: "has_bulk_discounts") {
            value
        }
        more_information: metafield(namespace: "product", key: "details") {
            value
        }
        fly_out: metafield(namespace: "info-block", key: "content") {
            value
        }
        images(first: 10) {
            edges {
                node {
                    width
                    height
                    url
                    altText
                }
            }
        }
        variants(first: 85) {
            edges {
                node {
                    displayName
                    title
                    id
                    price
                    selectedOptions {
                        name
                        value
                    }
                }
            }
        }
    }
}`;

// Collection id 278590193818
exports.collectionQuery = (id) => `
query {
    collection(id: "gid://shopify/Collection/${id}") {
        id
        title
        descriptionHtml
        handle
        products(first: 6) {
            edges {
                node {
                    title
                    id
                    descriptionHtml
                    handle
                    fly_out: metafield(namespace: "info-block", key: "content") {
                        value
                    }
                    discount_quantity: metafield(namespace: "bulk_discount", key: "quantity") {
                        value
                    }
                    discount_percent: metafield(namespace: "bulk_discount", key: "percent") {
                        value
                    }
                    has_bulk_discounts: metafield(namespace: "bulk_discount", key: "has_bulk_discounts") {
                        value
                    }
                    more_information: metafield(namespace: "product", key: "details") {
                        value
                    }
                    priceRangeV2 {
                        minVariantPrice {
                            amount
                        }
                    }
                    images(first: 12) {
                        edges {
                            node {
                                width
                                height
                                url
                                altText
                            }
                        }
                    }
                    variants(first: 40 ) {
                        edges {
                            node {
                                displayName
                                title
                                id
                                price
                                selectedOptions {
                                    name
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}`;

`
query {
    collection(id: "gid://shopify/Collection/276825735322") {
        title

        products(first: 10) {
            edges {
                node {
                    fly_out: metafield(namespace: "info-block", key: "content") {
                        value
                    }
                }
            }
        }
    }
}`

exports.collectionlMetafields = (id) => `
query {
    collection(id: "gid://shopify/Collection/${id}") {
        title
        products(first: 10) {
            edges {
                node {
                    fly_out: metafield(namespace: "info-block", key: "content") {
                        value
                    }
                }
            }
        }
    }
}`

/* Product metafield Admin API */
exports.productMetafields = (id) => `
query {
    product(id: gid://shopify/Product/${id}) {
        metafield(namespace: "bulk_discount", key: "quantity") {
            value
            type
        }
    }
}`;

/* Product metafield Admin API */
//https://shopify.dev/api/admin-graphql/2022-04/queries/product#examples-Get_all_a_product_s_fields_and_connections


/* Shop metafield Admin API */
exports.colorSwatches = () => `
query {
    shop {
        metafield(namespace: "global", key: "color-swatchers") {
            value
            type
        }
    }
}`;




/* Admin Query / Mutation bring metafields into storefront visible */
exports.metafieldVisibility = (namespace, key) => `
    mutation {
        metafieldStorefrontVisibilityCreate(
        input: {
            namespace: "${namespace}"
            key: "${key}"
            ownerType: PRODUCT
        }
        ) {
        metafieldStorefrontVisibility {
            id
            namespace
            key
            ownerType
        }
        userErrors {
            field
            message
        }
        }
    }
`;

/* topic: BULK_OPERATIONS_FINISH */
exports.webhookSubscriptionCreate = (topic) => `
    mutation {
        webhookSubscriptionCreate(
            topic: ${topic}
            webhookSubscription: {
                format: JSON,
                callbackUrl: "https://api.makesy.com/"
            }
        ){
            userErrors {
                field
                message
            }
            webhookSubscription {
                id
            }
        }
    }
`;
// collection(id: "gid://shopify/Collection/278590193818") {


// {
//     "data": {
//       "bulkOperationRunQuery": {
//         "bulkOperation": {
//           "id": "gid://shopify/BulkOperation/1534266179738", // 276825735322
//           "status": "CREATED"
//         },
//         "userErrors": []
//       }
//     },
//     "extensions": {
//       "cost": {
//         "requestedQueryCost": 10,
//         "actualQueryCost": 10,
//         "throttleStatus": {
//           "maximumAvailable": 2000,
//           "currentlyAvailable": 1990,
//           "restoreRate": 100
//         }
//       }
//     }
//   }
// gid://shopify/BulkOperation/1551297937562
exports.retrieveBulkOperation = (id) => `
    query {
        node(id: "${id}") {
        ... on BulkOperation {
                id
                url
                partialDataUrl
            }
        }
    }
`;


// 276825735322
// When the webhook gets configured
exports.bulkOperationRunQuery = (id) =>
`mutation {
    bulkOperationRunQuery(
        query: """
            {
                collection(id: "${id}") {
                    id
                    title
                    descriptionHtml
                    handle
                    products(first: 12) {
                        edges {
                            node {
                                title
                                id
                                descriptionHtml
                                hasOutOfStockVariants
                                handle
                                priceRangeV2 {
                                    minVariantPrice {
                                        amount
                                    }
                                }
                                discount_quantity: metafield(namespace: "bulk_discount", key: "quantity") {
                                    value
                                }
                                discount_percent: metafield(namespace: "bulk_discount", key: "percent") {
                                    value
                                }
                                has_bulk_discounts: metafield(namespace: "bulk_discount", key: "has_bulk_discounts") {
                                    value
                                }
                                fly_out: metafield(namespace: "info-block", key: "content") {
                                    value
                                }
                                images(first: 10) {
                                    edges {
                                        node {
                                            id
                                            width
                                            height
                                            url
                                            altText
                                        }
                                    }
                                }
                                variants(first: 80) {
                                    edges {
                                        node {
                                            displayName
                                            title
                                            id
                                            price
                                            selectedOptions {
                                                name
                                                value
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        """
    ) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
}
`

exports.queryUpdateCollections = () => 
`query {
      collections(first: 100, query: "title:'ROUND WICKS' OR title:'MINI WICK SAMPLE KITS' OR title:'WHISPER WICKS' OR title:'THE WICK SAMPLE KITS' OR title:'X WICKS' OR title:'CUST NATURAL X WICKS' 
      OR title:'CRACKLING FLAT WICKS' OR title:'CUST COLOR FLAT WICKS' OR title:'FLAT' OR title:'CALM WICKS'  OR title:'Cust Color X Wicks' OR title:'GLOW WICKS'  OR title:'HOPE WICKS' OR title:'MOM WICKS'  
      OR title:'COZY WICKS'  OR title:'DREAM WICKS'  OR title:'WISH WICKS'  OR title:'PEACE WICKS' OR title:'LUCK WICKS'  OR title:'LOVE WICKS'  OR title:'JOY WICKS'  
      OR title:'HOPE WICKS' OR title:'THE CUSTOM WICKS' OR title:'Cust Word Wicks' ") {
          edges {
              node {
              title
              id
              }
          }
      }
  }
`

exports.queryAddCollections = (title) => // Not tested
`
    query {
        collections(first: 100, query: "title:${title} ") {
            edges {
                node {
                title
                id
                }
            }
        }
    }
`

/* Get a collection by handle */
exports.bulkOperationRunQueryCollection = (handle) => `
mutation {
    bulkOperationRunQuery(
        query: """ {
                collectionByHandle(handle: "shop-wood-wicks") {
                    products(first: 10) {
                        edges {
                            node {
                                title
                                id
                                descriptionHtml
                                handle
                                fly_out: metafield(namespace: "info-block", key: "content") {
                                    value
                                }
                                priceRangeV2 {
                                    minVariantPrice {
                                        amount
                                    }
                                }
                                images(first: 7) {
                                    edges {
                                        node {
                                        width
                                        height
                                        url
                                        altText
                                        }
                                    }
                                }
                                variants(first: 80) {
                                    edges {
                                        node {
                                            displayName
                                            title
                                            id
                                            price
                                            selectedOptions {
                                                name
                                                value
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            """
        )
        {
            bulkOperation {
              id
              status
            }
            userErrors {
              field
              message
            }
        }
    }
`

// `query {
//     collections(first:2) {
//       edges {
//         node {
//           id
//           title
//         }
//       }
//     }
//   }`

// `  query{
//     collectionByHandle(handle: "shop-wood-wicks") {
//       products(first: 20) {
//         edges {
//           node {
//             title
//             id
//           }
//         }
//       }
//     }
//   }`





/* ***  NOT BEING USED YET  *** */

// const productQuery = () => `
// {
//     products( first: 10) {
//         edges {
//             node {
//                 id
//                 handle
//                 title

//                 variants(first: 10){
//                     edges {
//                         node {
//                             title
//                         }
//                     }
//                 }
//             }
//         }  
//     }
// }`; 